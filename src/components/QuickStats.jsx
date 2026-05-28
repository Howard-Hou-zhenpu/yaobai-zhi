import { Card, CardContent } from './ui/card';
import { ListChecks, CheckCircle2, BarChart3, CalendarDays } from 'lucide-react';

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

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const reviewRate = completed > 0 ? Math.round((reviewed / completed) * 100) : 0;
  const weeklyDelta = thisWeek - lastWeek;

  const weeklyHint = weeklyDelta === 0
    ? '与上周持平'
    : weeklyDelta > 0
      ? `较上周多 ${weeklyDelta}`
      : `较上周少 ${Math.abs(weeklyDelta)}`;

  const stats = [
    {
      label: '总决策',
      value: total,
      icon: ListChecks,
      color: 'text-[#8b7355] bg-[#e8dfd0]',
      hint: total > 0 ? '全部记录' : '等待开始',
    },
    {
      label: '已完成',
      value: completed,
      icon: CheckCircle2,
      color: 'text-[#5a6b4f] bg-[#dde5d4]',
      hint: `完成率 ${completionRate}%`,
    },
    {
      label: '已复盘',
      value: reviewed,
      icon: BarChart3,
      color: 'text-[#6b5570] bg-[#ddd8e0]',
      hint: `复盘率 ${reviewRate}%`,
    },
    {
      label: '本周新增',
      value: thisWeek,
      icon: CalendarDays,
      color: 'text-[#7a6245] bg-[#e8ddd0]',
      hint: weeklyHint,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border/40 bg-card/70 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold leading-none text-[#3d3428]">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5 truncate">{stat.hint}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
