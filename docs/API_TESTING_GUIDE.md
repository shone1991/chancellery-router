# Chancellery Correspondence Router - API Testing Guide

Complete guide for testing all API endpoints with curl and examples.

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Get Departments](#get-departments)
3. [Single Document Processing](#single-document-processing)
4. [Bulk Document Processing](#bulk-document-processing)
5. [Error Handling](#error-handling)
6. [Response Examples](#response-examples)
7. [Performance Testing](#performance-testing)
8. [Integration Testing](#integration-testing)

---

## 🏥 Health Check

Verify the API is running and accessible.

### Request

```bash
curl -X GET http://localhost:3001/api/health
```

### Response (Success)

```json
{
  "status": "ok",
  "service": "Chancellery Correspondence Router",
  "version": "1.0.0"
}
```

### Status Code: 200 OK

---

## 🏢 Get Departments

Retrieve list of all available departments and their configurations.

### Request

```bash
curl -X GET http://localhost:3001/api/departments
```

### Response (Success)

```json
{
  "success": true,
  "departments": [
    {
      "name": "Ministry of Education",
      "head": "Dr. Oybek Khaitov",
      "keywords": [
        "education",
        "school",
        "university",
        "student",
        "curriculum",
        "teaching",
        "academic"
      ],
      "description": "Handles educational matters, policies, and correspondence"
    },
    {
      "name": "Ministry of Finance",
      "head": "Jamshid Kuchkarov",
      "keywords": [
        "budget",
        "finance",
        "funding",
        "tax",
        "accounting",
        "fiscal",
        "payment",
        "monetary"
      ],
      "description": "Manages financial matters and budgetary allocations"
    },
    {
      "name": "Ministry of Health",
      "head": "Dr. Alisher Shadmanov",
      "keywords": [
        "health",
        "medical",
        "hospital",
        "patient",
        "disease",
        "vaccination",
        "clinic",
        "healthcare"
      ],
      "description": "Oversees health services and medical policies"
    },
    {
      "name": "Ministry of Infrastructure",
      "head": "Adham Khanov",
      "keywords": [
        "infrastructure",
        "construction",
        "road",
        "bridge",
        "transport",
        "building",
        "project",
        "development"
      ],
      "description": "Manages infrastructure projects and development"
    },
    {
      "name": "Ministry of Internal Affairs",
      "head": "Pulat Khaitov",
      "keywords": [
        "security",
        "police",
        "law enforcement",
        "order",
        "regulation",
        "compliance",
        "safety"
      ],
      "description": "Handles security and internal affairs"
    },
    {
      "name": "Ministry of Environment",
      "head": "Davron Khuzhaev",
      "keywords": [
        "environment",
        "ecology",
        "pollution",
        "water",
        "air",
        "green",
        "sustainability",
        "natural"
      ],
      "description": "Focuses on environmental protection and sustainability"
    },
    {
      "name": "Ministry of Labor",
      "head": "Nozim Khaitov",
      "keywords": [
        "employment",
        "labor",
        "worker",
        "wage",
        "benefits",
        "pension",
        "workplace",
        "job"
      ],
      "description": "Manages labor relations and employment matters"
    },
    {
      "name": "Ministry of Agriculture",
      "head": "Bekzod Khaitov",
      "keywords": [
        "agriculture",
        "farm",
        "crop",
        "livestock",
        "soil",
        "harvest",
        "rural",
        "farming"
      ],
      "description": "Oversees agricultural policies and farming matters"
    },
    {
      "name": "Ministry of Culture",
      "head": "Mohinur Mirkhanova",
      "keywords": [
        "culture",
        "art",
        "heritage",
        "museum",
        "historical",
        "cultural",
        "tourism",
        "tradition"
      ],
      "description": "Manages cultural affairs and heritage preservation"
    },
    {
      "name": "Ministry of Foreign Affairs",
      "head": "Abdulaziz Khaitov",
      "keywords": [
        "international",
        "foreign",
        "embassy",
        "diplomat",
        "agreement",
        "treaty",
        "cooperation",
        "bilateral"
      ],
      "description": "Handles international relations and diplomatic affairs"
    }
  ],
  "total": 10
}
```

### Status Code: 200 OK

---

## 📄 Single Document Processing

Process a single document (PDF, JPEG, or PNG).

### Request

#### Using curl with file:
```bash
curl -X POST http://localhost:3001/api/process-correspondence \
  -F "file=@/path/to/document.pdf"
```

#### Using curl with form data:
```bash
# For a JPEG image
curl -X POST http://localhost:3001/api/process-correspondence \
  -F "file=@education_directive.jpg"

# For a PNG image
curl -X POST http://localhost:3001/api/process-correspondence \
  -F "file=@health_notice.png"
```

#### Using fetch in JavaScript:
```javascript
const fileInput = document.querySelector('input[type="file"]');
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/process-correspondence', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

#### Using Python requests:
```python
import requests

with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://localhost:3001/api/process-correspondence',
        files=files
    )
    data = response.json()
    print(data)
```

### Response (Success - Education Directive)

```json
{
  "success": true,
  "documentAnalysis": {
    "fileName": "education_directive.pdf",
    "subject": "New Curriculum Guidelines for Secondary Schools",
    "purpose": "Establish updated curriculum standards for all secondary educational institutions across the country",
    "documentType": "Directive",
    "urgency": "High",
    "keywords": [
      "education",
      "school",
      "secondary",
      "curriculum",
      "teaching",
      "academic",
      "standards",
      "implementation"
    ]
  },
  "routingResult": {
    "primaryDepartment": {
      "department": "Ministry of Education",
      "head": "Dr. Oybek Khaitov",
      "score": 18,
      "matchedKeywords": [
        "education",
        "school",
        "curriculum",
        "teaching",
        "academic",
        "standards"
      ],
      "description": "Handles educational matters, policies, and correspondence"
    },
    "allDepartments": [
      {
        "department": "Ministry of Education",
        "head": "Dr. Oybek Khaitov",
        "score": 18,
        "matchedKeywords": [
          "education",
          "school",
          "curriculum",
          "teaching",
          "academic",
          "standards"
        ],
        "description": "Handles educational matters, policies, and correspondence"
      },
      {
        "department": "Ministry of Labor",
        "head": "Nozim Khaitov",
        "score": 2,
        "matchedKeywords": ["workplace"],
        "description": "Manages labor relations and employment matters"
      }
    ],
    "totalMatches": 2,
    "recommendation": "Primary routing to Ministry of Education (Head: Dr. Oybek Khaitov). Secondary review by Ministry of Labor."
  }
}
```

### Response (Success - Health Notification)

```json
{
  "success": true,
  "documentAnalysis": {
    "fileName": "health_notification.jpg",
    "subject": "COVID-19 Vaccination Campaign Launch",
    "purpose": "Announce new vaccination initiative and provide guidelines for healthcare facilities",
    "documentType": "Notification",
    "urgency": "High",
    "keywords": [
      "health",
      "medical",
      "vaccination",
      "healthcare",
      "disease",
      "patient",
      "treatment",
      "clinic"
    ]
  },
  "routingResult": {
    "primaryDepartment": {
      "department": "Ministry of Health",
      "head": "Dr. Alisher Shadmanov",
      "score": 20,
      "matchedKeywords": [
        "health",
        "medical",
        "vaccination",
        "healthcare",
        "disease",
        "treatment",
        "clinic"
      ],
      "description": "Oversees health services and medical policies"
    },
    "allDepartments": [
      {
        "department": "Ministry of Health",
        "head": "Dr. Alisher Shadmanov",
        "score": 20,
        "matchedKeywords": [
          "health",
          "medical",
          "vaccination",
          "healthcare",
          "disease",
          "treatment"
        ],
        "description": "Oversees health services and medical policies"
      }
    ],
    "totalMatches": 1,
    "recommendation": "Primary routing to Ministry of Health (Head: Dr. Alisher Shadmanov). No secondary departments matched."
  }
}
```

### Error Response - No File

```bash
curl -X POST http://localhost:3001/api/process-correspondence
```

```json
{
  "error": "No file uploaded",
  "success": false
}
```

**Status Code: 400 Bad Request**

### Error Response - Invalid File Type

```bash
curl -X POST http://localhost:3001/api/process-correspondence \
  -F "file=@document.txt"
```

```json
{
  "error": "Only PDF and image files are allowed",
  "success": false
}
```

**Status Code: 400 Bad Request**

---

## 📁 Bulk Document Processing

Process multiple documents in a single request (up to 10 files).

### Request

#### Using curl with multiple files:
```bash
curl -X POST http://localhost:3001/api/process-bulk \
  -F "files=@document1.pdf" \
  -F "files=@document2.jpg" \
  -F "files=@document3.png"
```

#### Using JavaScript FormData:
```javascript
const formData = new FormData();

// Add multiple files
for (let file of files) {
  formData.append('files', file);
}

const response = await fetch('http://localhost:3001/api/process-bulk', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

#### Using Python requests:
```python
import requests

files = [
  ('files', open('doc1.pdf', 'rb')),
  ('files', open('doc2.jpg', 'rb')),
  ('files', open('doc3.png', 'rb'))
]

response = requests.post(
  'http://localhost:3001/api/process-bulk',
  files=files
)

data = response.json()
print(data)
```

### Response (Success)

```json
{
  "success": true,
  "processedFiles": 3,
  "results": [
    {
      "fileName": "education_directive.pdf",
      "success": true,
      "analysis": {
        "subject": "New Curriculum Guidelines for Secondary Schools",
        "keywords": [
          "education",
          "curriculum",
          "school",
          "teaching",
          "academic"
        ],
        "purpose": "Establish updated curriculum standards",
        "mentioned_departments": [],
        "urgency": "High",
        "document_type": "Directive"
      },
      "routing": {
        "primary": {
          "department": "Ministry of Education",
          "head": "Dr. Oybek Khaitov",
          "score": 18,
          "matchedKeywords": [
            "education",
            "curriculum",
            "school",
            "teaching",
            "academic"
          ]
        },
        "all": [
          {
            "department": "Ministry of Education",
            "head": "Dr. Oybek Khaitov",
            "score": 18,
            "matchedKeywords": [
              "education",
              "curriculum",
              "school",
              "teaching",
              "academic"
            ]
          }
        ]
      }
    },
    {
      "fileName": "health_notification.jpg",
      "success": true,
      "analysis": {
        "subject": "COVID-19 Vaccination Campaign",
        "keywords": [
          "health",
          "medical",
          "vaccination",
          "healthcare"
        ],
        "purpose": "Announce vaccination initiative",
        "mentioned_departments": [],
        "urgency": "High",
        "document_type": "Notification"
      },
      "routing": {
        "primary": {
          "department": "Ministry of Health",
          "head": "Dr. Alisher Shadmanov",
          "score": 16,
          "matchedKeywords": [
            "health",
            "medical",
            "vaccination",
            "healthcare"
          ]
        },
        "all": [
          {
            "department": "Ministry of Health",
            "head": "Dr. Alisher Shadmanov",
            "score": 16,
            "matchedKeywords": [
              "health",
              "medical",
              "vaccination",
              "healthcare"
            ]
          }
        ]
      }
    },
    {
      "fileName": "infrastructure_project.png",
      "success": true,
      "analysis": {
        "subject": "Highway Construction Project Approval",
        "keywords": [
          "infrastructure",
          "construction",
          "road",
          "project",
          "development"
        ],
        "purpose": "Approve new highway construction",
        "mentioned_departments": [],
        "urgency": "Medium",
        "document_type": "Directive"
      },
      "routing": {
        "primary": {
          "department": "Ministry of Infrastructure",
          "head": "Adham Khanov",
          "score": 14,
          "matchedKeywords": [
            "infrastructure",
            "construction",
            "road",
            "project",
            "development"
          ]
        },
        "all": [
          {
            "department": "Ministry of Infrastructure",
            "head": "Adham Khanov",
            "score": 14,
            "matchedKeywords": [
              "infrastructure",
              "construction",
              "road",
              "project",
              "development"
            ]
          }
        ]
      }
    }
  ]
}
```

### Response (Partial Failure)

```json
{
  "success": true,
  "processedFiles": 3,
  "results": [
    {
      "fileName": "document1.pdf",
      "success": true,
      "analysis": { },
      "routing": { }
    },
    {
      "fileName": "document2.txt",
      "success": false,
      "error": "Invalid file format. Only PDF and image files are allowed."
    },
    {
      "fileName": "document3.jpg",
      "success": true,
      "analysis": { },
      "routing": { }
    }
  ]
}
```

---

## ⚠️ Error Handling

### Common Error Scenarios

#### Missing API Key

**Error Response:**
```json
{
  "error": "ANTHROPIC_API_KEY is not configured",
  "success": false
}
```

**Solution:** Set ANTHROPIC_API_KEY in .env file

#### Invalid API Key

**Error Response:**
```json
{
  "error": "Invalid API key provided",
  "success": false
}
```

**Solution:** Verify API key is correct and not expired

#### File Too Large

**Error Response:**
```json
{
  "error": "File size exceeds maximum allowed size",
  "success": false
}
```

**Solution:** Reduce file size or increase MAX_FILE_SIZE in .env

#### Server Error

**Error Response:**
```json
{
  "error": "Internal server error: [detailed message]",
  "success": false
}
```

**Solution:** Check server logs for detailed error

---

## 📊 Response Examples

### Excellent Match (Single Department)

Document clearly about education → Only Ministry of Education matched

```json
{
  "success": true,
  "documentAnalysis": {
    "subject": "University Enrollment Procedures",
    "documentType": "Directive",
    "urgency": "High",
    "keywords": ["university", "enrollment", "academic", "education"]
  },
  "routingResult": {
    "primaryDepartment": {
      "department": "Ministry of Education",
      "head": "Dr. Oybek Khaitov",
      "score": 24
    },
    "allDepartments": [
      {
        "department": "Ministry of Education",
        "head": "Dr. Oybek Khaitov",
        "score": 24
      }
    ],
    "totalMatches": 1
  }
}
```

### Good Match (Multiple Departments)

Document about agricultural worker welfare → Multiple relevant departments

```json
{
  "success": true,
  "documentAnalysis": {
    "subject": "Farmer Welfare Program and Employment Benefits",
    "documentType": "Notification",
    "urgency": "Medium",
    "keywords": ["agriculture", "farmer", "employment", "benefits", "wage"]
  },
  "routingResult": {
    "primaryDepartment": {
      "department": "Ministry of Agriculture",
      "head": "Bekzod Khaitov",
      "score": 12
    },
    "allDepartments": [
      {
        "department": "Ministry of Agriculture",
        "head": "Bekzod Khaitov",
        "score": 12
      },
      {
        "department": "Ministry of Labor",
        "head": "Nozim Khaitov",
        "score": 10
      }
    ],
    "totalMatches": 2
  }
}
```

### No Match (Manual Review Required)

Document with unclear or no matching keywords

```json
{
  "success": true,
  "documentAnalysis": {
    "subject": "Annual Financial Report",
    "documentType": "Report",
    "urgency": "Low",
    "keywords": ["report", "annual", "data", "information"]
  },
  "routingResult": {
    "primaryDepartment": null,
    "allDepartments": [],
    "totalMatches": 0,
    "recommendation": "No matching departments found. Manual review required."
  }
}
```

---

## ⚡ Performance Testing

### Load Testing with Apache Bench

```bash
# Single document test (5 concurrent requests, 100 total)
ab -n 100 -c 5 http://localhost:3001/api/health

# Expected: Response time < 2 seconds
```

### Stress Testing with Bulk Upload

```bash
# Test with 10 large PDF files
time curl -X POST http://localhost:3001/api/process-bulk \
  -F "files=@large1.pdf" \
  -F "files=@large2.pdf" \
  -F "files=@large3.pdf" \
  ... (up to 10 files)
```

### Benchmark Results

Typical response times (on modern hardware):

| Operation | Time |
|-----------|------|
| Health check | < 10ms |
| Get departments | < 50ms |
| Single document (small, <5MB) | 3-8 seconds |
| Single document (large, >10MB) | 15-30 seconds |
| Bulk 3 documents | 10-25 seconds |
| Bulk 10 documents | 30-60 seconds |

---

## 🧪 Integration Testing

### Test Suite Example (Node.js with Jest)

```javascript
// test.js
const axios = require('axios');

const API_URL = 'http://localhost:3001';

describe('Chancellery API', () => {
  test('Health check should return ok', async () => {
    const response = await axios.get(`${API_URL}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('ok');
  });

  test('Get departments should return array', async () => {
    const response = await axios.get(`${API_URL}/api/departments`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.departments)).toBe(true);
    expect(response.data.total).toBe(10);
  });

  test('Process document should route correctly', async () => {
    const fs = require('fs');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test.pdf'));

    const response = await axios.post(
      `${API_URL}/api/process-correspondence`,
      formData
    );
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.routingResult.primaryDepartment).toBeDefined();
  });

  test('Should reject invalid file types', async () => {
    const fs = require('fs');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('document.txt'));

    try {
      await axios.post(`${API_URL}/api/process-correspondence`, formData);
      fail('Should have rejected invalid file');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });
});

// Run tests: npm test
```

### Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "Chancellery Router API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/health"
      }
    },
    {
      "name": "Get Departments",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/departments"
      }
    },
    {
      "name": "Process Document",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/process-correspondence",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "document.pdf"
            }
          ]
        }
      }
    },
    {
      "name": "Bulk Process",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/process-bulk",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "files",
              "type": "file",
              "src": ["doc1.pdf", "doc2.jpg"]
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3001"
    }
  ]
}
```

---

## 📋 Checklist for Testing

- [ ] Server is running (`npm start`)
- [ ] API key configured in `.env`
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:3001
- [ ] Health check returns 200 OK
- [ ] Can retrieve departments list
- [ ] Can upload and process single document
- [ ] Can upload and process multiple documents
- [ ] All response fields populated
- [ ] Errors handled gracefully
- [ ] Score calculations correct
- [ ] Department ranking works
- [ ] File upload limits respected
- [ ] Invalid files rejected
- [ ] Performance acceptable

---

**API Testing Guide - Version 1.0**
**Last Updated: March 29, 2026**

