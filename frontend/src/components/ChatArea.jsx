import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

export default function ChatArea({ messages, loading, loadingStage }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
          <p className="text-text-muted text-sm">Upload a PDF and process it to start asking questions.</p>
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {loading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-dark-surface2 flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 text-accent-gold animate-spin" />
          </div>
          <div className="bg-dark-surface2 border border-dark-border rounded-2xl px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-text-secondary">{loadingStage}</span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
