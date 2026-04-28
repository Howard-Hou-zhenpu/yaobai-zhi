import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SATISFACTION_MAP } from '../lib/constants';

const COLORS = { satisfied: '#7a9b6a', neutral: '#c9b896', regret: '#a0522d' };

export default function ReviewChart({ decisions }) {
  const reviewed = decisions.filter((d) => d.status === 'reviewed' && d.satisfaction);
  if (reviewed.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">满意度分析</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">暂无复盘数据</p>
        </CardContent>
      </Card>
    );
  }

  const data = Object.entries(SATISFACTION_MAP).map(([key, val]) => ({
    name: `${val.emoji} ${val.label}`,
    value: reviewed.filter((d) => d.satisfaction === key).length,
    key,
  })).filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">满意度分析</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} 次`]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-1">
          {data.map((d) => {
            const pct = Math.round((d.value / reviewed.length) * 100);
            return (
              <div key={d.key} className="flex items-center gap-1.5 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.key] }} />
                <span>{d.name}</span>
                <span className="text-muted-foreground text-xs">{pct}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
