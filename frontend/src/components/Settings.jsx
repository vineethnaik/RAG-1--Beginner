export default function Settings({ open, onClose, settings, onChange, onExport }) {
  if (!open) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose} aria-hidden="true" />
      <div className="settings-panel">
        <div className="settings-hd">
          <h2 className="settings-title">⚙ Settings</h2>
          <button type="button" className="settings-close" onClick={onClose}>✕</button>
        </div>
        <div className="settings-body">
          <div className="settings-group">
            <label>Model</label>
            <select
              value={settings.model}
              onChange={e => onChange({ ...settings, model: e.target.value })}
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B (fast)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
            </select>
          </div>
          <div className="settings-group">
            <label>Chunk size: {settings.chunkSize}</label>
            <input
              type="range"
              min={300}
              max={1200}
              step={100}
              value={settings.chunkSize}
              onChange={e => onChange({ ...settings, chunkSize: Number(e.target.value) })}
            />
          </div>
          <div className="settings-group">
            <label>Top-K retrieval: {settings.topK}</label>
            <input
              type="range"
              min={2}
              max={12}
              value={settings.topK}
              onChange={e => onChange({ ...settings, topK: Number(e.target.value) })}
            />
          </div>
          <div className="settings-group">
            <label>Response length</label>
            <select
              value={settings.responseLength}
              onChange={e => onChange({ ...settings, responseLength: e.target.value })}
            >
              <option value="concise">Concise</option>
              <option value="normal">Normal</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
          <button type="button" className="btn btn-g" onClick={onExport}>
            ↓ Export Chat
          </button>
        </div>
      </div>
    </>
  );
}
