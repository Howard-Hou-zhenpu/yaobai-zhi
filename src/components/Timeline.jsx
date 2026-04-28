import { cn } from '../lib/utils';

const steps = [
  { key: 'created', label: '创建', field: 'createdAt' },
  { key: 'completed', label: '选择', field: 'completedAt' },
  { key: 'reviewed', label: '复盘', field: 'reviewedAt' },
];

export default function Timeline({ decision }) {
  const statusIndex = decision.status === 'reviewed' ? 2 : decision.status === 'completed' ? 1 : 0;

  return (
    <div className="mb-5 px-4">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
              i <= statusIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            )}>
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-px flex-1 mx-2',
                i < statusIndex ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {steps.map((step, i) => {
          const time = decision[step.field];
          return (
            <div key={step.key} className="text-center" style={{ width: '33.33%' }}>
              <span className={cn('text-xs', i <= statusIndex ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
              </span>
              {time && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
