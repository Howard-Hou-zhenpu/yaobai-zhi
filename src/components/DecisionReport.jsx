import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MIN_REVIEWS = 3;

export default function DecisionReport({ decisions }) {
  const navigate = useNavigate();
  const reviewed = decisions.filter((d) => d.status === 'reviewed');
  const reviewedCount = reviewed.length;
  const ready = reviewedCount >= MIN_REVIEWS;
  const remaining = Math.max(0, MIN_REVIEWS - reviewedCount);

  if (!ready && reviewedCount === 0) return null;

  return (
    <Card className="mt-4 border-[#d4cbb8] bg-[#faf6ef]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#8b7355]" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-[#3d3428]">AI 决策性格报告</h3>
        </div>

        {ready ? (
          <>
            <p className="text-sm text-[#6b5d4f] leading-relaxed">
              你已经积累了 {reviewedCount} 条复盘，可以生成一份关于自己决策风格的报告。
            </p>
            <p className="text-xs text-[#a09080] mt-2.5 leading-relaxed">它会帮你看看：</p>
            <ul className="mt-1 space-y-0.5 text-xs text-[#7a6245] leading-relaxed">
              <li>· 你更谨慎还是更冒险</li>
              <li>· 哪类选择满意度更高</li>
              <li>· 哪些原因更容易让你后悔</li>
            </ul>
            <Button
              className="w-full mt-3.5 rounded-full gap-1.5 h-10"
              onClick={() => navigate('/personality-report')}
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              生成我的决策性格报告
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" strokeWidth={1.5} />
            </Button>
            <p className="text-[10px] text-[#a09080] mt-2 leading-relaxed text-center">
              AI 只作为思考辅助，不代表对你的评价。
            </p>
          </>
        ) : (
          <p className="text-sm text-[#6b5d4f] leading-relaxed">
            还差 {remaining} 条复盘就能生成你的决策性格报告。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
