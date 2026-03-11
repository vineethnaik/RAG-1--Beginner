import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function FileUpload({ onFileLoad, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

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
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-accent-gold bg-dark-surface2/50' : 'border-dark-border2 hover:border-dark-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        <Upload className={`w-10 h-10 ${isDragging ? 'text-accent-gold' : 'text-text-muted'}`} />
        <span className="text-sm text-text-secondary">
          Drag & drop PDF or <span className="text-accent-gold underline">browse</span>
        </span>
      </label>
      {error && (
        <p className="text-sm text-status-error flex items-center gap-2">
          {error}
        </p>
      )}
    </div>
  );
}
