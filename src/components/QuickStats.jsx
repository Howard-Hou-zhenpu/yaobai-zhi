import { Card, CardContent } from './ui/card';
import { ListChecks, CheckCircle2, BarChart3, CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function QuickStats({ decisions }) {
  const total = decisions.length;
  const completed = decisions.filter((d) => d.status === 'completed' || d.status === 'reviewed').length;
  const reviewed = decisions.filter((d) => d.status === 'reviewed').length;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);

  const thisWeek = decisions.filter((d) => new Date(d.createdAt) >= weekStart).length;
  const lastWeek = decisions.filter((d) => {
    const date = new Date(d.createdAt);
    return date >= prevWeekStart && date < weekStart;
  }).length;

  const completionRate = total > 0 ? completed / total : 0;
  const reviewRate = completed > 0 ? reviewed / completed : 0;
  const weeklyBar = Math.max(thisWeek, lastWeek, 1);
  const weeklyDelta = thisWeek - lastWeek;

  const stats = [
    {
      label: '总决策',
      value: total,
      icon: ListChecks,
      color: 'text-[#8b7355] bg-[#e8dfd0]',
      bar: total > 0 ? 1 : 0,
      hint: total > 0 ? '全部记录' : '等待开始',
    },
    {
      label: '已完成',
      value: completed,
      icon: CheckCircle2,
      color: 'text-[#5a6b4f] bg-[#dde5d4]',
      bar: completionRate,
      hint: `${Math.round(completionRate * 100)}%`,
    },
    {
      label: '已复盘',
      value: reviewed,
      icon: BarChart3,
      color: 'text-[#6b5570] bg-[#ddd8e0]',
      bar: reviewRate,
      hint: completed > 0 ? `${Math.round(reviewRate * 100)}%` : '0%',
    },
    {
      label: '本周新增',
      value: thisWeek,
      icon: CalendarDays,
      color: 'text-[#7a6245] bg-[#e8ddd0]',
      bar: thisWeek / weeklyBar,
      hint: weeklyDelta === 0 ? '持平' : `${weeklyDelta > 0 ? '+' : ''}${weeklyDelta}`,
      trend: weeklyDelta > 0 ? TrendingUp : weeklyDelta < 0 ? TrendingDown : Minus,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border/40 bg-card/70 shadow-none">
          <CardContent className="p-3 flex flex-col gap-2">
            <div className="flex items-center justify-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-medium leading-none">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground tracking-wide mt-1">{stat.label}</div>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-secondary/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, stat.bar * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                {stat.trend && <stat.trend className="w-3 h-3" strokeWidth={1.8} />}
                <span>{stat.hint}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
