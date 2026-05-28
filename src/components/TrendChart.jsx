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
        <div className="rounded-xl bg-[#f7f1e4]/60 px-3 pt-3 pb-2">
          <div className="flex items-end gap-2 h-32">
            {data.map((d, i) => {
              const heightPct = Math.max((d.score / 3) * 100, 18);
              const colorIdx = Math.round(d.score);
              const color = SCORE_COLOR[colorIdx] || '#c9b896';
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 h-full">
                  <span className="text-[11px] font-medium text-[#3d3428] tabular-nums leading-none">{d.score}</span>
                  <div
                    className="w-full max-w-[28px] mx-auto rounded-t-md shadow-[inset_0_-2px_0_rgba(0,0,0,0.04)]"
                    style={{ height: `${heightPct}%`, backgroundColor: color }}
                    title={`${d.week} · 平均 ${SCORE_LABEL[colorIdx] || ''} (${d.count} 条)`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-end gap-2 mt-1.5">
            {data.map((d, i) => (
              <div key={i} className="flex-1 text-[10px] text-muted-foreground text-center truncate">
                {d.week}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            每周分数由该周复盘结果换算而来：满意 3 分，一般 2 分，后悔 1 分。
          </p>
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            分数越高，说明当周复盘结果越满意。
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 mt-2 text-[10px] text-muted-foreground/80">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: SCORE_COLOR[3] }} />满意</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: SCORE_COLOR[2] }} />一般</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: SCORE_COLOR[1] }} />后悔</span>
        </div>
      </CardContent>
    </Card>
  );
}
