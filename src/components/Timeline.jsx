import { cn } from '../lib/utils';

const steps = [
  { key: 'created', label: '创建', field: 'createdAt' },
  { key: 'completed', label: '选择', field: 'completedAt' },
  { key: 'reviewed', label: '复盘', field: 'reviewedAt' },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function StepCircle({ index, statusIndex }) {
  const done = index < statusIndex;
  const current = index === statusIndex;
  return (
    <div
      className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all',
        done && 'bg-primary text-primary-foreground',
        current && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
        !done && !current && 'bg-secondary text-muted-foreground'
      )}
    >
      {index + 1}
    </div>
  );
}

export default function Timeline({ decision }) {
  const statusIndex = decision.status === 'reviewed' ? 2 : decision.status === 'completed' ? 1 : 0;

  return (
    <div className="mb-5 rounded-2xl border border-border/50 bg-card/40 px-4 py-3">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', alignItems: 'center' }}>
        <div className="flex justify-center"><StepCircle index={0} statusIndex={statusIndex} /></div>
        <div className={cn('h-px', 0 < statusIndex ? 'bg-primary' : 'bg-border')} />
        <div className="flex justify-center"><StepCircle index={1} statusIndex={statusIndex} /></div>
        <div className={cn('h-px', 1 < statusIndex ? 'bg-primary' : 'bg-border')} />
        <div className="flex justify-center"><StepCircle index={2} statusIndex={statusIndex} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }} className="mt-2">
        {steps.map((step, i) => {
          const done = i < statusIndex;
          const current = i === statusIndex;
          const time = decision[step.field];
          return (
            <div key={step.key} className="text-center" style={{ gridColumn: i * 2 + 1 }}>
              <p className={cn(
                'text-xs',
                current && 'text-foreground font-medium',
                done && 'text-foreground',
                !done && !current && 'text-muted-foreground'
              )}>{step.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(time)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
