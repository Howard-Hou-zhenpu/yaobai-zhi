import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  History,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lightbulb,
  Compass,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { canUseAI, getFreeRemaining, getActiveConfig } from '../lib/apiKeyStore';
import { generateHistoricalAnalysis } from '../lib/ai';
import { selectHistoricalDecisions } from '../lib/historicalAnalysis';
import {
  getHistoricalAnalysis,
  saveHistoricalAnalysis,
  clearHistoricalAnalysis,
} from '../lib/historicalAnalysisStore';

const MIN_OPTIONS = 2;

function SectionTitle({ icon: Icon, color = '#8b7355', children }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.5} />
      <p className="text-[14px] font-semibold text-[#3d3428]">{children}</p>
    </div>
  );
}

export default function HistoricalAnalysis({ decision, allDecisions }) {
  const navigate = useNavigate();
  const [stored, setStored] = useState(() => getHistoricalAnalysis(decision.id));
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const optionList = (decision.options || []).filter(
    (o) => o && typeof o.name === 'string' && o.name.trim()
  );
  const enoughOptions = optionList.length >= MIN_OPTIONS;

  const preview = selectHistoricalDecisions(decision, allDecisions || []);

  const runGenerate = async () => {
    if (!enoughOptions) {
      toast.error('先补充至少 2 个选项，再结合历史记录分析');
      return;
    }
    if (!canUseAI()) {
      toast.error('免费额度已用完', {
        description: '请在设置中填写自己的 API Key',
        action: { label: '去设置', onClick: () => navigate('/settings') },
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateHistoricalAnalysis(decision, allDecisions || []);
      const payload = { analysis: result.analysis, meta: result.meta };
      saveHistoricalAnalysis(decision.id, payload);
      setStored(payload);
    } catch (err) {
      console.error('生成历史分析失败:', err);
      toast.error(err.message || 'AI 调用失败，请稍后重试');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleClickButton = () => {
    if (stored) {
      setShowConfirm(true);
      return;
    }
    runGenerate();
  };

  const handleCancelConfirm = () => setShowConfirm(false);

  const handleClear = () => {
    clearHistoricalAnalysis(decision.id);
    setStored(null);
    toast.success('已清除上次分析');
  };

  const activeConfig = getActiveConfig();
  const freeRemaining = getFreeRemaining();
  const hintText = activeConfig?.isFree
    ? `免费额度 ${freeRemaining}/3`
    : activeConfig
    ? '使用自定义 Key'
    : `免费额度 ${freeRemaining}/3`;

  // 入口区
  const entry = (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full rounded-full gap-2 h-11 border-[#d4cbb8] bg-[#faf6ef] hover:bg-[#f3eada]"
        onClick={handleClickButton}
        disabled={loading || !enoughOptions}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#8b7355]" />
        ) : (
          <History className="w-4 h-4 text-[#8b7355]" strokeWidth={1.5} />
        )}
        <span className="text-[#3d3428] font-medium">
          {loading ? '正在结合你的记录分析...' : stored ? '重新分析' : '结合我的记录分析'}
        </span>
        <span className="text-xs text-[#a09080] ml-1">({hintText})</span>
      </Button>
      {!enoughOptions && (
        <p className="text-xs text-[#a09080] text-center leading-relaxed">
          先补充至少 2 个选项，再结合历史记录分析
        </p>
      )}
      {enoughOptions && !stored && (
        <p className="text-[11px] text-[#a09080] text-center leading-relaxed">
          AI 会参考你的历史决策和复盘生成分析，仅作为思考辅助，不会替你做决定
        </p>
      )}
      {enoughOptions && !stored && preview.totalCandidates > 0 && (
        <p className="text-[11px] text-[#a09080] text-center leading-relaxed">
          预计参考 {Math.min(preview.totalCandidates, 10)} 条历史决策
          {preview.sameCategoryCount > 0 && `，其中 ${preview.sameCategoryCount} 条与本次同分类`}
        </p>
      )}
    </div>
  );

  return (
    <div className="mt-4 space-y-3">
      {entry}

      {showConfirm && (
        <Card className="border-[#e6d49a] bg-[#fbf6e6]">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#7a6245] leading-relaxed flex-1">
              重新分析会覆盖上次的结果，确定吗？
            </p>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={handleCancelConfirm}>
                取消
              </Button>
              <Button size="sm" className="rounded-xl" onClick={runGenerate}>
                覆盖
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stored && <Result stored={stored} optionList={optionList} onClear={handleClear} />}
    </div>
  );
}

function Result({ stored, optionList, onClear }) {
  const { analysis, meta } = stored;
  if (!analysis) return null;

  const optionNames = optionList.map((o) => o.name);
  const optionAnalyses = (analysis.optionAnalyses || []).filter((x) =>
    x && optionNames.includes(x.optionName)
  );
  const connections = (analysis.historicalConnection || []).filter((x) =>
    x && optionNames.includes(x.optionName)
  );

  const refCountText = meta?.fellBackToGeneric
    ? '没有可参考的历史复盘，已退化为通用分析'
    : `参考了 ${meta?.historyCount ?? 0} 条过往决策${
        meta?.sameCategoryCount > 0 ? `，其中 ${meta.sameCategoryCount} 条来自同一分类` : ''
      }`;

  return (
    <Card className="border-[#d4cbb8] bg-[#faf6ef]">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#8b7355] mt-0.5 shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#3d3428]">结合历史记录的分析</p>
            <p className="text-[11px] text-[#a09080] mt-0.5 leading-relaxed">{refCountText}</p>
          </div>
        </div>

        {meta?.fellBackToGeneric && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#fbf6e6] border border-[#e6d49a]">
            <AlertCircle className="w-3.5 h-3.5 text-[#a8893a] mt-0.5 shrink-0" strokeWidth={1.5} />
            <p className="text-[12px] text-[#7a6245] leading-relaxed">
              还没有足够的历史复盘可以参考，先基于当前选项做了通用分析。完成更多复盘后，之后的分析会更贴近你的决策习惯。
            </p>
          </div>
        )}

        {/* 1. 过往决策模式 */}
        {analysis.pastPatterns && (
          <div>
            <SectionTitle icon={Compass}>过往决策模式</SectionTitle>
            <p className="text-[13px] text-[#6b5d4f] leading-relaxed pl-6">{analysis.pastPatterns}</p>
          </div>
        )}

        {/* 2. 当前选项利弊 */}
        {optionAnalyses.length > 0 && (
          <div>
            <SectionTitle icon={CheckCircle} color="#5a6b4f">当前选项利弊</SectionTitle>
            <div className="space-y-2.5 pl-6">
              {optionAnalyses.map((opt, i) => (
                <div key={i} className="rounded-xl border border-[#e8dfd0] bg-white/40 p-3">
                  <p className="text-[13px] font-semibold text-[#3d3428] mb-1.5">{opt.optionName}</p>
                  {opt.pros && opt.pros.length > 0 && (
                    <BulletList items={opt.pros} label="优点" color="#5a6b4f" Icon={CheckCircle} />
                  )}
                  {opt.cons && opt.cons.length > 0 && (
                    <BulletList items={opt.cons} label="缺点" color="#a0522d" Icon={XCircle} />
                  )}
                  {opt.risks && opt.risks.length > 0 && (
                    <BulletList items={opt.risks} label="风险" color="#8b7355" Icon={AlertCircle} />
                  )}
                  {opt.missingInfo && (
                    <div className="mt-1 flex items-start gap-1.5">
                      <HelpCircle className="w-3 h-3 text-[#a09080] mt-0.5 shrink-0" strokeWidth={1.5} />
                      <p className="text-[12px] text-[#a09080] flex-1">缺少信息：{opt.missingInfo}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 和历史经验的关系 */}
        {connections.length > 0 && (
          <div>
            <SectionTitle icon={History} color="#6b5570">和历史经验的关系</SectionTitle>
            <div className="space-y-2 pl-6">
              {connections.map((c, i) => (
                <div key={i} className="rounded-xl border border-[#e0d8de] bg-white/40 p-3">
                  <p className="text-[13px] font-semibold text-[#3d3428] mb-1.5">{c.optionName}</p>
                  {c.matchesSatisfied && (
                    <div className="flex items-start gap-1.5 mb-1">
                      <CheckCircle className="w-3 h-3 text-[#5a6b4f] mt-0.5 shrink-0" strokeWidth={1.5} />
                      <p className="text-[12px] text-[#6b5d4f]">{c.matchesSatisfied}</p>
                    </div>
                  )}
                  {c.matchesRegret && (
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 text-[#a0522d] mt-0.5 shrink-0" strokeWidth={1.5} />
                      <p className="text-[12px] text-[#6b5d4f]">{c.matchesRegret}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 引用的历史提醒 */}
        {analysis.referencedPrinciples && analysis.referencedPrinciples.length > 0 && (
          <div>
            <SectionTitle icon={Lightbulb}>引用的历史提醒</SectionTitle>
            <div className="space-y-1.5 pl-6">
              {analysis.referencedPrinciples.map((p, i) => (
                <div key={i} className="rounded-xl bg-[#f5efe0] px-3 py-2">
                  <p className="text-[12px] text-[#6b5d4f] leading-relaxed">“{p}”</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 建议补充的问题 */}
        {analysis.questionsToAsk && analysis.questionsToAsk.length > 0 && (
          <div>
            <SectionTitle icon={HelpCircle} color="#6b5570">建议补充思考的问题</SectionTitle>
            <div className="space-y-1 pl-6">
              {analysis.questionsToAsk.map((q, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[#8b7355] text-[12px] mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-[13px] text-[#6b5d4f] leading-relaxed flex-1">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. 温和倾向 */}
        {analysis.softLeanings && analysis.softLeanings.length > 0 && (
          <div>
            <SectionTitle icon={Lightbulb}>温和倾向</SectionTitle>
            <div className="space-y-2 pl-6">
              {analysis.softLeanings.map((s, i) => (
                <div key={i} className="rounded-xl border border-[#e8dfd0] bg-[#f5f1e8] p-3">
                  <p className="text-[12px] text-[#8b7355] mb-1">{s.condition}</p>
                  <p className="text-[13px] text-[#3d3428] leading-relaxed">{s.suggestion}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 pl-6 flex items-start gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#a09080] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[11px] text-[#a09080] leading-relaxed">
                这只是基于你过往记录的辅助参考，最终决定权在你自己。
              </p>
            </div>
          </div>
        )}

        {/* 清除按钮 */}
        <div className="pt-1 flex justify-end">
          <Button variant="ghost" size="sm" className="text-[12px] text-[#a09080] gap-1" onClick={onClear}>
            <RotateCcw className="w-3 h-3" strokeWidth={1.5} /> 清除分析
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BulletList({ items, label, color, Icon }) {
  return (
    <div className="mt-1">
      <p className="text-[11px] font-medium mb-0.5" style={{ color }}>{label}</p>
      <div className="space-y-0.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <Icon className="w-3 h-3 mt-0.5 shrink-0" style={{ color }} strokeWidth={1.5} />
            <p className="text-[12px] text-[#6b5d4f] leading-relaxed flex-1">{it}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
