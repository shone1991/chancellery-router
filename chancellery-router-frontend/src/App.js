import React, { useState, useCallback } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Main Application Component
 * Chancellery Correspondence Router Dashboard
 */
const DepartmentRoutingDashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were not valid PDF or image formats');
    }

    setFiles(validFiles);
    setError(null);
  }, []);

  /**
   * Process documents (single or bulk)
   */
  const processDocument = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      if (bulkMode && files.length > 1) {
        // Bulk processing
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const response = await fetch(`${API_URL}/api/process-bulk`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process files');
        }

        const data = await response.json();
        setResults({
          type: 'bulk',
          data
        });
      } else {
        // Single file processing
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await fetch(`${API_URL}/api/process-correspondence`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process document');
        }

        const data = await response.json();
        setResults({
          type: 'single',
          data
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset and clear results
   */
  const clearResults = () => {
    setResults(null);
    setFiles([]);
    setError(null);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Chancellery Correspondence Router</h1>
          <p>Intelligent document categorization and department routing system</p>
        </div>
      </header>

      <main className="dashboard-main">
        {!results ? (
          <div className="upload-section">
            <div className="mode-selector">
              <button
                className={`mode-btn ${!bulkMode ? 'active' : ''}`}
                onClick={() => { setBulkMode(false); setFiles([]); }}
              >
                <span className="icon">📄</span>
                Single Document
              </button>
              <button
                className={`mode-btn ${bulkMode ? 'active' : ''}`}
                onClick={() => { setBulkMode(true); setFiles([]); }}
              >
                <span className="icon">📁</span>
                Bulk Processing
              </button>
            </div>

            <div className="upload-area">
              <div className="upload-box">
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple={bulkMode}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-input" className="upload-label">
                  <div className="upload-icon">📤</div>
                  <h2>Drop files here or click to select</h2>
                  <p>Supported formats: PDF, JPEG, PNG</p>
                  {bulkMode && <p className="info-text">Multiple files supported (max 10)</p>}
                </label>
              </div>

              {files.length > 0 && (
                <div className="files-list">
                  <h3>Selected Files ({files.length})</h3>
                  <ul>
                    {files.map((file, idx) => (
                      <li key={idx}>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={processDocument}
                disabled={files.length === 0 || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>✓ Process Document{files.length > 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="results-section">
            {results.type === 'single' && results.data.success && (
              <ResultsView data={results.data} onReset={clearResults} />
            )}
            {results.type === 'bulk' && results.data.success && (
              <BulkResultsView data={results.data} onReset={clearResults} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * Single Document Results View Component
 */
const ResultsView = ({ data, onReset }) => {
  const analysis = data.documentAnalysis;
  const routing = data.routingResult;
  const primaryDept = routing.primaryDepartment;

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>✓ Document Analysis Complete</h2>
        <button className="btn-close" onClick={onReset}>← Back</button>
      </div>

      <div className="analysis-box">
        <div className="analysis-header">
          <h3>Document Information</h3>
        </div>
        <div className="analysis-grid">
          <div className="analysis-item">
            <label>File Name</label>
            <p className="highlight">{analysis.fileName}</p>
          </div>
          <div className="analysis-item">
            <label>Subject</label>
            <p>{analysis.subject}</p>
          </div>
          <div className="analysis-item">
            <label>Document Type</label>
            <p>
              <span className="badge">{analysis.documentType}</span>
            </p>
          </div>
          <div className="analysis-item">
            <label>Urgency</label>
            <p>
              <span className={`badge urgency-${analysis.urgency.toLowerCase()}`}>
                {analysis.urgency}
              </span>
            </p>
          </div>
          <div className="analysis-item full-width">
            <label>Purpose</label>
            <p>{analysis.purpose}</p>
          </div>
          <div className="analysis-item full-width">
            <label>Keywords Detected</label>
            <div className="keywords-list">
              {Array.isArray(analysis.keywords) ? (
                analysis.keywords.map((kw, idx) => (
                  <span key={idx} className="keyword-tag">{kw}</span>
                ))
              ) : (
                <span className="keyword-tag">{analysis.keywords}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {primaryDept && (
        <div className="primary-routing">
          <div className="primary-header">
            <span className="primary-badge">PRIMARY ROUTING</span>
            <h2>{primaryDept.department}</h2>
          </div>
          <div className="primary-details">
            <div className="detail-item">
              <label>Department Head</label>
              <p className="head-name">{primaryDept.head}</p>
            </div>
            <div className="detail-item">
              <label>Description</label>
              <p>{primaryDept.description}</p>
            </div>
            <div className="detail-item">
              <label>Match Score</label>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${Math.min(100, primaryDept.score * 10)}%` }}></div>
              </div>
              <p>{primaryDept.score} points</p>
            </div>
            {primaryDept.matchedKeywords.length > 0 && (
              <div className="detail-item">
                <label>Matched Keywords</label>
                <div className="keywords-list">
                  {primaryDept.matchedKeywords.map((kw, idx) => (
                    <span key={idx} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="secondary-routing">
        <h3>Secondary Departments</h3>
        {routing.allDepartments.length > 1 ? (
          <div className="departments-grid">
            {routing.allDepartments.slice(1).map((dept, idx) => (
              <div key={idx} className="department-card">
                <div className="card-header">
                  <h4>{dept.department}</h4>
                  <span className="rank-badge">#{idx + 2}</span>
                </div>
                <p className="head-info"><strong>Head:</strong> {dept.head}</p>
                <p className="description">{dept.description}</p>
                <div className="card-footer">
                  <span className="match-score">Match: {dept.score}pts</span>
                  {dept.matchedKeywords.length > 0 && (
                    <span className="keywords-count">{dept.matchedKeywords.length} keywords</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-secondary">No secondary departments matched</p>
        )}
      </div>

      <div className="recommendation-box">
        <h3>Routing Recommendation</h3>
        <p>{routing.recommendation}</p>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={onReset}>
          ← Process Another Document
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print Results
        </button>
      </div>
    </div>
  );
};

/**
 * Bulk Processing Results View Component
 */
const BulkResultsView = ({ data, onReset }) => {
  const successful = data.results.filter(r => r.success);
  const failed = data.results.filter(r => !r.success);

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>✓ Bulk Processing Complete</h2>
        <button className="btn-close" onClick={onReset}>← Back</button>
      </div>

      <div className="bulk-summary">
        <div className="summary-stat">
          <span className="stat-number">{successful.length}</span>
          <span className="stat-label">Processed</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{failed.length}</span>
          <span className="stat-label">Failed</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{data.processedFiles}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="bulk-results">
        {successful.map((result, idx) => (
          <div key={idx} className="bulk-result-item">
            <div className="item-header">
              <h4>{result.fileName}</h4>
              <span className="status-badge success">✓ Processed</span>
            </div>
            <p className="subject"><strong>Subject:</strong> {result.analysis.subject}</p>
            {result.routing.primary && (
              <p className="primary">
                <strong>Primary:</strong> <span className="dept-name">{result.routing.primary.department}</span>
                <span className="head-info">({result.routing.primary.head})</span>
              </p>
            )}
            <div className="secondary-list">
              {result.routing.all.slice(1, 3).map((dept, didx) => (
                <span key={didx} className="dept-tag">{dept.department}</span>
              ))}
            </div>
          </div>
        ))}

        {failed.length > 0 && (
          <div className="failed-section">
            <h3>Failed Files</h3>
            {failed.map((result, idx) => (
              <div key={idx} className="failed-item">
                <span className="status-badge error">✗ Failed</span>
                <p>{result.fileName}</p>
                <p className="error-msg">{result.error}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={onReset}>
          ← Process More Documents
        </button>
      </div>
    </div>
  );
};

export default DepartmentRoutingDashboard;
