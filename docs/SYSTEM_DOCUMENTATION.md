# Chancellery Correspondence Router - System Documentation

## Overview

The **Chancellery Correspondence Router** is an intelligent document processing system that automatically analyzes incoming business correspondence (PDF, JPEG, PNG formats) and categorizes them for routing to the appropriate government departments. The system uses Claude's vision capabilities to extract content, analyze context, and rank departments by relevance.

### Key Features

- **Intelligent Document Analysis**: Uses Claude AI to analyze document content, extract keywords, and determine document type
- **Smart Department Ranking**: Automatically ranks relevant departments based on keyword matching and context analysis
- **Multi-file Processing**: Support for bulk processing of multiple documents simultaneously
- **Department Management**: Extensible database of government departments with heads and keyword associations
- **RESTful API**: Easy-to-integrate API endpoints for document processing
- **Modern Dashboard**: Professional web interface for submission and result viewing
- **Export & Print**: Results can be printed or exported for official records

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                 Document Upload Dashboard                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │  File Handler   │  │  Department DB   │                  │
│  │  (Multer)       │  │  (In-Memory)     │                  │
│  └────────┬────────┘  └──────────────────┘                  │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────────────────────────┐                    │
│  │   Document Analyzer                 │                    │
│  │   (Claude Vision API Integration)   │                    │
│  └────────────┬────────────────────────┘                    │
│               │                                               │
│               ▼                                               │
│  ┌─────────────────────────────────────┐                    │
│  │   Category Scorer                   │                    │
│  │   (Keyword Matching & Ranking)      │                    │
│  └─────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
                    (Response JSON)
```

---

## Installation & Setup

### Prerequisites

- **Node.js** v14.0.0 or higher
- **npm** or **yarn** package manager
- **Anthropic API Key** (for Claude access)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Backend Setup

#### Step 1: Install Dependencies

```bash
# Navigate to backend directory
cd chancellery-router-backend

