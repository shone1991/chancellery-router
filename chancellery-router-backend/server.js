require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { scrapeDepartments } = require('./scraper');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 15 * 1024 * 1024 }
});

// Departments loaded from scraper: [{ id, name, head }]
let departments = [];

async function loadDepartments() {
  const url = process.env.SCRAPER_URL;
  if (!url) {
    console.warn('SCRAPER_URL not set — departments will be empty');
    return;
  }
  try {
    departments = await scrapeDepartments(url);
    console.log(`Loaded ${departments.length} departments from ${url}`);
  } catch (err) {
    console.error('Failed to scrape departments:', err.message);
  }
}

async function analyze(filePath, fileMime, fileName) {
  const base64 = (await fsp.readFile(filePath)).toString('base64');

  const deptList = departments.length
    ? departments.map(d => `- ${d.name}`).join('\n')
    : 'No departments available';

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: fileMime === 'application/pdf' ? 'application/pdf' : fileMime,
              data: base64
            }
          },
          {
            type: 'text',
            text: `Siz Jizzax Politexnika Instituti kancellyariyasining hujjat yo'naltirish tizimisiz.
Quyidagi hujjatni tahlil qiling va tegishli kafedra(lar)ga yo'naltiring.

Institutdagi mavjud kafedralar (faqat shu ro'yxatdan foydalaning):
${deptList}

Faqat to'g'ri JSON qaytaring (markdown yoki izoh yo'q):

{
  "summary_uz": "Hujjatning qisqacha mazmuni o'zbek tilida (2-3 gap)",
  "subject": "Hujjat mavzusi bir gapda o'zbek tilida",
  "documentType": "Xat/Ariza/Hisobot/So'rov/Farmoyish/Boshqa",
  "urgency": "Yuqori/O'rta/Past",
  "purpose": "Hujjatning maqsadi qisqacha o'zbek tilida",
  "keywords": ["kalit so'z1", "kalit so'z2", "kalit so'z3"],
  "departments": [
    {
      "name": "ro'yxatdagi kafedra nomini aynan ko'chiring",
      "confidence": 85,
      "reason": "nima uchun bu kafedra javobgar"
    }
  ]
}

MUHIM:
- Faqat yuqoridagi ro'yxatdagi kafedra nomlarini ishlating, o'zgartirmasdan aynan ko'chiring
- Hujjat bir nechta kafedrani qamrab olsa, barchasini kiriting
- Hujjat butun institut yoki barcha kafedralarni qamrab olsa ham, eng tegishlilarini confidence bo'yicha tartibling
- confidence 0 dan 100 gacha
- Natijalarni confidence bo'yicha kamayish tartibida joylashtiring`
          }
        ]
      }
    ]
  });

  const text = response.content.find(c => c.type === 'text')?.text;

  let parsed;
  try {
    const raw = text.match(/\{[\s\S]*\}/)?.[0];
    if (!raw) throw new Error('No JSON found in response');

    // Normalize Uzbek curly apostrophes to straight ones so JSON.parse accepts them
    const sanitized = raw
      .replace(/\u2018|\u2019|\u02bc|\u0027/g, "'")  // various apostrophe variants
      .replace(/[\u0000-\u001F\u007F]/g, ' ');        // strip control chars

    parsed = JSON.parse(sanitized);
  } catch (err) {
    console.error('Parse error:', err);
    console.error('Raw response snippet:', text?.slice(0, 500));
    throw new Error('Failed to parse AI response');
  }

  // Normalize helper: lowercase + collapse spaces + strip punctuation
  const norm = s => s.toLowerCase().replace(/[''`]/g, "'").replace(/\s+/g, ' ').trim();

  // Build ranked department list, merging head info from scraped data
  const rankedDepts = (parsed.departments || []).map(d => {
    const dNorm = norm(d.name);
    // 1) exact normalized match
    let scraped = departments.find(sd => norm(sd.name) === dNorm);
    // 2) one contains the other (handles minor truncation/addition by Claude)
    if (!scraped) {
      scraped = departments.find(
        sd => norm(sd.name).includes(dNorm) || dNorm.includes(norm(sd.name))
      );
    }
    return {
      department: scraped ? scraped.name : d.name,
      head: scraped?.head || '',
      description: d.reason || '',
      score: Math.round(((d.confidence || 0) / 100) * 30),
      matchedKeywords: parsed.keywords || []
    };
  });

  return {
    documentAnalysis: {
      fileName,
      subject: parsed.subject || '',
      documentType: parsed.documentType || 'Boshqa',
      urgency: parsed.urgency || "O'rta",
      purpose: parsed.purpose || '',
      keywords: parsed.keywords || [],
      summaryUz: parsed.summary_uz || ''
    },
    routingResult: {
      primaryDepartment: rankedDepts[0] || null,
      allDepartments: rankedDepts,
      recommendation: rankedDepts[0]
        ? `${rankedDepts[0].department} kafedrasiga yo'naltiring. ${rankedDepts[0].description}`
        : 'Tegishli kafedra topilmadi'
    }
  };
}

// POST /api/process-correspondence
app.post('/api/process-correspondence', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const result = await analyze(req.file.path, req.file.mimetype, req.file.originalname);
    await fsp.unlink(req.file.path);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Processing error:', err);
    fsp.unlink(req.file.path).catch(() => {});
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/departments
app.get('/api/departments', (req, res) => {
  res.json({ departments, total: departments.length });
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'University Correspondence Router', version: '1.0.0' });
});

const PORT = process.env.PORT || 3001;

loadDepartments().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
