import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function getWeekKey(date) {
  const d = new Date(date);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function formatWeekLabel(key) {
  const [, w] = key.split('-W');
  return `第${parseInt(w)}周`;
}

const SCORE_LABEL = ['', '后悔', '一般', '满意'];
const SCORE_COLOR = ['', '#a0522d', '#c9b896', '#7a9b6a'];

export default function TrendChart({ decisions }) {
  const reviewed = decisions.filter((d) => d.status === 'reviewed' && d.satisfaction && d.reviewedAt);

  if (reviewed.length < 3) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">决策质量趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4 leading-relaxed">
            复盘数据再多一些后，会显示你的满意度变化。
          </p>
        </CardContent>
      </Card>
    );
  }

  const scoreMap = { satisfied: 3, neutral: 2, regret: 1 };

  const weekMap = {};
  reviewed.forEach((d) => {
    const key = getWeekKey(d.reviewedAt);
    if (!weekMap[key]) weekMap[key] = { total: 0, count: 0 };
    weekMap[key].total += scoreMap[d.satisfaction] || 0;
    weekMap[key].count += 1;
  });

  const data = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, { total, count }]) => ({
      week: formatWeekLabel(week),
      score: +(total / count).toFixed(1),
      count,
    }));

  if (data.length < 3) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">决策质量趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4 leading-relaxed">
            复盘数据再多一些后，会显示你的满意度变化。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">决策质量趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 h-28">
          {data.map((d, i) => {
            const heightPct = (d.score / 3) * 100;
            const colorIdx = Math.round(d.score);
            const color = SCORE_COLOR[colorIdx] || '#c9b896';
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div className="text-[10px] text-muted-foreground tabular-nums">{d.score}</div>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{ height: `${Math.max(heightPct, 8)}%`, backgroundColor: color, opacity: 0.85 }}
                    title={`${d.week} · 平均 ${SCORE_LABEL[colorIdx] || ''} (${d.count} 条)`}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground truncate w-full text-center">{d.week}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-3 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: SCORE_COLOR[3] }} />满意</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: SCORE_COLOR[2] }} />一般</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: SCORE_COLOR[1] }} />后悔</span>
        </div>
      </CardContent>
    </Card>
  );
}
