import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';

const SAMPLE_QUESTIONS = [
  'What is the main topic of this document?',
  'Summarize the key points',
  'What are the main conclusions?',
  'List the important findings',
];

export default function InputArea({ processed, loading, onSend }) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || loading || !processed) return;
    onSend(trimmed);
    setValue('');
  }, [value, loading, processed, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-dark-border bg-dark-surface p-4">
      {processed && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => onSend(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-dark-border2 text-text-secondary hover:border-accent-gold/50 hover:text-accent-gold transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={processed ? 'Ask anything about the document...' : 'Process a document first'}
          disabled={!processed || loading}
          rows={2}
          className="flex-1 resize-none rounded-xl border border-dark-border2 bg-dark-surface2 px-4 py-3 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSubmit}
          disabled={!processed || loading || !value.trim()}
          className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent-gold to-accent-orange text-dark-bg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-2 text-xs text-text-muted">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
