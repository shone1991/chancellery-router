const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const client = new Anthropic();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir).catch(() => {}); // Ignore if exists

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  next();
});

// Department database (can be connected to actual database)
const departmentDatabase = {
  'Ministry of Education': {
    head: 'Dr. Oybek Khaitov',
    keywords: ['education', 'school', 'university', 'student', 'curriculum', 'teaching', 'academic'],
    description: 'Handles educational matters, policies, and correspondence'
  },
  'Ministry of Finance': {
    head: 'Jamshid Kuchkarov',
    keywords: ['budget', 'finance', 'funding', 'tax', 'accounting', 'fiscal', 'payment', 'monetary'],
    description: 'Manages financial matters and budgetary allocations'
  },
  'Ministry of Health': {
    head: 'Dr. Alisher Shadmanov',
    keywords: ['health', 'medical', 'hospital', 'patient', 'disease', 'vaccination', 'clinic', 'healthcare'],
    description: 'Oversees health services and medical policies'
  },
  'Ministry of Infrastructure': {
    head: 'Adham Khanov',
    keywords: ['infrastructure', 'construction', 'road', 'bridge', 'transport', 'building', 'project', 'development'],
    description: 'Manages infrastructure projects and development'
  },
  'Ministry of Internal Affairs': {
    head: 'Pulat Khaitov',
    keywords: ['security', 'police', 'law enforcement', 'order', 'regulation', 'compliance', 'safety'],
    description: 'Handles security and internal affairs'
  },
  'Ministry of Environment': {
    head: 'Davron Khuzhaev',
    keywords: ['environment', 'ecology', 'pollution', 'water', 'air', 'green', 'sustainability', 'natural'],
    description: 'Focuses on environmental protection and sustainability'
  },
  'Ministry of Labor': {
    head: 'Nozim Khaitov',
    keywords: ['employment', 'labor', 'worker', 'wage', 'benefits', 'pension', 'workplace', 'job'],
    description: 'Manages labor relations and employment matters'
  },
  'Ministry of Agriculture': {
    head: 'Bekzod Khaitov',
    keywords: ['agriculture', 'farm', 'crop', 'livestock', 'soil', 'harvest', 'rural', 'farming'],
    description: 'Oversees agricultural policies and farming matters'
  },
  'Ministry of Culture': {
    head: 'Mohinur Mirkhanova',
    keywords: ['culture', 'art', 'heritage', 'museum', 'historical', 'cultural', 'tourism', 'tradition'],
    description: 'Manages cultural affairs and heritage preservation'
  },
  'Ministry of Foreign Affairs': {
    head: 'Abdulaziz Khaitov',
    keywords: ['international', 'foreign', 'embassy', 'diplomat', 'agreement', 'treaty', 'cooperation', 'bilateral'],
    description: 'Handles international relations and diplomatic affairs'
  }
};

/**
 * Extract text and analyze document using Claude Vision
 */
async function analyzeDocument(filePath, fileName) {
  const fileBuffer = await fs.readFile(filePath);
  const base64Data = fileBuffer.toString('base64');
  
  // Determine media type
  const ext = path.extname(fileName).toLowerCase();
  let mediaType = 'application/pdf';
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    mediaType = `image/${ext === '.png' ? 'png' : 'jpeg'}`;
  }

  // Call Claude with vision to extract and analyze content
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document' || 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data
            }
          },
          {
            type: 'text',
            text: `Analyze this official correspondence document and provide:
1. Main subject/title
2. Key topics and keywords (comma-separated)
3. Primary purpose (brief)
4. Any mentioned departments or agencies
5. Urgency level (High/Medium/Low)
6. Document type (Directive/Request/Notification/Complaint/Other)

Format your response as JSON with these exact keys: subject, keywords, purpose, mentioned_departments, urgency, document_type`
          }
        ]
      }
    ]
  });

  // Extract JSON from response
  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = textContent.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Claude response:', textContent.text);
    // Fallback: return empty analysis
    return {
      subject: fileName,
      keywords: [],
      purpose: 'Unable to parse',
      mentioned_departments: [],
      urgency: 'Medium',
      document_type: 'Unknown'
    };
  }
}

/**
 * Categorize document and rank departments
 */
