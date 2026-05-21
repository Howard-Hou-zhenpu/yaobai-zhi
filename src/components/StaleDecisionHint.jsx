import { Hourglass, ArrowRight, Archive, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { getActivityTime, getDaysSince } from '../lib/staleness';

export default function StaleDecisionHint({ decision, onContinue, onArchive, onSnooze, busy }) {
  const days = getDaysSince(getActivityTime(decision));

  return (
    <Card className="mb-4 border-[#e6d49a] bg-[#fbf6e6]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Hourglass className="w-4 h-4 text-[#a8893a]" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#7a6245]">放了 {days} 天没动了</p>
        </div>
        <p className="text-sm text-[#7a6245] leading-relaxed mb-3">
          这个决策已经放了一段时间，要不要处理一下？
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="rounded-xl gap-1 bg-[#8b7355] hover:bg-[#6b5d4f]"
            onClick={onContinue}
            disabled={busy}
          >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} /> 继续推进
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1 border-[#d4cbb8] text-[#7a6245] hover:bg-[#f3eada]"
            onClick={onArchive}
            disabled={busy}
          >
            <Archive className="w-3.5 h-3.5" strokeWidth={1.5} /> 标记已过期
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl gap-1 text-[#a09080] hover:text-[#6b5d4f]"
            onClick={onSnooze}
            disabled={busy}
          >
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> 稍后提醒
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
