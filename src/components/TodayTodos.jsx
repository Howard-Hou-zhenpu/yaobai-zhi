import { useNavigate } from 'react-router-dom';
import { CalendarClock, Clock, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

function getTodoItems(decisions) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const priority1 = [];
  const priority2 = [];
  const priority3 = [];

  for (const d of decisions) {
    if (d.status === 'completed' && d.reviewDueAt) {
      if (new Date(d.reviewDueAt) <= today) {
        priority1.push({ ...d, reason: `已经到了复盘时间，要不要看看结果？`, action: 'review' });
      }
    } else if (d.status === 'completed' && !d.reviewDueAt) {
      priority2.push({ ...d, reason: `完成后还没有复盘，回顾一下？`, action: 'review' });
    } else if (d.status === 'active') {
      // 用 createdAt 代替 updatedAt（当前数据模型无 updatedAt）
      const ref = new Date(d.createdAt);
      if (ref < threeDaysAgo) {
        priority3.push({ ...d, reason: `已经进行中一段时间了，要不要继续推进？`, action: 'edit' });
      }
    }
  }

  const items = [...priority1, ...priority2, ...priority3];
  return { items: items.slice(0, 3), totalCount: items.length };
}

export default function TodayTodos({ decisions }) {
  const navigate = useNavigate();
  const { items, totalCount } = getTodoItems(decisions);
  const overflowCount = totalCount - items.length;

  if (items.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-sm font-medium text-[#6b5d4f] mb-3">今日待处理</h2>
        <Card className="border-dashed border-[#d4cbb8] bg-card/40">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#a09080] leading-relaxed flex-1">今天没有待处理的决策，可以先记下一个新的纠结。</p>
            <Button size="sm" className="rounded-xl shrink-0 gap-1" onClick={() => navigate('/create')}>
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              开始记录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-[#6b5d4f] mb-3">今日待处理</h2>
      <div className="space-y-2.5">
        {items.map((item) => {
          const isReview = item.action === 'review';
          return (
            <Card key={item.id} className="card-hover hover:shadow-[0_4px_16px_rgba(139,115,85,0.12)] transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={
                          isReview
                            ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ddd8e0] text-[#6b5570] text-[11px] font-medium'
                            : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e8ddd0] text-[#7a6245] text-[11px] font-medium'
                        }
                      >
                        {isReview ? (
                          <><CalendarClock className="w-3 h-3" strokeWidth={1.5} />待复盘</>
                        ) : (
                          <><Clock className="w-3 h-3" strokeWidth={1.5} />进行中</>
                        )}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#3d3428] truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.reason}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl shrink-0 gap-1 text-[#8b7355] border-[#d4cbb8] hover:bg-[#f5f1e8]"
                    onClick={() => navigate(`/decision/${item.id}`)}
                  >
                    {isReview ? '去复盘' : '继续编辑'}
                    <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {overflowCount > 0 && (
        <div className="mt-2.5 flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">还有 {overflowCount} 条待处理</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-0.5 text-[#8b7355]"
            onClick={() => navigate('/review')}
          >
            查看全部
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </div>
  );
}
