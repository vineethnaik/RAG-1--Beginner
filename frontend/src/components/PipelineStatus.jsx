import { Check, Circle, Loader2 } from 'lucide-react';

export default function PipelineStatus({ stages, currentStage }) {
  const steps = [
    { id: 'upload', label: 'Upload PDF', done: !!stages.uploaded },
    { id: 'chunk', label: 'Chunk text', done: stages.processed, active: currentStage === 'chunk' },
    { id: 'index', label: 'Build index', done: stages.indexed, active: currentStage === 'index' },
    { id: 'ready', label: 'Ready', done: stages.ready, active: currentStage === 'ready' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Pipeline</p>
      <div className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center shrink-0
              ${step.done ? 'bg-status-success text-dark-bg' : step.active ? 'bg-accent-gold text-dark-bg' : 'bg-dark-border2'}
            `}>
              {step.done ? <Check className="w-3 h-3" /> : step.active ? <Loader2 className="w-3 h-3 animate-spin" /> : <Circle className="w-2 h-2" />}
            </div>
            <span className={`text-sm ${step.done || step.active ? 'text-text-primary' : 'text-text-muted'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
