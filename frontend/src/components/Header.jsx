export default function Header({ loading, stage, processed, chunkCount }) {
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
      <div className="badge">
        <div className={`dot ${loading ? 'dot-busy' : processed ? 'dot-on' : 'dot-idle'}`} />
        {badgeText}
      </div>
    </header>
  );
}