function categorizeDepartments(analysis) {
  const keywordsList = Array.isArray(analysis.keywords)
    ? analysis.keywords
    : (typeof analysis.keywords === 'string'
        ? analysis.keywords.split(',').map(k => k.trim().toLowerCase())
        : []);

  const departmentScores = {};

  // Initialize all departments with score 0
  Object.keys(departmentDatabase).forEach(dept => {
    departmentScores[dept] = {
      score: 0,
      matchedKeywords: [],
      head: departmentDatabase[dept].head
    };
  });

  // Score each department
  Object.entries(departmentDatabase).forEach(([dept, data]) => {
    let score = 0;
    const matched = [];

    data.keywords.forEach(keyword => {
      // Check if keyword appears in analysis keywords or subject/purpose
      const inKeywords = keywordsList.some(k => 
        k.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(k)
      );
      
      const inText = 
        (analysis.subject?.toLowerCase().includes(keyword.toLowerCase()) || false) ||
        (analysis.purpose?.toLowerCase().includes(keyword.toLowerCase()) || false);

      if (inKeywords) {
        score += 3; // Higher weight for direct keyword match
        matched.push(keyword);
      } else if (inText) {
        score += 2;
        matched.push(keyword);
      }
    });

    // Boost score if department is mentioned
    if (Array.isArray(analysis.mentioned_departments)) {
      if (analysis.mentioned_departments.some(m => 
        dept.toLowerCase().includes(m.toLowerCase()) || 
        m.toLowerCase().includes(dept.toLowerCase())
      )) {
        score += 5;
      }
    }

    departmentScores[dept] = {
      score,
      matchedKeywords: matched,
      head: departmentDatabase[dept].head
    };
  });

  // Sort departments by score (descending)
  const sorted = Object.entries(departmentScores)
    .filter(([_, data]) => data.score > 0)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([dept, data]) => ({
      department: dept,
      head: data.head,
      score: data.score,
      matchedKeywords: data.matchedKeywords,
      description: departmentDatabase[dept].description
    }));

  return sorted;
}

/**
 * Main API endpoint for document processing
 */
app.post('/api/process-correspondence', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        success: false
      });
    }

    // Analyze document
    const analysis = await analyzeDocument(req.file.path, req.file.originalname);

    // Categorize and rank departments
    const departments = categorizeDepartments(analysis);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    // Return response
    res.json({
      success: true,
      documentAnalysis: {
        fileName: req.file.originalname,
        subject: analysis.subject,
        purpose: analysis.purpose,
        documentType: analysis.document_type,
        urgency: analysis.urgency,
        keywords: analysis.keywords
      },
      routingResult: {
        primaryDepartment: departments.length > 0 ? departments[0] : null,
        allDepartments: departments,
        totalMatches: departments.length,
        recommendation: departments.length > 0
          ? `Primary routing to ${departments[0].department} (Head: ${departments[0].head}). Secondary review by ${departments.slice(1, 3).map(d => d.department).join(', ')}.`
          : 'No matching departments found. Manual review required.'
      }
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({
      error: error.message || 'Error processing document',
      success: false
    });
  }
});

/**
 * Bulk processing endpoint
 */
app.post('/api/process-bulk', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        success: false
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        const analysis = await analyzeDocument(file.path, file.originalname);
        const departments = categorizeDepartments(analysis);
        
        results.push({
          fileName: file.originalname,
          success: true,
          analysis,
          routing: {
            primary: departments[0] || null,
            all: departments
          }
        });

        // Clean up
        await fs.unlink(file.path);
      } catch (error) {
        results.push({
          fileName: file.originalname,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      processedFiles: results.length,
      results
    });
  } catch (error) {
    console.error('Error in bulk processing:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

/**
 * Get available departments
 */
app.get('/api/departments', (req, res) => {
  const departments = Object.entries(departmentDatabase).map(([name, data]) => ({
    name,
    head: data.head,
    keywords: data.keywords,
    description: data.description
  }));

  res.json({
    success: true,
    departments,
    total: departments.length
  });
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Chancellery Correspondence Router',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message,
    success: false
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chancellery Correspondence Router API running on port ${PORT}`);
  console.log(`POST /api/process-correspondence - Process single document`);
  console.log(`POST /api/process-bulk - Process multiple documents`);
  console.log(`GET /api/departments - List all departments`);
});
