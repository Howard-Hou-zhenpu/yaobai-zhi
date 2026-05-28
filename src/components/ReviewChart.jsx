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
          <p className="text-sm text-muted-foreground text-center py-6 leading-relaxed">
            完成几次复盘后，会看到满意度分布。
          </p>
        </CardContent>
      </Card>
    );
  }

  const rows = Object.entries(SATISFACTION_MAP).map(([key, val]) => {
    const count = reviewed.filter((d) => d.satisfaction === key).length;
    const pct = Math.round((count / reviewed.length) * 100);
    return { key, label: val.label, emoji: val.emoji, count, pct };
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">满意度分析</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-16 shrink-0 text-sm" style={{ color: COLORS[r.key] }}>
              <span>{r.emoji}</span>
              <span>{r.label}</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-[#f0e8d8] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${r.pct}%`, backgroundColor: COLORS[r.key] }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0 w-14 text-right tabular-nums">
              {r.pct}% · {r.count}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
