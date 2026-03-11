import { useState, useCallback } from 'react';

export default function InputArea({ processed, loading, onSend }) {
  const [question, setQuestion] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed || loading || !processed) return;
    onSend(trimmed);
    setQuestion('');
  }, [question, loading, processed, onSend]);

  return (
    <div className="input-area">
      <div className="input-row">
        <textarea
          className="ta"
          rows={1}
          placeholder={processed ? 'Ask anything about your document…' : 'Process a PDF document first'}
          value={question}
          disabled={!processed || loading}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button
          className="send"
          disabled={!processed || loading || !question.trim()}
          onClick={handleSubmit}
        >
          ➤
        </button>
      </div>
      <div className="input-hint">
        {processed
          ? 'Enter to send · Shift+Enter for new line · Click source chips to inspect retrieved text'
          : 'Upload & process a PDF to start asking questions'}
      </div>
    </div>
  );
}
