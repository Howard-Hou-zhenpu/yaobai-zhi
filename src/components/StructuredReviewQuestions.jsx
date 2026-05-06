import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { HelpCircle, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 结构化复盘追问展示组件
 * 展示 AI 返回的结构化复盘问题
 */
export default function StructuredReviewQuestions({ questions, onRegenerate, loading }) {
  if (!questions) return null;

  const handleCopyQuestion = (question) => {
    navigator.clipboard.writeText(question)
      .then(() => toast.success('问题已复制'))
      .catch(() => toast.error('复制失败'));
  };

  const handleCopyAll = () => {
    const allText = questions.questions.map(q => q.question).join('\n\n');
    navigator.clipboard.writeText(allText)
      .then(() => toast.success('所有问题已复制'))
      .catch(() => toast.error('复制失败'));
  };

  return (
    <div className="space-y-3">
      {/* 复盘重点 */}
      {questions.reviewFocus && (
        <Card className="bg-[#f5f1e8] border-[#e8dfd0]">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#8b7355] mt-0.5 shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#3d3428] mb-1">本次复盘重点</p>
                <p className="text-[13px] text-[#6b5d4f] leading-relaxed">{questions.reviewFocus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 反思问题列表 */}
      {questions.questions && questions.questions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#3d3428]">反思问题</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[12px] gap-1"
                onClick={handleCopyAll}
              >
                <Copy className="w-3 h-3" strokeWidth={1.5} />
                复制全部
              </Button>
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[12px] gap-1"
                  onClick={onRegenerate}
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                  重新生成
                </Button>
              )}
            </div>
          </div>

          {questions.questions.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-[13px] font-semibold text-[#8b7355] shrink-0">Q{index + 1}</span>
                  <p className="text-[13px] font-medium text-[#3d3428] flex-1 leading-relaxed">{item.question}</p>
                </div>
                <div className="pl-6">
                  <p className="text-[12px] text-[#a09080] mb-2">
                    <span className="font-medium">为什么问这个：</span>{item.purpose}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1 text-[#8b7355]"
                    onClick={() => handleCopyQuestion(item.question)}
                  >
                    <Copy className="w-3 h-3" strokeWidth={1.5} />
                    复制问题
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 建议记录内容 */}
      {questions.suggestedReflection && (
        <Card>
          <CardContent className="p-4">
            <p className="text-[13px] font-medium text-[#3d3428] mb-1">建议在复盘总结中记录</p>
            <p className="text-[13px] text-[#6b5d4f] leading-relaxed">{questions.suggestedReflection}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
