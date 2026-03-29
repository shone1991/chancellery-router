# 🚀 Chancellery Correspondence Router - Quick Start Guide

Get the system up and running in 5 minutes!

---

## ⚡ Prerequisites

Before starting, make sure you have:

- ✅ **Node.js** (v14 or higher) - [Download](https://nodejs.org)
- ✅ **npm** (comes with Node.js)
- ✅ **Anthropic API Key** - [Get it here](https://console.anthropic.com/account/keys)
- ✅ **Git** (optional, for cloning repository)

**Check your setup:**
```bash
node --version  # Should show v14.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

---

## 📦 Step 1: Setup Backend (2 minutes)

### 1a. Create Backend Folder
```bash
mkdir chancellery-router-backend
cd chancellery-router-backend
```

### 1b. Copy Backend Files
Copy the following files to this folder:
- `server.js`
- `package.json`

### 1c. Install Dependencies
```bash
npm install
```

### 1d. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-your_actual_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 1e. Start Backend Server
```bash
npm start
```

**Expected output:**
```
Chancellery Correspondence Router API running on port 3001
POST /api/process-correspondence - Process single document
POST /api/process-bulk - Process multiple documents
GET /api/departments - List all departments
```

✅ **Backend is ready!** Keep this terminal running.

---

## 🎨 Step 2: Setup Frontend (2 minutes)

**Open a NEW terminal window** and run:

### 2a. Create Frontend App
```bash
npx create-react-app chancellery-router-frontend
cd chancellery-router-frontend
```

### 2b. Copy Frontend Files
Copy these files to `src/` folder:
- `DepartmentRoutingDashboard.jsx` → `src/App.js`
- `App.css` → `src/App.css`

### 2c. Create .env File
Create `.env` in the frontend folder:
```env
REACT_APP_API_URL=http://localhost:3001
```

### 2d. Start Frontend
```bash
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view chancellery-router-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://xxx.xxx.xxx.xxx:3000
```

✅ **Frontend is ready!** Dashboard opens automatically.

---

## ✅ Step 3: Test the System (1 minute)

### 3a. Open Dashboard
Your browser should open to: **http://localhost:3000**

### 3b. Prepare Test Document
Create a simple text file and save as `test.pdf` with content:
```
MINISTRY OF EDUCATION DIRECTIVE

Subject: Implementation of New Curriculum Standards

Dear Principals,

This directive outlines the new curriculum standards for all secondary 
educational institutions in the country. All schools must implement these 
changes by the beginning of the academic year.

Best regards,
Ministry of Education
```

### 3c. Upload & Process
1. Click "Single Document" mode
2. Click the upload box
3. Select your test document
4. Click "Process Document"

### 3d. View Results
Within 5-10 seconds, you should see:
- ✅ Document analysis with keywords
- ✅ **Primary Department**: Ministry of Education
- ✅ Department head and description
- ✅ Secondary departments ranked by relevance

---

## 🎯 Key Features to Try

### Single Document Processing
- Upload PDF or image
- Get instant department routing
- View detailed analysis
- Print results

### Bulk Processing
1. Switch to "Bulk Processing" mode
2. Select multiple files (up to 10)
3. Process all at once
4. View results for each document

### API Testing (Optional)
Test the API directly with curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Get departments
curl http://localhost:3001/api/departments

# Process single document
curl -X POST http://localhost:3001/api/process-correspondence \
  -F "file=@test.pdf"
```

---

## 🛠️ Common Issues & Solutions

### ❌ "Port 3001 already in use"
**Solution:** Either stop the other service or change the port:
```bash
PORT=3002 npm start
```

### ❌ "Cannot find module @anthropic-ai/sdk"
**Solution:** Install dependencies properly:
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Invalid API key"
**Solution:** 
1. Check API key in `.env` file
2. No extra spaces or quotes
3. Key should start with `sk-ant-`
4. Generate new key: https://console.anthropic.com/account/keys

### ❌ "Cannot GET /api/process-correspondence"
**Solution:** Make sure backend is running on port 3001:
```bash
# In backend terminal
npm start
```

### ❌ "CORS error" (Cross-Origin Request Blocked)
**Solution:** Verify CORS_ORIGIN in `.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

### ❌ Frontend blank or 404
**Solution:** Clear browser cache:
- Chrome: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- Select "All time"
- Clear browsing data

---

## 📊 Understanding the Results

### Document Analysis Section
Shows what Claude extracted from the document:
- **Subject**: Main topic of the document
- **Keywords**: Automatically detected relevant terms
- **Document Type**: Directive, Request, Notification, etc.
- **Urgency**: High, Medium, or Low
- **Purpose**: Brief summary of document intent

### Primary Department Section
The top-ranked department for routing:
- **Department Name**: Official ministry/agency name
- **Department Head**: Name and surname
- **Match Score**: Relevance score (higher = better match)
- **Description**: What the department does
- **Matched Keywords**: Which keywords matched

### Secondary Departments
Other departments that might be involved:
- Ranked by relevance score
- Can provide additional review
- Help prevent routing errors

---

## 📚 Next Steps

### Configuration
- **Customize Departments**: Edit `departmentDatabase` in `server.js`
- **Change Keywords**: Add/remove keywords for better matching
- **Adjust Scoring**: Modify algorithm in `categorizeDepartments()` function

### Deployment
- **Docker**: See SYSTEM_DOCUMENTATION.md
- **Heroku**: See deployment section
- **AWS/Cloud**: See cloud deployment section

### Integration
- **Database**: Connect to PostgreSQL for persistence
- **Authentication**: Add user login system
- **Email**: Enable email notifications
- **API**: Integrate with other systems

### Enhancement
- **Machine Learning**: Train model on past routings
- **Multi-language**: Support multiple languages
- **Templates**: Create department-specific document templates
- **Analytics**: Dashboard showing routing statistics

---

## 📖 Full Documentation

For complete documentation, setup options, and advanced configuration:

👉 **See: `SYSTEM_DOCUMENTATION.md`**

Key sections:
- System Architecture
- Complete API Reference
- Department Customization
- Security Considerations
- Production Deployment
- Troubleshooting Guide

---

## 🔐 Security Reminders

⚠️ **For Development Only:**
- The setup above is for local development
- API key is visible in `.env` file
- No authentication on API endpoints
- Files not encrypted at rest

✅ **Before Production:**
1. Use secret management (AWS Secrets Manager, Vault)
2. Enable HTTPS/TLS
3. Add user authentication
4. Implement rate limiting
5. Enable input validation
6. Add database encryption
7. Regular security audits

See SYSTEM_DOCUMENTATION.md → Security Considerations section

---

## 📞 Need Help?

### Check These First:
1. Ensure both backend AND frontend are running
2. Check `.env` file has correct API key
3. Backend on port 3001, Frontend on port 3000
4. Browser console for JavaScript errors (F12)
5. Backend console for server errors

### Verify Setup:
```bash
# Backend should respond:
curl http://localhost:3001/api/health

# Frontend should be accessible:
curl http://localhost:3000
```

### Debug Mode:
```bash
# Start backend with debug logging
DEBUG=* npm start
```

---

## 🎉 You're All Set!

Congratulations! Your Chancellery Correspondence Router is now running.

**Current Status:**
- ✅ Backend API: http://localhost:3001
- ✅ Frontend Dashboard: http://localhost:3000
- ✅ Processing Documents: Ready
- ✅ Department Routing: Active

**Next:** Upload a document and watch it automatically route to the right department!

---

## 📝 Useful Commands

```bash
# Backend
npm start          # Start production server
npm run dev        # Start with auto-reload
npm test          # Run tests

# Frontend
npm start         # Start development server
npm run build     # Create production build
npm run eject     # Eject from Create React App (careful!)

# Cleanup
npm run clean     # Remove node_modules
rm .env          # Reset environment (copy from .env.example)
```

---

## 🚀 Production Deployment Checklist

- [ ] API key in secure secret manager
- [ ] HTTPS/TLS enabled
- [ ] Database configured
- [ ] Authentication enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Monitoring/alerts setup
- [ ] Backup strategy
- [ ] Security audit passed

---

**Quick Start Guide - Version 1.0**
**Last Updated: March 29, 2026**

Ready to process government correspondence intelligently! 🎯

