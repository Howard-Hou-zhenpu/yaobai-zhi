import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export default function RecentCompleted({ decisions }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // 筛选最近 7 天内完成的决策
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentCompleted = decisions
    .filter((d) => {
      if (d.status !== 'completed') return false;
      const completedAt = d.reviewDueAt || d.updatedAt || d.createdAt;
      return new Date(completedAt) >= sevenDaysAgo;
    })
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt);
      const timeB = new Date(b.updatedAt || b.createdAt);
      return timeB - timeA;
    })
    .slice(0, 3);

  if (recentCompleted.length === 0) return null;

  return (
    <Card className="border-[#e8dfd0] bg-[#faf8f3]">
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-medium text-[#3d3428]">最近完成的决策</p>
            <p className="text-xs text-[#a09080] mt-0.5">
              这几天完成了 {recentCompleted.length} 个决策，现在回顾一下感觉如何？
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#a09080] shrink-0 ml-2" strokeWidth={1.5} />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a09080] shrink-0 ml-2" strokeWidth={1.5} />
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {recentCompleted.map((d) => {
              const completedDate = new Date(d.updatedAt || d.createdAt).toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
              });

              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-border/40 hover:border-[#d4cbb8] transition-all"
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <CheckCircle className="w-3.5 h-3.5 text-[#5a6b4f] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#3d3428] truncate">{d.title}</p>
                      <p className="text-xs text-[#a09080] mt-0.5">{completedDate} 完成</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-7 px-2.5 text-xs shrink-0"
                    onClick={() => navigate(`/decision/${d.id}`)}
                  >
                    去复盘
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
