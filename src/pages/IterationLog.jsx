import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const ITERATIONS = [
  {
    version: 'v0.1',
    title: 'MVP 上线',
    date: '2024年12月',
    userSignal: '个人长期使用和朋友测试显示，用户需要一种更结构化的方式来梳理决策。',
    problem: '很多决策一开始背景模糊、选项不清晰。',
    changeMade: '搭建快速记录、深度分析、选项对比和反思提问功能。',
    whyItMatters: '更清晰的决策结构能让 AI 反馈更有用。',
    status: 'shipped',
  },
  {
    version: 'v0.2',
    title: '优化决策反思',
    date: '2025年1月',
    userSignal: '早期测试者不只想要直接建议，也希望获得更好的问题。',
    problem: 'AI 回答容易过于偏向"给答案"。',
    changeMade: '加入反思提问和决策人格报告。',
    whyItMatters: '产品更像一个决策教练，而不是决策机器。',
    status: 'shipped',
  },
  {
    version: 'v0.3',
    title: '加入反馈闭环',
    date: '2025年6月',
    userSignal: '为了持续改进 MVP，需要一个轻量方式收集真实用户反馈。',
    problem: '此前反馈分散在聊天和非正式交流中。',
    changeMade: '加入反馈表单和公开产品迭代记录。',
    whyItMatters: '用户反馈可以被收集、整理，并转化为后续产品迭代。',
    status: 'in_progress',
  },
];

export default function IterationLog() {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    if (status === 'shipped') {
      return (
        <Badge className="bg-[#dde5d4] text-[#5a6b4f] border-[#c8d4bb] rounded-lg text-[10px]">
          已上线
        </Badge>
      );
    }
    if (status === 'in_progress') {
      return (
        <Badge className="bg-[#fbf6e6] text-[#a8893a] border-[#e6d49a] rounded-lg text-[10px]">
          进行中
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] px-4 max-w-[430px] mx-auto">
      <div className="flex items-center gap-3 py-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-[#a09080] hover:text-[#6b5d4f]"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <h1 className="text-[20px] font-bold text-[#3d3428]">产品迭代记录</h1>
      </div>

      <Card className="mb-5 border-[#dde5d4] bg-[#f5f8f0]">
        <CardContent className="p-4 text-xs text-[#5a6b4f] leading-relaxed">
          记录摇摆志如何根据真实使用、用户反馈和产品判断持续迭代。
        </CardContent>
      </Card>

      <div className="space-y-4">
        {ITERATIONS.map((iteration) => (
          <Card key={iteration.version} className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-lg text-[10px] font-mono bg-[#faf6ef] text-[#8b7355] border-[#d4cbb8]"
                  >
                    {iteration.version}
                  </Badge>
                  {getStatusBadge(iteration.status)}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {iteration.date}
                </span>
              </div>

              <h3 className="text-sm font-medium text-[#3d3428]">
                {iteration.title}
              </h3>

              <div className="space-y-2 text-xs text-[#6b5d4f] leading-relaxed">
                <div>
                  <span className="font-medium text-[#8b7355]">用户信号：</span>
                  {iteration.userSignal}
                </div>

                <div>
                  <span className="font-medium text-[#8b7355]">问题：</span>
                  {iteration.problem}
                </div>

                <div>
                  <span className="font-medium text-[#8b7355]">改动：</span>
                  {iteration.changeMade}
                </div>

                <div>
                  <span className="font-medium text-[#8b7355]">价值：</span>
                  {iteration.whyItMatters}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          这是一个公开的产品迭代记录。
          <br />
          更多迭代会持续更新。
        </p>
      </div>
    </div>
  );
}
