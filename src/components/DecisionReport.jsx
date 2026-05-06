import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DecisionReport({ decisions }) {
  const navigate = useNavigate();

  const reviewed = decisions.filter((d) => d.status === 'reviewed');
  if (reviewed.length < 3) return null;

  return (
    <Card className="mt-4">
      <CardContent className="p-4 text-center">
        <Sparkles className="w-5 h-5 text-[#8b7355] mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm text-[#6b5d4f] mb-3">
          你已经积累了 {reviewed.length} 条复盘，可以生成你的决策性格报告了
        </p>
        <Button
          className="rounded-full gap-2"
          onClick={() => navigate('/personality-report')}
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          生成我的决策性格报告
        </Button>
      </CardContent>
    </Card>
  );
}
