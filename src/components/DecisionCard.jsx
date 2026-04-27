import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { STATUS_MAP, SATISFACTION_MAP } from '../lib/constants';
import { useDeleteDecision } from '../hooks/useDecisions';
import { toast } from 'sonner';

export default function DecisionCard({ decision }) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteDecision();
  const [confirming, setConfirming] = useState(false);
  const status = STATUS_MAP[decision.status];
  const satisfaction = decision.satisfaction ? SATISFACTION_MAP[decision.satisfaction] : null;
  const selectedOptions = decision.selectedOption ? decision.selectedOption.split(',').filter(Boolean) : [];

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    deleteMutation.mutate(decision.id, {
      onSuccess: () => toast.success('已删除'),
    });
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirming(false);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-[0_4px_16px_rgba(139,115,85,0.12)] transition-all duration-300 active:scale-[0.98]"
      onClick={() => navigate(`/decision/${decision.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base truncate">{decision.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 italic">
              {decision.description || '暂无描述'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge className={`${status.color} rounded-lg`}>{status.label}</Badge>
            {confirming ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="destructive" size="sm" className="h-6 px-2 text-xs rounded-lg" onClick={handleDelete}>
                  确认
                </Button>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs rounded-lg" onClick={handleCancelDelete}>
                  取消
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            {new Date(decision.createdAt).toLocaleDateString('zh-CN')}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{decision.category}</span>
          {decision.type === 'deep' && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="italic">深度分析</span>
            </>
          )}
          {satisfaction && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className={satisfaction.color}>
                {satisfaction.emoji} {satisfaction.label}
              </span>
            </>
          )}
        </div>
        {decision.status === 'completed' && selectedOptions.length > 0 && (
          <div className="mt-2.5 flex items-start gap-1.5 text-sm text-[#5a6b4f]">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
            <span>已选择: {selectedOptions.join('、')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
