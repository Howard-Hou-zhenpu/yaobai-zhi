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

export default function Timeline({ decision }) {
  const statusIndex = decision.status === 'reviewed' ? 2 : decision.status === 'completed' ? 1 : 0;

  return (
    <div className="mb-5">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', alignItems: 'center' }}>
        {/* Row 1: circles and lines */}
        <div className="flex justify-center">
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
            0 <= statusIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
          )}>1</div>
        </div>
        <div className={cn('h-px', 0 < statusIndex ? 'bg-primary' : 'bg-border')} />
        <div className="flex justify-center">
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
            1 <= statusIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
          )}>2</div>
        </div>
        <div className={cn('h-px', 1 < statusIndex ? 'bg-primary' : 'bg-border')} />
        <div className="flex justify-center">
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
            2 <= statusIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
          )}>3</div>
        </div>
      </div>
      {/* Row 2: labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }} className="mt-1.5">
        {steps.map((step, i) => {
          const done = i <= statusIndex;
          const time = decision[step.field];
          return (
            <div key={step.key} className="text-center" style={{ gridColumn: i * 2 + 1 }}>
              <p className={cn('text-xs', done ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</p>
              <p className="text-[10px] text-muted-foreground">{formatDate(time)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