# Install Node dependencies
npm install
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=your_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Getting your Anthropic API Key:**
1. Visit [Anthropic Console](https://console.anthropic.com)
2. Create an account or login
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste into `.env` file

#### Step 3: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3001`

### Frontend Setup

#### Step 1: Create React App

```bash
# Create a new React application
npx create-react-app chancellery-router-frontend

cd chancellery-router-frontend
```

#### Step 2: Copy Frontend Files

Copy the following files to your React app:
- `DepartmentRoutingDashboard.jsx` → `src/App.js`
- `App.css` → `src/App.css`

#### Step 3: Configure API URL

Update `src/App.js` to set the correct API URL:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

Or create a `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001
```

#### Step 4: Start Frontend Server

```bash
npm start
```

Frontend will open on `http://localhost:3000`

---

## API Endpoints

### 1. Process Single Document

**Endpoint:** `POST /api/process-correspondence`

**Description:** Analyzes a single document and returns ranked departments for routing.

**Request:**
```bash
curl -X POST http://localhost:3001/api/process-correspondence \
  -F "file=@/path/to/document.pdf"
```

**Request Parameters:**
- `file` (form-data, required): Single PDF, JPEG, or PNG file

**Response:**
```json
{
  "success": true,
  "documentAnalysis": {
    "fileName": "education_directive.pdf",
    "subject": "New Curriculum Guidelines for Secondary Schools",
    "purpose": "Establish updated curriculum standards for all secondary educational institutions",
    "documentType": "Directive",
    "urgency": "High",
    "keywords": ["education", "curriculum", "school", "teaching", "academic"]
  },
  "routingResult": {
    "primaryDepartment": {
      "department": "Ministry of Education",
      "head": "Dr. Oybek Khaitov",
      "score": 15,
      "matchedKeywords": ["education", "curriculum", "teaching", "academic"],
      "description": "Handles educational matters, policies, and correspondence"
    },
    "allDepartments": [
      {
        "department": "Ministry of Education",
        "head": "Dr. Oybek Khaitov",
        "score": 15,
        "matchedKeywords": ["education", "curriculum", "teaching"],
        "description": "Handles educational matters, policies, and correspondence"
      },
      {
        "department": "Ministry of Labor",
        "head": "Nozim Khaitov",
        "score": 4,
        "matchedKeywords": ["employment", "workplace"],
        "description": "Manages labor relations and employment matters"
      }
    ],
    "totalMatches": 2,
    "recommendation": "Primary routing to Ministry of Education (Head: Dr. Oybek Khaitov). Secondary review by Ministry of Labor."
  }
}
```

**Status Codes:**
- `200 OK`: Document processed successfully
- `400 Bad Request`: No file provided or invalid format
- `500 Internal Server Error`: Server error during processing

---

### 2. Bulk Process Documents

**Endpoint:** `POST /api/process-bulk`

**Description:** Processes multiple documents in a single request.

**Request:**
```bash
curl -X POST http://localhost:3001/api/process-bulk \
  -F "files=@document1.pdf" \
  -F "files=@document2.jpeg" \
  -F "files=@document3.png"
```

**Request Parameters:**
- `files` (form-data, required): Multiple files (up to 10 files)

**Response:**
```json
{
  "success": true,
  "processedFiles": 3,
  "results": [
    {
      "fileName": "education_directive.pdf",
      "success": true,
      "analysis": {
        "subject": "New Curriculum Guidelines",
        "keywords": ["education", "curriculum"],
        "purpose": "Update curriculum standards",
        "mentioned_departments": [],
        "urgency": "High",
        "document_type": "Directive"
      },
      "routing": {
        "primary": {
          "department": "Ministry of Education",
          "head": "Dr. Oybek Khaitov",
          "score": 15
        },
        "all": [
          {
            "department": "Ministry of Education",
            "head": "Dr. Oybek Khaitov",
            "score": 15
          }
        ]
      }
    },
    {
      "fileName": "health_notification.jpeg",
      "success": true,
      "analysis": {
        "subject": "Health Service Update",
        "keywords": ["health", "medical", "patient"],
        "purpose": "Notify of new health initiatives",
        "mentioned_departments": [],
        "urgency": "Medium",
        "document_type": "Notification"
      },
      "routing": {
        "primary": {
          "department": "Ministry of Health",
          "head": "Dr. Alisher Shadmanov",
          "score": 12
        },
        "all": []
      }
    },
    {
      "fileName": "invalid_document.txt",
      "success": false,
      "error": "Invalid file format. Only PDF and image files are allowed."
    }
  ]
}
```

---

### 3. Get Available Departments

**Endpoint:** `GET /api/departments`

**Description:** Retrieves list of all available departments with their details.

**Request:**
```bash
curl http://localhost:3001/api/departments
```

**Response:**
```json
{
  "success": true,
  "departments": [
    {
      "name": "Ministry of Education",
      "head": "Dr. Oybek Khaitov",
      "keywords": ["education", "school", "university", "student", "curriculum"],
      "description": "Handles educational matters, policies, and correspondence"
    },
    {
      "name": "Ministry of Finance",
      "head": "Jamshid Kuchkarov",
      "keywords": ["budget", "finance", "funding", "tax", "accounting"],
      "description": "Manages financial matters and budgetary allocations"
    }
  ],
  "total": 10
}
```

---

### 4. Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if API server is running.

**Request:**
```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "Chancellery Correspondence Router",
  "version": "1.0.0"
}
```

---

## Department Database

The system comes pre-configured with 10 government departments. Each department has:

1. **Name**: Official department name
2. **Head**: Department head name and surname
3. **Keywords**: List of keywords associated with the department
4. **Description**: Department's role and responsibilities

### Available Departments

| Department | Head | Keywords |
|-----------|------|----------|
| Ministry of Education | Dr. Oybek Khaitov | education, school, university, curriculum |
| Ministry of Finance | Jamshid Kuchkarov | budget, finance, funding, tax, accounting |
| Ministry of Health | Dr. Alisher Shadmanov | health, medical, hospital, patient, disease |
| Ministry of Infrastructure | Adham Khanov | infrastructure, construction, road, bridge |
| Ministry of Internal Affairs | Pulat Khaitov | security, police, law enforcement, order |
| Ministry of Environment | Davron Khuzhaev | environment, ecology, pollution, water, air |
| Ministry of Labor | Nozim Khaitov | employment, labor, worker, wage, benefits |
| Ministry of Agriculture | Bekzod Khaitov | agriculture, farm, crop, livestock, soil |
| Ministry of Culture | Mohinur Mirkhanova | culture, art, heritage, museum, tourism |
| Ministry of Foreign Affairs | Abdulaziz Khaitov | international, foreign, embassy, diplomat |

### Customizing Departments

To add or modify departments, edit the `departmentDatabase` object in `server.js`:

```javascript
const departmentDatabase = {
  'Ministry of Name': {
    head: 'First Last Name',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    description: 'Department description'
  },
  // Add more departments...
};
```

---

## Document Processing Flow

### Step 1: File Upload
User uploads a PDF or image file through the dashboard.

### Step 2: File Validation
Backend validates:
- File size
- File type (PDF, JPEG, PNG)
- Malware/security scan (optional)

### Step 3: Document Analysis
Claude Vision API:
- Extracts text from document
- Identifies document subject
- Extracts keywords
- Determines document type (Directive, Request, Notification, Complaint, etc.)
- Assesses urgency level
- Lists mentioned departments

### Step 4: Scoring & Ranking
Algorithm:
- Matches extracted keywords with department keywords (3 points each)
- Checks subject/purpose text for department keywords (2 points each)
- Boosts score if department is explicitly mentioned (+5 points)
- Filters out departments with 0 score
- Sorts departments by score (descending)

### Step 5: Response Generation
Returns:
- Document analysis results
- Primary department (highest score)
- All matching departments in ranked order
- Routing recommendation

---

## Error Handling

### Common Errors

**Error: "No file uploaded"**
- Cause: Request sent without file
- Solution: Ensure file is attached to request in `files` field

**Error: "Invalid file format"**
- Cause: File type not supported (only PDF, JPEG, PNG)
- Solution: Convert document to supported format

**Error: "API key not configured"**
- Cause: ANTHROPIC_API_KEY environment variable not set
- Solution: Set API key in `.env` file

**Error: "Failed to process document"**
- Cause: API error or malformed document
- Solution: Check API key validity, ensure document is readable

### Debug Mode

Enable detailed logging by setting:

```bash
NODE_ENV=debug
DEBUG=*
```

---

## Performance Considerations

### Document Processing Time

- **Small documents (< 2MB)**: 3-8 seconds
- **Medium documents (2-5MB)**: 8-15 seconds
- **Large documents (> 5MB)**: 15-30 seconds

### Scaling for High Volume

For production deployment processing thousands of daily documents:

1. **Implement Queue System**: Use Bull, RabbitMQ, or AWS SQS
2. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
3. **Caching**: Cache frequently processed document types
4. **Async Processing**: Move analysis to background jobs
5. **Load Balancing**: Distribute across multiple API instances
6. **Rate Limiting**: Implement rate limits to prevent abuse

---

## Security Considerations

### Production Deployment

1. **API Key Management**
   - Never commit `.env` to version control
   - Use secret management service (AWS Secrets Manager, HashiCorp Vault)
   - Rotate keys regularly

2. **File Upload Security**
   - Implement file size limits (default: 50MB)
   - Scan uploaded files for malware
   - Store uploads in temporary directory with cleanup
   - Validate MIME types

3. **Authentication & Authorization**
   - Add user authentication (JWT, OAuth2)
   - Implement role-based access control
   - Log all document access and processing

4. **HTTPS/TLS**
   - Always use HTTPS in production
   - Implement HSTS headers
   - Use strong TLS certificates

5. **Data Privacy**
   - Implement data retention policies
   - Encrypt documents at rest
   - Log processing for audit trails
   - Comply with data protection regulations

---

## Advanced Features

### Custom Scoring Algorithm

Modify scoring in `categorizeDepartments()` function to implement custom logic:

```javascript
// Example: Boost score for urgent documents
if (analysis.urgency === 'High') {
  score *= 1.5;
}

// Example: Custom keyword weights
const customWeights = {
  'education': 5,
  'health': 4,
  'finance': 3
};
```

### Department Expertise Levels

Add expertise levels to departments:

```javascript
const departmentDatabase = {
  'Ministry of Education': {
    head: 'Dr. Oybek Khaitov',
    keywords: ['education', 'curriculum'],
    expertise: ['primary', 'secondary', 'higher_education'],
    expertise_level: 'high'
  }
};
```

### Integration with External Systems

Connect with external databases:

```javascript
// Example: Get departments from REST API
async function getDepartments() {
  const response = await fetch('https://api.example.com/departments');
  return response.json();
}
```

---

## Troubleshooting

### Issue: Connection Refused

**Solution:**
- Check if backend server is running
- Verify port 3001 is not in use: `lsof -i :3001`
- Check firewall settings

### Issue: API Key Invalid

**Solution:**
- Verify API key in `.env` file
- Check key is copied correctly (no extra spaces)
- Generate new key from Anthropic Console

### Issue: Slow Document Processing

**Solution:**
- Check API rate limits (Anthropic enforces limits per tier)
- Optimize document size (reduce file size before upload)
- Increase timeout values in configuration

### Issue: Memory Issues

**Solution:**
- Implement file cleanup: `await fs.unlink(file.path)`
- Set upload size limits
- Restart server periodically

---

## Testing

### API Testing with cURL

```bash
# Single document
curl -X POST http://localhost:3001/api/process-correspondence \
  -F "file=@test_document.pdf"

# Bulk processing
curl -X POST http://localhost:3001/api/process-bulk \
  -F "files=@doc1.pdf" \
  -F "files=@doc2.jpeg"

# Get departments
curl http://localhost:3001/api/departments

# Health check
curl http://localhost:3001/api/health
```

### Frontend Testing

1. Open http://localhost:3000
2. Try single document upload
3. Try bulk document upload
4. Verify results display correctly
5. Test print functionality
6. Test export options

---

## Deployment

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t chancellery-router .
docker run -p 3001:3001 -e ANTHROPIC_API_KEY=your_key chancellery-router
```

### Cloud Deployment

**AWS EC2:**
1. Launch Ubuntu/Amazon Linux instance
2. Install Node.js
3. Deploy application with PM2
4. Configure security groups
5. Set up CloudFront CDN for frontend

**Heroku:**
```bash
heroku login
heroku create chancellery-router
heroku config:set ANTHROPIC_API_KEY=your_key
git push heroku main
```

**Railway, Render, Vercel** also supported with similar workflows.

---

## Support & Maintenance

### Regular Maintenance

- **Weekly**: Monitor API logs, check error rates
- **Monthly**: Review department database, update keywords
- **Quarterly**: Analyze performance metrics, optimize algorithms
- **Annually**: Security audit, dependency updates

### Monitoring

Implement monitoring for:
- API response times
- Error rates and types
- Document processing success rate
- Department ranking accuracy
- System resource usage

### User Feedback Loop

Implement feedback mechanism to improve routing:
- Track user corrections to department assignments
- Analyze misrouted documents
- Continuously refine keyword mappings
- Adjust scoring algorithm based on feedback

---

## License

This system is proprietary software. All rights reserved.

---

## Contact & Support

For issues, feature requests, or support:
- Email: support@example.com
- Documentation: https://docs.example.com
- Bug Reports: issues@example.com

---

## Changelog

### Version 1.0.0
- Initial release
- Support for PDF and image documents
- 10 pre-configured government departments
- Single and bulk document processing
- Professional web dashboard
- RESTful API
- Department ranking algorithm

---

## Version History & Updates

**Latest Version:** 1.0.0 (Released: March 2026)

### Planned Features (Future Versions)

- [ ] User authentication & role-based access
- [ ] Department-specific document templates
- [ ] Email notifications for routing
- [ ] Automatic response generation
- [ ] Multi-language support
- [ ] Machine learning optimization
- [ ] Advanced reporting & analytics
- [ ] Integration with document management systems
- [ ] Mobile application
- [ ] Offline processing capability

---

**Document Last Updated:** March 29, 2026
**System Version:** 1.0.0
**API Version:** v1
