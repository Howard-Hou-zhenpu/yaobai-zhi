import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function DecisionProfile({ decisions }) {
  if (decisions.length < 3) return null;

  const reviewed = decisions.filter((d) => d.status === 'reviewed');
  const regretCount = reviewed.filter((d) => d.satisfaction === 'regret').length;
  const regretRate = reviewed.length > 0 ? Math.round((regretCount / reviewed.length) * 100) : 0;

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

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">决策画像</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topCategories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">最常纠结的领域</p>
            <div className="flex gap-2">
              {topCategories.map(([cat, count]) => (
                <span key={cat} className="text-sm">
                  {cat} <span className="text-muted-foreground text-xs">({count}次)</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-6 text-sm">
          {reviewed.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">后悔率</p>
              <p className={regretRate > 30 ? 'text-[#a0522d] font-medium' : 'text-[#5a6b4f] font-medium'}>
                {regretRate}%
              </p>
            </div>
          )}
          {avgHesitation && (
            <div>
              <p className="text-xs text-muted-foreground">平均纠结度</p>
              <p className="font-medium">{avgHesitation}/5</p>
            </div>
          )}
          {avgConfidence && (
            <div>
              <p className="text-xs text-muted-foreground">平均信心值</p>
              <p className="font-medium">{avgConfidence}/5</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
