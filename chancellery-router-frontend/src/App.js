import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Upload file');

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/process', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert('Error uploading file');
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>📄 Chancellery Router</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Processing...' : 'Upload & Analyze'}
      </button>

      {result && (
          <div className="result">
            <h2>🧠 Analysis</h2>

            <p><b>Summary (UZ):</b></p>
            <p>{result?.analysis?.summary_uz || 'No summary available'}</p>

            <h3>🏢 Departments</h3>

            {result?.analysis?.departments?.map((d, i) => (
                <div key={i} className="card">
                  <h4>{d.name}</h4>
                  <p>Confidence: {d.confidence}</p>
                  <p>{d.reason}</p>
                </div>
            ))}
          </div>
      )}
    </div>
  );
}

export default App;