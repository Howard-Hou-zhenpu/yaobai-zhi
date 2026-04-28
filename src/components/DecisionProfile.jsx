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
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">决策画像</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">最常纠结的领域</p>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="px-2.5 py-1 rounded-lg bg-secondary/50 text-sm">
                  {cat} <span className="text-muted-foreground text-xs ml-1">({count}次)</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {reviewed.length > 0 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">后悔率</p>
              <p className={`text-lg font-medium ${regretRate > 30 ? 'text-[#a0522d]' : 'text-[#5a6b4f]'}`}>
                {regretRate}%
              </p>
            </div>
          )}
          {avgHesitation && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">平均纠结度</p>
              <p className="text-lg font-medium">{avgHesitation}/5</p>
            </div>
          )}
          {avgConfidence && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">平均信心值</p>
              <p className="text-lg font-medium">{avgConfidence}/5</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
