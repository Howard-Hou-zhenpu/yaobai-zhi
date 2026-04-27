import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function TrendChart({ decisions }) {
  const reviewed = decisions.filter((d) => d.status === 'reviewed' && d.satisfaction && d.reviewedAt);
  if (reviewed.length < 2) return null;

  const scoreMap = { satisfied: 3, neutral: 2, regret: 1 };

  const monthMap = {};
  reviewed.forEach((d) => {
    const date = new Date(d.reviewedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = { total: 0, count: 0 };
    monthMap[key].total += scoreMap[d.satisfaction] || 0;
    monthMap[key].count += 1;
  });

  const data = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, { total, count }]) => ({
      month: month.slice(5) + '月',
      score: +(total / count).toFixed(1),
      count,
    }));

  if (data.length < 2) return null;

  return (
    <Card className="mt-5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">本月决策质量趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b5d4f' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 10, fill: '#6b5d4f' }} axisLine={false} tickLine={false} width={20}
              tickFormatter={(v) => ['', '后悔', '一般', '满意'][v] || ''} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #d4cbb8', background: '#f5f1e8', fontSize: 12 }}
              formatter={(value, name) => [`${value} 分`, '平均满意度']}
              labelFormatter={(label) => label}
            />
            <Line type="monotone" dataKey="score" stroke="#8b7355" strokeWidth={2} dot={{ fill: '#8b7355', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
