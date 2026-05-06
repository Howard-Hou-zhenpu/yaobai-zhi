import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Share2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useDecisions } from '../hooks/useDecisions';
import { generatePersonalityReport } from '../lib/ai';
import UniversalShareModal from '../components/UniversalShareModal';
import { toast } from 'sonner';

export default function PersonalityReport() {
  const navigate = useNavigate();
  const { data: decisions = [] } = useDecisions();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const reviewedDecisions = decisions.filter(d => d.status === 'reviewed');
  const canGenerate = reviewedDecisions.length >= 3;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error('至少需要 3 条已复盘的决策才能生成报告');
      return;
    }

    setLoading(true);
    try {
      const result = await generatePersonalityReport(decisions);
      setReport(result);
      toast.success('报告生成成功');
    } catch (error) {
      console.error('生成报告失败:', error);
      toast.error(error.message || '生成报告失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!report) return;

    const shareText = report.shareCardText || `我的决策人格：${report.decisionType}\n\n${report.oneSentenceSummary}`;

    if (navigator.share) {
      navigator.share({
        title: '我的决策性格报告',
        text: shareText + '\n\n来自「摇摆志」',
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText + '\n\n来自「摇摆志」');
      toast.success('已复制到剪贴板');
    }
  };

  return (
    <div className="pb-24 px-4 max-w-[430px] mx-auto">
      <div className="flex items-center gap-3 py-5">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[#a09080] hover:text-[#6b5d4f]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <h1 className="text-[20px] font-bold text-[#3d3428]">决策性格报告</h1>
      </div>

      {!canGenerate && (
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#a09080]" strokeWidth={1.5} />
            <p className="text-[15px] text-[#3d3428] mb-2">再完成几次复盘后，我就能更准确地分析你的决策模式</p>
            <p className="text-[13px] text-[#a09080]">
              当前已复盘 {reviewedDecisions.length} 次，还需要 {3 - reviewedDecisions.length} 次
            </p>
            <Button
              className="mt-4 rounded-full"
              onClick={() => navigate('/review')}
            >
              去复盘中心
            </Button>
          </CardContent>
        </Card>
      )}

      {canGenerate && !report && (
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#8b7355]" strokeWidth={1.5} />
            <p className="text-[15px] text-[#3d3428] mb-2">基于你的 {reviewedDecisions.length} 次复盘</p>
            <p className="text-[13px] text-[#6b5d4f] mb-4">
              AI 将分析你的决策风格、常见模式和改进建议
            </p>
            <Button
              className="rounded-full gap-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                  生成我的决策性格报告
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {report && (
        <div className="space-y-4">
          {/* 决策类型 */}
          <Card>
            <CardContent className="p-6 text-center">
              <Badge className="mb-3 text-[14px] px-4 py-1.5 bg-[#e8dfd0] text-[#8b7355]">
                {report.decisionType}
              </Badge>
              <p className="text-[15px] text-[#6b5d4f] leading-relaxed">
                {report.oneSentenceSummary}
              </p>
              <p className="text-[13px] text-[#a09080] mt-2">
                决策信心水平：{report.confidenceLevel}
              </p>
            </CardContent>
          </Card>

          {/* 关键数据 */}
          {report.stats && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-[15px] font-semibold text-[#3d3428] mb-3">关键数据</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-[#f5f1e8] rounded-xl">
                    <p className="text-[24px] font-bold text-[#3d3428]">{report.stats.reviewedCount}</p>
                    <p className="text-[12px] text-[#a09080]">已复盘</p>
                  </div>
                  <div className="text-center p-3 bg-[#f5f1e8] rounded-xl">
                    <p className="text-[24px] font-bold text-[#5a6b4f]">
                      {report.stats.reviewedCount > 0 ? Math.round((report.stats.satisfiedCount / report.stats.reviewedCount) * 100) : 0}%
                    </p>
                    <p className="text-[12px] text-[#a09080]">满意率</p>
                  </div>
                  <div className="text-center p-3 bg-[#f5f1e8] rounded-xl">
                    <p className="text-[24px] font-bold text-[#a0522d]">
                      {report.stats.reviewedCount > 0 ? Math.round((report.stats.regretCount / report.stats.reviewedCount) * 100) : 0}%
                    </p>
                    <p className="text-[12px] text-[#a09080]">后悔率</p>
                  </div>
                  <div className="text-center p-3 bg-[#f5f1e8] rounded-xl">
                    <p className="text-[24px] font-bold text-[#8b7355]">{report.stats.avgHesitation.toFixed(1)}</p>
                    <p className="text-[12px] text-[#a09080]">平均纠结度</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 核心特质 */}
          {report.coreTraits && report.coreTraits.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-[15px] font-semibold text-[#3d3428] mb-3">核心特质</h3>
                <div className="space-y-3">
                  {report.coreTraits.map((trait, index) => (
                    <div key={index} className="p-3 bg-[#f5f1e8] rounded-xl">
                      <p className="text-[14px] font-medium text-[#3d3428] mb-1">{trait.title}</p>
                      <p className="text-[13px] text-[#6b5d4f] leading-relaxed">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 数据洞察 */}
          {report.dataInsights && report.dataInsights.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-[15px] font-semibold text-[#3d3428] mb-3">数据洞察</h3>
                <div className="space-y-3">
                  {report.dataInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] text-[#a09080]">{insight.label}</span>
                          <span className="text-[15px] font-semibold text-[#8b7355]">{insight.value}</span>
                        </div>
                        <p className="text-[13px] text-[#6b5d4f]">{insight.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 决策模式 */}
          {report.patterns && report.patterns.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-[15px] font-semibold text-[#3d3428] mb-3">常见决策模式</h3>
                <div className="space-y-3">
                  {report.patterns.map((pattern, index) => (
                    <div key={index} className="p-3 bg-[#f5f1e8] rounded-xl">
                      <p className="text-[14px] font-medium text-[#3d3428] mb-1">{pattern.pattern}</p>
                      <p className="text-[13px] text-[#6b5d4f]">{pattern.evidence}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 后悔来源 */}
          {report.regretReasons && report.regretReasons.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-[15px] font-semibold text-[#3d3428] mb-3">可能的后悔来源</h3>
                <div className="space-y-3">
                  {report.regretReasons.map((item, index) => (
                    <div key={index} className="p-3 bg-[#fff0ea] rounded-xl border border-[#e5d0c8]">
                      <p className="text-[14px] font-medium text-[#a0522d] mb-1">{item.reason}</p>
                      <p className="text-[13px] text-[#6b5d4f]">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 下次决策建议 */}
          {report.nextActions && report.nextActions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-[15px] font-semibold text-[#3d3428] mb-3">下次决策建议</h3>
                <div className="space-y-2">
                  {report.nextActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-[#8b7355] mt-0.5">•</span>
                      <p className="text-[14px] text-[#6b5d4f] flex-1">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full gap-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              重新生成
            </Button>
            <Button
              className="flex-1 rounded-full gap-2"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
              生成分享卡片
            </Button>
          </div>
        </div>
      )}

      {/* 分享卡片弹窗 */}
      {showShareModal && report && (
        <UniversalShareModal
          type="report"
          data={report}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
