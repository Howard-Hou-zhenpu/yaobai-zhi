import { cn } from '../lib/utils';

const steps = [
  { key: 'created', label: '创建', field: 'createdAt' },
  { key: 'completed', label: '选择', field: 'completedAt' },
  { key: 'reviewed', label: '复盘', field: 'reviewedAt' },
];

export default function Timeline({ decision }) {
  const statusIndex = decision.status === 'reviewed' ? 2 : decision.status === 'completed' ? 1 : 0;

  return (
    <div className="flex items-center justify-between mb-5 px-2">
      {steps.map((step, i) => {
        const done = i <= statusIndex;
        const time = decision[step.field];
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              )}>
                {i + 1}
              </div>
              <span className={cn('text-xs mt-1.5', done ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
              </span>
              {time && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-2 mt-[-1.5rem]',
                i < statusIndex ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
