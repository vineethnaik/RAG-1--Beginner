import { FileText, Loader2 } from 'lucide-react';

export default function Header({ loading, stage, processed, chunkCount }) {
  const statusText = loading ? stage : processed ? `${chunkCount} chunks indexed` : 'Ready';
  const statusColor = loading ? 'text-accent-gold' : processed ? 'text-status-success' : 'text-text-secondary';

  return (
    <header className="fixed top-0 left-0 right-0 h-[58px] bg-dark-surface border-b border-dark-border z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-gold to-accent-orange flex items-center justify-center">
          <FileText className="w-5 h-5 text-dark-bg" />
        </div>
        <div>
          <h1 className="font-serif text-lg text-text-primary">DocQuery</h1>
          <p className="text-xs text-text-muted">RAG PDF Chatbot</p>
        </div>
      </div>
      <div className={`flex items-center gap-2 text-sm ${statusColor}`}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : null}
        <span>{statusText}</span>
      </div>
    </header>
  );
}
