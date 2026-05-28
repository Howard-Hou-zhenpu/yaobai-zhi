import { useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Sprout } from 'lucide-react';

export default function RegretAnalysis({ decisions }) {
  const stats = useMemo(() => {
    const regrets = decisions.filter(
      (d) => d.status === 'reviewed' && d.satisfaction === 'regret'
    );
    const counts = new Map();
    const customReasons = [];
    regrets.forEach((d) => {
      const reasons = String(d.regretReasons || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      reasons.forEach((r) => counts.set(r, (counts.get(r) || 0) + 1));
      if (reasons.includes('其他') && d.customRegretReason) {
        customReasons.push(d.customRegretReason);
      }
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      regretCount: regrets.length,
      top: sorted.slice(0, 5),
      total: sorted.reduce((sum, [, n]) => sum + n, 0),
      customReasons: customReasons.slice(0, 3),
    };
  }, [decisions]);

  return (
    <Card className="border-[#e5d5c8] bg-[#faf2eb]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sprout className="w-4 h-4 text-[#a0522d]" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-[#7a4a2d]">后悔模式</h3>
        </div>

        {stats.regretCount === 0 ? (
          <p className="text-xs text-[#a09080] mt-1.5 leading-relaxed">
            还没有后悔复盘，之后会在这里看到常见原因。
          </p>
        ) : (
          <>
            <p className="text-[11px] text-[#a09080] mb-3 leading-relaxed">
              回顾这 {stats.regretCount} 次后悔，看看自己最常卡在哪里。
            </p>
            {stats.top.length === 0 ? (
              <p className="text-xs text-[#a09080] leading-relaxed">
                还没有标注后悔原因。下次复盘"后悔"时勾选几个，能更清楚自己的模式。
              </p>
            ) : (
              <div className="space-y-2">
                {stats.top.map(([reason, count]) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={reason} className="flex items-center gap-2.5">
                      <span className="text-xs text-[#7a4a2d] shrink-0 w-20 truncate">{reason}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#f0e3d6] overflow-hidden">
                        <div
                          className="h-full bg-[#c97a4a] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[#a09080] shrink-0 tabular-nums w-12 text-right">
                        {count} 次
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {stats.customReasons.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-[#e5d5c8]">
                <p className="text-[10px] text-[#a09080] mb-1 tracking-wide">最近的其他原因</p>
                <div className="space-y-0.5">
                  {stats.customReasons.map((r, i) => (
                    <p key={i} className="text-[11px] text-[#7a4a2d] leading-relaxed">· {r}</p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
