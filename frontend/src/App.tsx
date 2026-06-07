import React, { useState } from 'react';
import { DiffViewer } from './components/DiffViewer';
import { AnalysisResponse } from './types';

function App() {
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [actualPreviewUrl, setActualPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleActualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setActualFile(file);
      setActualPreviewUrl(URL.createObjectURL(file));
    }
  };

  const runAnalysis = async () => {
    if (!designFile || !actualFile) return alert("Please select both execution frames.");
    setLoading(true);

    const formData = new FormData();
    formData.append("design_file", designFile);
    formData.append("actual_file", actualFile);

    try {
      const currentHost = window.location.host;
      let backendUrl = "";

      if (currentHost.includes("-3000.app.github.dev")) {
        const backendHost = currentHost.replace('-3000.', '-8000.');
        backendUrl = `https://${backendHost}/api/v1/analyze?project_name=Percy-Sandbox`;
      } else if (currentHost.includes("localhost:3000") || currentHost.includes("127.0.0.1:3000")) {
        backendUrl = "http://localhost:8000/api/v1/analyze?project_name=Percy-Sandbox";
      } else {
        backendUrl = "https://orange-spork-xpj4qpw44ww3v6w9-8000.app.github.dev/api/v1/analyze?project_name=Percy-Sandbox";
      }

      const response = await fetch(backendUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend system failed layout extraction processing.");
      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      alert(err.message || "Network layout initialization failure.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusMeta = (status: string) => {
    switch(status) {
      case 'missing':
        return { color: '#ef4444', label: 'Missing Base Element', bg: '#fef2f2', border: '#fca5a5' };
      case 'extra':
        return { color: '#22c55e', label: 'Extra Live Element', bg: '#f0fdf4', border: '#86efac' };
      case 'misplaced':
        return { color: '#3b82f6', label: 'Misplaced / Shifted', bg: '#eff6ff', border: '#93c5fd' };
      default:
        return { color: '#64748b', label: 'Unknown', bg: '#f8fafc', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '24px', maxWidth: '1600px', margin: '0 auto', color: '#1e293b' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 4px 0' }}>Visual Testing Engine Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Automated structural layout validation layer.</p>
      </header>

      {/* Upload Inputs Grid Control Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>1. Baseline Design Image</label>
          <input type="file" accept="image/*" onChange={(e) => setDesignFile(e.target.files?.[0] || null)} />
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>2. Live Captured Screenshot</label>
          <input type="file" accept="image/*" onChange={handleActualChange} />
        </div>
      </div>

      <button 
        onClick={runAnalysis} 
        disabled={loading}
        style={{
          backgroundColor: loading ? '#94a3b8' : '#0f172a',
          color: '#fff',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {loading ? "Processing Computer Vision Core..." : "Run Layout Comparison"}
      </button>

      {result && (
        <div style={{ marginTop: '32px' }}>
          {/* Summary Banner Row */}
          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '32px', fontSize: '15px', border: '1px solid #e2e8f0' }}>
            <div><strong>Overall Color Delta Score:</strong> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>{result.color_diff_score.toFixed(4)}</code></div>
            <div><strong>Total Anomalies Highlighted:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{result.diff_boxes.length} elements</span></div>
          </div>

          {/* TWO-COLUMN WORKSPACE BREAKDOWN */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* COLUMN 1 (LEFT): The Interactive Diff Image Overlay */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Diff Overlay View Canvas</h3>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                <DiffViewer screenshotUrl={actualPreviewUrl} diffBoxes={result.diff_boxes} />
              </div>
            </div>

            {/* COLUMN 2 (RIGHT): Color-Coded Inspector Panel & Legend */}
            <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Box 1: Color Legend Indicator Grid */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgb(0 0 0 / 0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Anomaly Map Legend</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#ef4444' }} />
                    <strong>Red:</strong> Missing Layout Elements
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#22c55e' }} />
                    <strong>Green:</strong> Extra Live Element
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#3b82f6' }} />
                    <strong>Blue:</strong> Shifted / Misplaced Bounds
                  </div>
                </div>
              </div>

              {/* Box 2: Scrollable Element Anomaly List Feed */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgb(0 0 0 / 0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Detected Component Anomalies ({result.diff_boxes.length})</h4>
                
                <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                  {result.diff_boxes.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '24px 0' }}>Perfect structural match! No anomalies found.</div>
                  ) : (
                    result.diff_boxes.map((diff, index) => {
                      const meta = getStatusMeta(diff.status);
                      return (
                        <div 
                          key={index}
                          style={{
                            background: meta.bg,
                            border: `1px solid ${meta.border}`,
                            borderRadius: '6px',
                            padding: '10px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 'bold', color: meta.color, textTransform: 'uppercase', fontSize: '11px' }}>
                              #{index + 1} - {meta.label}
                            </span>
                          </div>
                          <div style={{ color: '#475569' }}>
                            <strong>Bounding Box:</strong> X: {diff.box.x}, Y: {diff.box.y} ({diff.box.w}x{diff.box.h}px)
                          </div>
                          {diff.status === 'misplaced' && (
                            <div style={{ marginTop: '4px', color: '#1e40af', fontWeight: 500 }}>
                              <strong>Pixel Drift:</strong> ΔX: {diff.delta_x}px, ΔY: {diff.delta_y}px
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div> {/* Closing Column 2 container safely */}
          </div> {/* Closing Two-column breakdown grid safely */}
        </div>
      )}
    </div>
  );
}

export default App; // Added explicit default export for index.tsx matching TS1192