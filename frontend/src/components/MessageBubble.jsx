import { User } from 'lucide-react';
import SourceChip from './SourceChip';

function renderAnswer(text) {
  if (!text) return null;
  const parts = text.split(/(\[Source \d+\])/g);
  return parts.map((part, i) => {
    const sourceMatch = part.match(/\[Source (\d+)\]/);
    if (sourceMatch) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-accent-gold/25 text-accent-gold text-sm font-medium mx-0.5"
        >
          {part}
        </span>
      );
    }
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={`${i}-${j}`} className="text-accent-gold font-semibold">{bp.slice(2, -2)}</strong>;
      }
      const codeParts = bp.split(/(`[^`]+`)/g);
      return codeParts.map((cp, k) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return <code key={`${i}-${j}-${k}`} className="font-mono text-sm bg-dark-surface2 px-1 rounded">{cp.slice(1, -1)}</code>;
        }
        return <span key={`${i}-${j}-${k}`}>{cp}</span>;
      });
    });
  });
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isUser ? 'bg-gradient-to-br from-accent-gold to-accent-orange' : 'bg-dark-surface2'}`}>
        {isUser ? <User className="w-4 h-4 text-dark-bg" /> : (
          <span className="text-sm font-serif text-accent-gold">DQ</span>
        )}
      </div>
      <div className={`flex-1 min-w-0 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`
          inline-block px-4 py-3 rounded-2xl
          ${isUser ? 'bg-gradient-to-br from-accent-gold/20 to-accent-orange/20 border border-accent-gold/30' : 'bg-dark-surface2 border border-dark-border'}
        `}>
          {message.error ? (
            <p className="text-status-error text-sm">{message.error}</p>
          ) : message.text ? (
            <div className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
              {renderAnswer(message.text)}
            </div>
          ) : null}
        </div>
        {!isUser && message.sources?.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-text-muted mb-2">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((s, i) => (
                <SourceChip key={i} source={s} index={i} />
              ))}
            </div>
          </div>
        )}
        {!isUser && message.expandedTerms?.length > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            Query terms: {message.expandedTerms.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
