import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function getWeekKey(date) {
  const d = new Date(date);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function formatWeekLabel(key) {
  const [year, w] = key.split('-W');
  return `第${parseInt(w)}周`;
}

export default function TrendChart({ decisions }) {
  const reviewed = decisions.filter((d) => d.status === 'reviewed' && d.satisfaction && d.reviewedAt);
  if (reviewed.length < 3) return null;

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

  if (data.length < 3) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">决策质量趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b5d4f' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 10, fill: '#6b5d4f' }} axisLine={false} tickLine={false} width={28}
              tickFormatter={(v) => ['', '后悔', '一般', '满意'][v] || ''} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #d4cbb8', background: '#f5f1e8', fontSize: 12 }}
              formatter={(value) => [`${value} 分`, '平均满意度']}
              labelFormatter={(label) => label}
            />
            <Line type="monotone" dataKey="score" stroke="#8b7355" strokeWidth={2} dot={{ fill: '#8b7355', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
