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
  const thisWeek = decisions.filter((d) => new Date(d.createdAt) >= weekStart).length;

  const stats = [
    { label: '总决策', value: total, icon: ListChecks, color: 'text-[#8b7355] bg-[#e8dfd0]' },
    { label: '已完成', value: completed, icon: CheckCircle2, color: 'text-[#5a6b4f] bg-[#dde5d4]' },
    { label: '已复盘', value: reviewed, icon: BarChart3, color: 'text-[#6b5570] bg-[#ddd8e0]' },
    { label: '本周新增', value: thisWeek, icon: CalendarDays, color: 'text-[#7a6245] bg-[#e8ddd0]' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-none bg-transparent">
          <CardContent className="p-3 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-medium">{stat.value}</span>
            <span className="text-[11px] text-muted-foreground tracking-wide">{stat.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
