import { useState, useRef } from 'react';

export default function FileUpload({ onFileLoad, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setError(null);
    onFileLoad(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setError(null);
    onFileLoad(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <div
        className={`dropzone ${isDragging ? 'on' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer', pointerEvents: disabled ? 'none' : 'auto' }}
          disabled={disabled}
        />
        <div className="dz-icon">📄</div>
        <div className="dz-title">Drop PDF here</div>
        <div className="dz-hint">or click to browse</div>
      </div>
      {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
    </div>
  );
}
