import { useState, useRef } from 'react';

export default function FileUpload({ onFileLoad, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const processingRef = useRef(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || processingRef.current) return;
    fileRef.current?.click();
  };

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
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setError(null);
    processingRef.current = true;
    onFileLoad(file);
    e.target.value = '';
    setTimeout(() => { processingRef.current = false; }, 500);
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        disabled={disabled}
        tabIndex={-1}
      />
      <div
        className={`dropzone ${isDragging ? 'on' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, position: 'relative' }}
      >
        <div className="dz-icon">📄</div>
        <div className="dz-title">Drop PDF here</div>
        <div className="dz-hint">or click to browse</div>
      </div>
      {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
    </div>
  );
}
