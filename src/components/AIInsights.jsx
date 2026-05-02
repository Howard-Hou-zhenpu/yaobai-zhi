import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateReflection } from '../lib/ai';
import { canUseAI, getFreeRemaining, getApiConfig } from '../lib/apiKeyStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AIInsights({ decision }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(false);
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
      const result = await generateReflection(decision);
      setQuestions(result);
      setUsed(true);
    } catch (err) {
      toast.error(err.message || 'AI 调用失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const customKey = getApiConfig()?.apiKey;
  const freeRemaining = getFreeRemaining();
  const hintText = customKey ? '使用自定义 Key' : `免费额度 ${freeRemaining}/3`;

  if (questions.length > 0) {
    return (
      <Card className="mt-4 bounce-in">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c9a84c]" strokeWidth={1.5} />
            <span className="text-sm font-medium">AI 反思建议</span>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="pl-3 border-l-2 border-primary/30">
                <p className="text-sm text-muted-foreground leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            重新生成
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full mt-4 rounded-2xl gap-2 h-11"
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 text-[#c9a84c]" strokeWidth={1.5} />
      )}
      {loading ? 'AI 正在思考...' : '获取 AI 反思建议'}
      <span className="text-xs text-muted-foreground ml-1">({hintText})</span>
    </Button>
  );
}
