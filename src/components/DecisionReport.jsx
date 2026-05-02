import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateDecisionReport } from '../lib/ai';
import { canUseAI } from '../lib/apiKeyStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function DecisionReport({ decisions }) {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const reviewed = decisions.filter((d) => d.status === 'reviewed');
  if (reviewed.length < 10) return null;

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
      const result = await generateDecisionReport(reviewed);
      setReport(result);
    } catch (err) {
      toast.error(err.message || 'AI 调用失败');
    } finally {
      setLoading(false);
    }
  };

  if (report) {
    return (
      <Card className="mt-4 bounce-in">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c9a84c]" strokeWidth={1.5} />
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">你的决策性格报告</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{report}</p>
          <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            重新生成
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4 text-center">
        <Sparkles className="w-5 h-5 text-[#c9a84c] mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground mb-3">你已经积累了 {reviewed.length} 条复盘，可以生成你的决策性格报告了</p>
        <Button variant="outline" className="rounded-2xl gap-2" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#c9a84c]" strokeWidth={1.5} />}
          {loading ? '生成中...' : '生成我的决策性格报告'}
        </Button>
      </CardContent>
    </Card>
  );
}
