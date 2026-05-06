import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, XCircle, Lightbulb, HelpCircle } from 'lucide-react';

/**
 * 结构化决策分析展示组件
 * 展示 AI 返回的结构化分析结果
 */
export default function StructuredAnalysis({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="space-y-3">
      {/* 核心冲突 */}
      {analysis.coreConflict && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#8b7355] mt-0.5 shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#3d3428] mb-1">核心冲突</p>
                <p className="text-[13px] text-[#6b5d4f] leading-relaxed">{analysis.coreConflict}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 决策目标 */}
      {analysis.decisionGoal && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#5a6b4f] mt-0.5 shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#3d3428] mb-1">决策目标</p>
                <p className="text-[13px] text-[#6b5d4f] leading-relaxed">{analysis.decisionGoal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 关键变量 */}
      {analysis.keyVariables && analysis.keyVariables.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-[13px] font-medium text-[#3d3428] mb-2">关键变量</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keyVariables.map((variable, index) => (
                <Badge key={index} className="bg-[#f5f1e8] text-[#6b5d4f] border-[#e8dfd0] text-[12px]">
                  {variable}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 缺失信息 */}
      {analysis.missingInfo && analysis.missingInfo.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-[#a0522d] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[13px] font-medium text-[#3d3428]">可能缺失的信息</p>
            </div>
            <div className="space-y-1 pl-6">
              {analysis.missingInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[#a0522d] text-[12px] mt-0.5">•</span>
                  <p className="text-[13px] text-[#6b5d4f] flex-1">{info}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 选项分析 */}
      {analysis.optionAnalyses && analysis.optionAnalyses.length > 0 && (
        <div className="space-y-3">
          <p className="text-[14px] font-semibold text-[#3d3428]">选项分析</p>
          {analysis.optionAnalyses.map((option, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold text-[#3d3428]">{option.optionName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* 优点 */}
                {option.pros && option.pros.length > 0 && (
                  <div>
                    <p className="text-[12px] font-medium text-[#5a6b4f] mb-1">优点</p>
                    <div className="space-y-0.5">
                      {option.pros.map((pro, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-[#5a6b4f] mt-0.5 shrink-0" strokeWidth={1.5} />
                          <p className="text-[12px] text-[#6b5d4f] flex-1">{pro}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 缺点 */}
                {option.cons && option.cons.length > 0 && (
                  <div>
                    <p className="text-[12px] font-medium text-[#a0522d] mb-1">缺点</p>
                    <div className="space-y-0.5">
                      {option.cons.map((con, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <XCircle className="w-3 h-3 text-[#a0522d] mt-0.5 shrink-0" strokeWidth={1.5} />
                          <p className="text-[12px] text-[#6b5d4f] flex-1">{con}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 风险 */}
                {option.risks && option.risks.length > 0 && (
                  <div>
                    <p className="text-[12px] font-medium text-[#8b7355] mb-1">风险</p>
                    <div className="space-y-0.5">
                      {option.risks.map((risk, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-[#8b7355] mt-0.5 shrink-0" strokeWidth={1.5} />
                          <p className="text-[12px] text-[#6b5d4f] flex-1">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 优化建议 */}
                {option.betterWay && (
                  <div className="pt-2 border-t border-[#e8dfd0]">
                    <div className="flex items-start gap-1.5">
                      <Lightbulb className="w-3 h-3 text-[#8b7355] mt-0.5 shrink-0" strokeWidth={1.5} />
                      <p className="text-[12px] text-[#6b5d4f] flex-1">{option.betterWay}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI 建议 */}
      {analysis.suggestedChoice && (
        <Card className="bg-[#f5f1e8] border-[#e8dfd0]">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#8b7355] mt-0.5 shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#3d3428] mb-1">AI 建议</p>
                <p className="text-[13px] text-[#6b5d4f] mb-2">{analysis.suggestedChoice.choice}</p>
                <p className="text-[12px] text-[#a09080]">{analysis.suggestedChoice.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 复盘问题 */}
      {analysis.reviewQuestion && (
        <Card>
          <CardContent className="p-4">
            <p className="text-[13px] font-medium text-[#3d3428] mb-1">复盘时可以关注</p>
            <p className="text-[13px] text-[#6b5d4f] leading-relaxed">{analysis.reviewQuestion}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
