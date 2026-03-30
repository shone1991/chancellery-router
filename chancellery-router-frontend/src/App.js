import React, { useState, useCallback } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const URGENCY_CLASS = {
  "yuqori": "high",
  "o'rta": "medium",
  "past":  "low"
};

function UrgencyBadge({ level }) {
  const cls = URGENCY_CLASS[(level || '').toLowerCase()] || 'medium';
  return <span className={`badge badge--urgency badge--${cls}`}>{level || "O'rta"}</span>;
}

function DepartmentCard({ dept, rank, expanded }) {
  return (
    <div className={`dept-card ${rank === 1 ? 'dept-card--primary' : ''}`}>
      <div className="dept-card__rank">{rank}</div>
      <div className="dept-card__body">
        <div className="dept-card__top">
          <h3 className="dept-card__name">{dept.department}</h3>
          <div className="dept-card__score-wrap">
            <div className="score-bar">
              <div
                className="score-bar__fill"
                style={{ width: `${Math.round((dept.score / 30) * 100)}%` }}
              />
            </div>
            <span className="score-label">{dept.score}<small>/30</small></span>
          </div>
        </div>
        {dept.head && (
          <p className="dept-card__head">
            <span className="dept-label">Mudiri:</span> {dept.head}
          </p>
        )}
        {dept.description && (
          <p className="dept-card__reason">{dept.description}</p>
        )}
        {expanded && dept.matchedKeywords?.length > 0 && (
          <div className="dept-card__keywords">
            {dept.matchedKeywords.map((kw, i) => (
              <span key={i} className="kw-tag">{kw}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(async () => {
    if (!file) { setError("Iltimos, fayl tanlang"); return; }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError("Faqat PDF, JPG, PNG formatlar qabul qilinadi");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/process-correspondence`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Backend ishlaётganini tekshiring.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setError(null); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setError(null); }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  const { documentAnalysis: da, routingResult: rr } = result || {};
  const today = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <div className="header__emblem">JP</div>
            <div className="header__titles">
              <span className="header__university">Jizzax Politexnika Instituti</span>
              <span className="header__system">Kancellyariya — Hujjat Yo'naltirish Tizimi</span>
            </div>
          </div>
          <div className="header__date">{today}</div>
        </div>
      </header>

      <main className="main">
        {!result ? (
          <div className="upload-screen">
            <div className="upload-card">
              <div className="upload-card__icon">📨</div>
              <h2 className="upload-card__title">Hujjat Yuklash</h2>
              <p className="upload-card__desc">
                PDF yoki rasm faylini yuklang — tizim avtomatik ravishda tegishli kafedrani aniqlaydi.
              </p>

              <div
                className={`dropzone${dragOver ? ' dropzone--active' : ''}${file ? ' dropzone--filled' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !loading && document.getElementById('file-input').click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-input').click()}
              >
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                {file ? (
                  <>
                    <div className="dropzone__icon">✅</div>
                    <p className="dropzone__filename">{file.name}</p>
                    <p className="dropzone__hint">
                      {(file.size / 1024 / 1024).toFixed(2)} MB &nbsp;·&nbsp; O'zgartirish uchun bosing
                    </p>
                  </>
                ) : (
                  <>
                    <div className="dropzone__icon">📁</div>
                    <p className="dropzone__text">Faylni bu yerga tashlang</p>
                    <p className="dropzone__hint">yoki tanlash uchun bosing · PDF, JPG, PNG · maks. 15 MB</p>
                  </>
                )}
              </div>

              {error && (
                <div className="error-box">
                  <span className="error-box__icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                className="btn btn--primary"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? (
                  <><span className="spinner" /> Tahlil qilinmoqda…</>
                ) : (
                  'Yuborish va tahlil qilish →'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="results-screen">
            {/* ── Print-only header ── */}
            <div className="print-header">
              <div className="print-header__logo">JIZZAX POLITEXNIKA INSTITUTI</div>
              <h1 className="print-header__title">Kancellyariya Yo'naltirish Varaqasi</h1>
              <p className="print-header__date">Sana: {today}</p>
              <hr className="print-header__rule" />
            </div>

            {/* ── Screen toolbar ── */}
            <div className="results-toolbar no-print">
              <button className="btn btn--ghost" onClick={reset}>
                ← Yangi hujjat
              </button>
              <button className="btn btn--print" onClick={() => window.print()}>
                🖨️ Chop etish
              </button>
            </div>

            {/* ── Document analysis ── */}
            <section className="card">
              <h2 className="card__title">📋 Hujjat tahlili</h2>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Fayl nomi</span>
                  <span className="meta-value">{da?.fileName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Mavzu</span>
                  <span className="meta-value">{da?.subject || '—'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Tur</span>
                  <span className="badge badge--type">{da?.documentType || '—'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Muhimlik</span>
                  <UrgencyBadge level={da?.urgency} />
                </div>
              </div>

              {da?.purpose && (
                <div className="meta-row">
                  <span className="meta-label">Maqsad</span>
                  <p className="meta-text">{da.purpose}</p>
                </div>
              )}

              {da?.summaryUz && (
                <div className="meta-row">
                  <span className="meta-label">Qisqacha mazmun</span>
                  <p className="meta-text">{da.summaryUz}</p>
                </div>
              )}

              {da?.keywords?.length > 0 && (
                <div className="meta-row">
                  <span className="meta-label">Kalit so'zlar</span>
                  <div className="kw-row">
                    {da.keywords.map((kw, i) => (
                      <span key={i} className="kw-tag">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── All departments ranked ── */}
            {rr?.allDepartments?.length > 0 && (
              <section className="card">
                <h2 className="card__title">
                  📊 Tegishli kafedralar
                  <span className="card__title-sub"> — reytingda tartib bilan</span>
                </h2>
                <div className="dept-list">
                  {rr.allDepartments.map((dept, i) => (
                    <DepartmentCard
                      key={i}
                      dept={dept}
                      rank={i + 1}
                      expanded={i === 0}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Recommendation (screen) ── */}
            {rr?.recommendation && (
              <section className="card recommendation no-print">
                <h2 className="card__title">💡 Tavsiya</h2>
                <p className="recommendation__text">{rr.recommendation}</p>
              </section>
            )}

            {/* ── Print-only footer ── */}
            <div className="print-footer">
              <p className="print-footer__rec">
                <strong>Tavsiya:</strong> {rr?.recommendation}
              </p>
              <div className="print-footer__sigs">
                <span>Mas'ul xodim: _________________</span>
                <span>Sana: _________________</span>
                <span>Imzo: _________________</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
