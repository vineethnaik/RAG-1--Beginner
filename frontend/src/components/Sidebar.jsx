import { FileText, Trash2, Loader2 } from 'lucide-react';
import FileUpload from './FileUpload';
import PipelineStatus from './PipelineStatus';

export default function Sidebar({ doc, onFileLoad, onProcess, onReset, canProcess }) {
  const { fileName, fileSize, pageCount, chunks, index, processing, processed, progress, progressLabel, error, reset } = doc;
  const hasFile = !!fileName;

  return (
    <aside className="w-[320px] shrink-0 border-r border-dark-border bg-dark-surface flex flex-col overflow-hidden">
      <div className="p-4 border-b border-dark-border space-y-4">
        <h2 className="text-sm font-medium text-text-primary">Document</h2>
        <FileUpload onFileLoad={onFileLoad} disabled={processing} />
        {error && (
          <p className="text-sm text-status-error">{error}</p>
        )}
        {hasFile && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-dark-surface2 border border-dark-border">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-accent-gold shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-text-primary truncate">{fileName}</p>
                  <p className="text-xs text-text-muted">
                    {(fileSize / 1024).toFixed(1)} KB · {pageCount} pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => { doc.reset(); onReset?.(); }}
                disabled={processing}
                className="p-1.5 rounded hover:bg-dark-border text-text-muted hover:text-status-error transition-colors disabled:opacity-50"
                title="Remove document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => canProcess && onProcess?.()}
              disabled={processing || !(canProcess && hasFile)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-br from-accent-gold to-accent-orange text-dark-bg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {progressLabel}
                </>
              ) : processed ? (
                'Re-process'
              ) : (
                'Process & Index'
              )}
            </button>
            {processing && (
              <div className="h-1.5 rounded-full bg-dark-border2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-gold to-accent-orange transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-4 border-b border-dark-border">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-dark-surface2 border border-dark-border">
            <p className="text-xs text-text-muted">Chunks</p>
            <p className="text-lg font-semibold text-text-primary">{chunks?.length ?? 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-dark-surface2 border border-dark-border">
            <p className="text-xs text-text-muted">Pages</p>
            <p className="text-lg font-semibold text-text-primary">{pageCount ?? 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-dark-surface2 border border-dark-border">
            <p className="text-xs text-text-muted">Terms</p>
            <p className="text-lg font-semibold text-text-primary">
              {index ? Object.keys(index.idf).length : 0}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-dark-surface2 border border-dark-border">
            <p className="text-xs text-text-muted">Algorithm</p>
            <p className="text-sm font-semibold text-accent-gold">BM25</p>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <PipelineStatus
          stages={{
            uploaded: hasFile,
            processed: processed,
            indexed: !!index,
            ready: processed,
          }}
          currentStage={processing ? (progress < 50 ? 'chunk' : progress < 90 ? 'index' : 'ready') : processed ? 'ready' : null}
        />
      </div>
    </aside>
  );
}
