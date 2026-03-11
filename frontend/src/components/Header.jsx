export default function Header({ loading, stage, processed, chunkCount, messageCount, onSettingsOpen, onExport }) {
  const showRetrieval = loading && (stage?.toLowerCase().includes('expanding') || stage?.toLowerCase().includes('retrieving'));
  const badgeText = loading ? (stage || 'THINKING').toUpperCase() : processed ? `BM25 · ${chunkCount} CHUNKS` : 'AWAITING PDF';

  return (
    <header className="hd">
      <div className="logo">
        <div className="logo-mark">🔍</div>
        <div>
          <div className="logo-name">DocQuery</div>
          <div className="logo-tag">RAG · PDF Intelligence</div>
        </div>
      </div>
      <div className="badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className={`dot ${loading && showRetrieval ? 'dot-busy' : processed ? 'dot-on' : 'dot-idle'}`} />
        <span>{badgeText}</span>
        <div className="hd-actions">
          {messageCount > 1 && (
            <button type="button" className="hd-btn" onClick={onExport} title="Export chat">↓</button>
          )}
          <button type="button" className="hd-btn" onClick={onSettingsOpen} title="Settings">⚙</button>
        </div>
      </div>
    </header>
  );
}
