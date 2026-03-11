import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceChip({ source, index }) {
  const [expanded, setExpanded] = useState(false);
  const score = source.score?.toFixed(2) ?? '0';

  return (
    <div className="border border-dark-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-dark-surface2 transition-colors"
      >
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent-gold/20 text-accent-gold text-sm font-medium">
          Source {index + 1}
        </span>
        <span className="text-xs text-text-muted">BM25: {score}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-dark-border bg-dark-surface2/50">
          <p className="text-sm text-text-secondary font-mono leading-relaxed whitespace-pre-wrap">
            {source.chunk?.text}
          </p>
        </div>
      )}
    </div>
  );
}
