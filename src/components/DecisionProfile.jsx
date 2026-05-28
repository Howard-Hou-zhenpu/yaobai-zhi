import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

export default function DecisionProfile({ decisions }) {
  if (decisions.length < 3) return null;

  const reviewed = decisions.filter((d) => d.status === 'reviewed');
  const regretCount = reviewed.filter((d) => d.satisfaction === 'regret').length;
  const regretRate = reviewed.length > 0 ? Math.round((regretCount / reviewed.length) * 100) : null;

  const categoryCount = {};
  decisions.forEach((d) => {
    categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const withHesitation = decisions.filter((d) => d.hesitation > 0);
  const avgHesitation = withHesitation.length > 0
    ? (withHesitation.reduce((s, d) => s + d.hesitation, 0) / withHesitation.length).toFixed(1)
    : null;

  const withConfidence = decisions.filter((d) => d.confidence > 0);
  const avgConfidence = withConfidence.length > 0
    ? (withConfidence.reduce((s, d) => s + d.confidence, 0) / withConfidence.length).toFixed(1)
    : null;

  const metrics = [
    regretRate !== null && {
      label: '后悔率',
      value: `${regretRate}%`,
      tone: regretRate > 30 ? 'text-[#a0522d]' : 'text-[#5a6b4f]',
    },
    avgHesitation && {
      label: '平均纠结度',
      value: `${avgHesitation}/5`,
      tone: 'text-[#7a6245]',
    },
    avgConfidence && {
      label: '平均信心值',
      value: `${avgConfidence}/5`,
      tone: 'text-[#6b5570]',
    },
  ].filter(Boolean);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">决策画像</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          这些数据不是评判，只是帮你看见自己的决策习惯。
        </p>

        {topCategories.length > 0 && (
          <div>
            <p className="text-[11px] text-[#a09080] tracking-wide uppercase mb-2">最常纠结的领域</p>
            <div className="space-y-1.5">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-[#3d3428] truncate">{cat}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2 tabular-nums">{count} 次</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {metrics.length > 0 && (
          <div>
            <p className="text-[11px] text-[#a09080] tracking-wide uppercase mb-2">关键指标</p>
            <div className="grid grid-cols-3 gap-2">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-border/50 bg-card/60 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground leading-none">{m.label}</p>
                  <p className={cn('text-base font-medium mt-1.5 leading-none tabular-nums', m.tone)}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
