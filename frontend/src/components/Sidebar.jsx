import FileUpload from './FileUpload';

const archSteps = [
  { label: 'Load PDF', sub: 'Text extraction' },
  { label: 'Sentence Chunking', sub: '600 chars, 100 overlap' },
  { label: 'BM25 Index', sub: 'Term frequency scoring' },
  { label: 'Stem & Normalize', sub: 'Vocabulary compression' },
  { label: 'Index Ready', sub: 'Retrieval enabled' },
];

const querySteps = [
  { lbl: 'Query Expansion', sub: 'LLM term expansion', stage: 'query' },
  { lbl: 'BM25 Retrieval', sub: 'Top-6 + neighbors', stage: 'chunk' },
  { lbl: 'LLM', sub: 'Cited answer generation', stage: 'answer' },
];

export default function Sidebar({ doc, onFileLoad, onProcess, onReset, canProcess, loading, queryStage = 0 }) {
  const { fileName, fileSize, pageCount, chunks, index, processing, processed, progress, progressLabel, error, reset } = doc;
  const hasFile = !!fileName;

  const archStep = processing ? (progress < 20 ? 1 : progress < 40 ? 2 : progress < 70 ? 3 : progress < 90 ? 4 : 5) : processed ? 5 : 0;

  return (
    <aside className="sb">
      <div className="sb-sec">
        <div className="sec-lbl">📂 Document</div>
        {!hasFile ? (
          <FileUpload onFileLoad={onFileLoad} disabled={processing} />
        ) : null}
        {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        {hasFile && (
          <div className="file-card">
            <div className="fc-icon">📋</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="fc-name">{fileName}</div>
              <div className="fc-meta">{(fileSize / 1024).toFixed(1)} KB · {pageCount} pages</div>
            </div>
            <div className="fc-rm" onClick={() => { reset(); onReset?.(); }} title="Remove document">✕</div>
          </div>
        )}
      </div>

      {hasFile && !processed && (
        <div className="sb-sec">
          <button
            className="btn btn-p"
            disabled={processing || !canProcess}
            onClick={() => canProcess && onProcess?.()}
          >
            {processing ? '⚙️ Building Index…' : '⚡ Process & Index'}
          </button>
          {processing && (
            <>
              <div className="prog-wrap">
                <div className="prog-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="prog-lbl">{progressLabel}</div>
            </>
          )}
        </div>
      )}

      {processed && (
        <div className="sb-sec">
          <div className="sec-lbl">📊 Index Stats</div>
          <div className="stats">
            <div className="stat"><div className="stat-v">{chunks?.length ?? 0}</div><div className="stat-l">Chunks</div></div>
            <div className="stat"><div className="stat-v">{pageCount ?? 0}</div><div className="stat-l">Pages</div></div>
            <div className="stat"><div className="stat-v">{index ? Object.keys(index.idf).length : 0}</div><div className="stat-l">Index Terms</div></div>
            <div className="stat"><div className="stat-v">BM25</div><div className="stat-l">Algorithm</div></div>
          </div>
        </div>
      )}

      <div className="sb-sec">
        <div className="sec-lbl">🏗 RAG Pipeline</div>
        <div className="pipe">
          {archSteps.map((s, i) => (
            <div className="pipe-step" key={i}>
              <div className={`pipe-num ${processed || archStep > i + 1 ? 'ps-done' : archStep === i + 1 ? 'ps-active' : ''}`}>
                {processed || archStep > i + 1 ? '✓' : i + 1}
              </div>
              <div>
                <div className="pipe-lbl">{s.label}</div>
                <div className="pipe-sub">{s.sub}</div>
              </div>
            </div>
          ))}
          {querySteps.map((s, i) => {
            const stepNum = 6 + i;
            const done = queryStage > i + 1;
            const active = loading && queryStage === i + 1;
            return (
              <div className="pipe-step" key={`q-${i}`}>
                <div className={`pipe-num ${done ? 'ps-done' : active ? 'ps-active' : ''}`}>
                  {done ? '✓' : stepNum}
                </div>
                <div>
                  <div className="pipe-lbl">{s.lbl}</div>
                  <div className="pipe-sub">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {processed && (
        <div className="sb-sec">
          <button className="btn btn-g" onClick={() => { reset(); onReset?.(); }}>📂 Load New Document</button>
        </div>
      )}
    </aside>
  );
}
