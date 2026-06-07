import React, { useRef, useState, useEffect } from 'react';
import { DiffBox } from '../types';

interface DiffViewerProps {
  screenshotUrl: string; // The base URL/DataURI of the actual website screenshot
  diffBoxes: DiffBox[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ screenshotUrl, diffBoxes }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // Dynamically calculate scales based on 1920x1080 backend analysis canvas
  const handleResize = () => {
    if (imgRef.current) {
      const displayWidth = imgRef.current.clientWidth;
      const displayHeight = imgRef.current.clientHeight;
      
      setScale({
        x: displayWidth / 1920,
        y: displayHeight / 1080,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper mapping status to explicit CSS styling rules
  const getBoxStyle = (status: string) => {
    switch (status) {
      case 'misplaced': return { border: '2px solid #3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.15)' }; // Blue
      case 'missing': return { border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' };    // Red
      case 'extra': return { border: '2px solid #22c55e', backgroundColor: 'rgba(34, 197, 94, 0.15)' };     // Green
      default: return {};
    }
  };

  return (
    <div className="diff-viewer-container" ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {/* Target Base Image Viewport */}
      <img 
        ref={imgRef}
        src={screenshotUrl} 
        alt="Web actual screenshot" 
        onLoad={handleResize}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />

      {/* Box Drawing Map Overlay */}
      {diffBoxes.map((diff, index) => {
        const { x, y, w, h } = diff.box;
        return (
          <div
            key={index}
            className="group absolute-box"
            style={{
              position: 'absolute',
              left: `${x * scale.x}px`,
              top: `${y * scale.y}px`,
              width: `${w * scale.x}px`,
              height: `${h * scale.y}px`,
              pointerEvents: 'auto',
              cursor: 'pointer',
              boxSizing: 'border-box',
              ...getBoxStyle(diff.status)
            }}
          >
            {/* Context Tooltip showing position offsets */}
            <div style={{
              visibility: 'hidden',
              position: 'absolute',
              bottom: '105%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1e293b',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              zIndex: 50,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} className="group-hover:visible">
              <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{diff.status}</span>
              {diff.status === 'misplaced' && (
                <div>Δx: {diff.delta_x}px | Δy: {diff.delta_y}px</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};