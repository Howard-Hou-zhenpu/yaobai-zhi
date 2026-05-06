import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateStructuredReviewQuestions } from '../lib/ai';
import { canUseAI, getFreeRemaining, getActiveConfig } from '../lib/apiKeyStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StructuredReviewQuestions from './StructuredReviewQuestions';

export default function AIInsights({ decision }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!canUseAI()) {
      toast.error('免费额度已用完', {
        description: '请在设置中填写自己的 API Key',
        action: { label: '去设置', onClick: () => navigate('/settings') },
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateStructuredReviewQuestions(decision);
      setQuestions(result);
    } catch (err) {
      console.error('生成复盘问题失败:', err);
      toast.error(err.message || 'AI 调用失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = getActiveConfig();
  const freeRemaining = getFreeRemaining();
  const hintText = activeConfig?.isFree ? `免费额度 ${freeRemaining}/3` : activeConfig ? '使用自定义 Key' : `免费额度 ${freeRemaining}/3`;

  if (questions) {
    return (
      <div className="mt-4 bounce-in">
        <StructuredReviewQuestions
          questions={questions}
          onRegenerate={handleGenerate}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full mt-4 rounded-full gap-2 h-11"
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 text-[#8b7355]" strokeWidth={1.5} />
      )}
      {loading ? 'AI 正在思考...' : '获取 AI 反思建议'}
      <span className="text-xs text-[#a09080] ml-1">({hintText})</span>
    </Button>
  );
}
