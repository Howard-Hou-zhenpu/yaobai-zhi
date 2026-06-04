import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const ITERATIONS = [
  {
    version: 'v0.4',
    title: '后悔模式闭环',
    date: '2025年6月',
    userSignal: '使用中发现后悔数据藏太深，用户不知道自己在哪些决策上容易后悔；完成决策后需要等预设时间才能复盘，错过了"突然后悔"的情绪热度。',
    problem: '后悔率等数据在复盘中心深处，用户标记后悔后没有下一步引导；复盘门槛高，用户想补复盘时找不到入口。',
    changeMade: '后悔复盘后即时引导（显示后悔次数 + 跳转到模式分析）；首页增加"最近完成"快捷入口（最近 7 天内完成的决策，随时补复盘）。',
    whyItMatters: '形成"遗憾 → 引导 → 看模式 → 沉淀原则"的完整闭环，让后悔成为学习的起点而不是终点。',
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
    version: 'v0.1',
    title: 'MVP 上线',
    date: '2024年12月',
    userSignal: '个人长期使用和朋友测试显示，用户需要一种更结构化的方式来梳理决策。',
    problem: '很多决策一开始背景模糊、选项不清晰。',
    changeMade: '搭建快速记录、深度分析、选项对比和反思提问功能。',
    whyItMatters: '更清晰的决策结构能让 AI 反馈更有用。',
    status: 'shipped',
  },
];

export default function IterationLog() {
  const navigate = useNavigate();

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

      <div className="mb-4">
        <p className="text-sm text-[#6b5d4f] leading-relaxed">
          摇摆志仍在早期阶段。这里记录真实使用中发现的问题，以及它如何一步步变成新的产品改进。
        </p>
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-border/40 bg-card/60 mb-6">
        <Shield className="w-3.5 h-3.5 text-[#a09080] shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          这里不会公开原始反馈、联系方式或任何隐私信息，只记录产品如何被持续改进。
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/60" />

        <div className="space-y-5">
          {ITERATIONS.map((iteration) => (
            <div key={iteration.version} className="relative pl-9">
              <div className="absolute left-[11px] top-5 w-[9px] h-[9px] rounded-full border-2 border-[#d4cbb8] bg-[#faf6ef]" />

              <Card className="border-border/50 rounded-2xl">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-md text-[10px] font-mono bg-[#faf6ef] text-[#8b7355] border-[#d4cbb8] px-1.5"
                      >
                        {iteration.version}
                      </Badge>
                      {iteration.status === 'shipped' ? (
                        <Badge className="bg-[#dde5d4] text-[#5a6b4f] border-[#c8d4bb] rounded-md text-[10px]">
                          已上线
                        </Badge>
                      ) : (
                        <Badge className="bg-[#fbf6e6] text-[#a8893a] border-[#e6d49a] rounded-md text-[10px]">
                          进行中
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {iteration.date}
                    </span>
                  </div>

                  <h3 className="text-[13px] font-medium text-[#3d3428]">
                    {iteration.title}
                  </h3>

                  <div className="space-y-1.5 text-[12px] leading-relaxed">
                    <p>
                      <span className="text-[#a09080]">用户信号：</span>
                      <span className="text-[#6b5d4f]">{iteration.userSignal}</span>
                    </p>
                    <p>
                      <span className="text-[#a09080]">问题：</span>
                      <span className="text-[#6b5d4f]">{iteration.problem}</span>
                    </p>
                    <p>
                      <span className="text-[#a09080]">改动：</span>
                      <span className="text-[#6b5d4f]">{iteration.changeMade}</span>
                    </p>
                    <p>
                      <span className="text-[#a09080]">价值：</span>
                      <span className="text-[#6b5d4f]">{iteration.whyItMatters}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8 leading-relaxed">
        更多迭代会持续更新。
      </p>
    </div>
  );
}
