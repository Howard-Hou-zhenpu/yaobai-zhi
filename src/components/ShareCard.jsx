import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Copy, X, Shield, ShieldOff, Eye, EyeOff } from 'lucide-react';
import { SATISFACTION_MAP } from '../lib/constants';
import { prepareShareData } from '../lib/privacy';
import { exportCardToImage, generateFilename } from '../lib/exportImage';
import ExportCard from './ExportCard';
import AnonymousInsightCard from './AnonymousInsightCard';
import { toast } from 'sonner';

export default function ShareCard({ decision, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [enableSanitize, setEnableSanitize] = useState(true);
  const [shareMode, setShareMode] = useState('full'); // 'full' | 'anonymous'

  const displayDecision = enableSanitize ? prepareShareData(decision, true) : decision;
  const satisfaction = SATISFACTION_MAP[displayDecision.satisfaction];
  const selectedOptions = displayDecision.selectedOption ? displayDecision.selectedOption.split(',').filter(Boolean) : [];

  // 检查是否有原则可以分享
  const hasPrinciple = decision.decisionPrinciple && decision.decisionPrinciple.trim().length > 0;

  const handleSaveImage = async () => {
    if (shareMode === 'anonymous' && !hasPrinciple) {
      toast.error('请先填写一条决策原则');
      return;
    }
    setGenerating(true);
    try {
      const filename = generateFilename(shareMode === 'anonymous' ? '决策洞察' : displayDecision.title);
      const cardComponent = shareMode === 'anonymous'
        ? <AnonymousInsightCard decision={decision} />
        : <ExportCard decision={displayDecision} />;
      await exportCardToImage(cardComponent, filename);
      toast.success('图片已保存');
    } catch (error) {
      console.error('保存图片失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = async () => {
    if (shareMode === 'anonymous' && !hasPrinciple) {
      toast.error('请先填写一条决策原则');
      return;
    }

    let lines = [];
    if (shareMode === 'anonymous') {
      lines = [
        `最近学到的一条决策原则：`,
        `"${decision.decisionPrinciple}"`,
        '',
        `分类：${decision.category}`,
        satisfaction ? `满意度：${satisfaction.emoji} ${satisfaction.label}` : '',
        '',
        '—— 来自「摇摆志」，记录每一次选择',
      ].filter(Boolean);
    } else {
      lines = [
        `${displayDecision.title} — ${displayDecision.status === 'reviewed' ? '已复盘' : '已完成'} ${satisfaction ? `${satisfaction.emoji} ${satisfaction.label}` : ''}`,
        `"${displayDecision.description || ''}"`,
      ];
      if (displayDecision.hesitation > 0 || displayDecision.confidence > 0) {
        const parts = [];
        if (displayDecision.hesitation > 0) parts.push(`纠结度 ${displayDecision.hesitation}/5`);
        if (displayDecision.confidence > 0) parts.push(`信心值 ${displayDecision.confidence}/5`);
        lines.push(parts.join(' | '));
      }
      if (selectedOptions.length > 0) {
        lines.push(`最终选择：${selectedOptions.join('、')}`);
      }
      if (displayDecision.review) {
        lines.push(`复盘：${displayDecision.review}`);
      }
      lines.push('');
      lines.push('—— 来自「摇摆志」，记录每一次选择');
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      toast.success('文案已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" onClick={onClose}>
      <div className="w-full max-w-[340px] relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="absolute -top-10 right-0 text-white/80 hover:text-white rounded-xl" onClick={onClose}>
          <X className="w-5 h-5" strokeWidth={1.5} />
        </Button>

        {/* 模式切换 */}
        <div className="mb-3 flex gap-1.5 p-1 bg-black/20 rounded-xl">
          <button
            type="button"
            className={`flex-1 h-8 rounded-lg text-[12px] font-medium transition-all ${
              shareMode === 'full'
                ? 'bg-[#f5f1e8] text-[#3d3428] shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setShareMode('full')}
          >
            完整复盘
          </button>
          <button
            type="button"
            className={`flex-1 h-8 rounded-lg text-[12px] font-medium transition-all ${
              shareMode === 'anonymous'
                ? 'bg-[#f5f1e8] text-[#3d3428] shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setShareMode('anonymous')}
          >
            匿名洞察
          </button>
        </div>

        {/* 隐私开关（仅完整模式显示） */}
        {shareMode === 'full' && (
          <div className="mb-3 flex items-center justify-between p-2.5 bg-[#f5f1e8] rounded-xl">
            <div className="flex items-center gap-2">
              {enableSanitize ? (
                <Shield className="w-4 h-4 text-[#5a6b4f]" strokeWidth={1.5} />
              ) : (
                <ShieldOff className="w-4 h-4 text-[#a0522d]" strokeWidth={1.5} />
              )}
              <span className="text-[12px] text-[#6b5d4f]">
                {enableSanitize ? '已隐藏敏感信息' : '显示完整信息'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() => setEnableSanitize(!enableSanitize)}
            >
              {enableSanitize ? '关闭' : '开启'}
            </Button>
          </div>
        )}

        {/* 匿名模式说明 */}
        {shareMode === 'anonymous' && (
          <div className="mb-3 flex items-center gap-2 p-2.5 bg-[#f5f1e8] rounded-xl">
            <EyeOff className="w-4 h-4 text-[#5a6b4f] shrink-0" strokeWidth={1.5} />
            <span className="text-[12px] text-[#6b5d4f] leading-relaxed">
              只展示分类、满意度和原则，标题/背景/选项都会隐藏
            </span>
          </div>
        )}

        {/* 预览卡片 */}
        {shareMode === 'full' ? (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f5f1e8', fontFamily: '"LXGW WenKai", serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#8b7355', padding: '2px 8px', backgroundColor: '#e8dfd0', borderRadius: '6px' }}>
                  {displayDecision.category}
                </span>
                {satisfaction && (
                  <span style={{ fontSize: '14px', color: satisfaction.color.replace('text-[', '').replace(']', '') }}>
                    {satisfaction.emoji} {satisfaction.label}
                  </span>
                )}
              </div>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#3d3428', margin: '0 0 8px 0', lineHeight: 1.4 }}>
              {displayDecision.title}
            </h2>

            {displayDecision.description && (
              <p style={{ fontSize: '14px', color: '#6b5d4f', margin: '0 0 16px 0', lineHeight: 1.7 }}>
                {displayDecision.description}
              </p>
            )}

            {(displayDecision.hesitation > 0 || displayDecision.confidence > 0) && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px', color: '#6b5d4f' }}>
                {displayDecision.hesitation > 0 && <span>纠结度 {displayDecision.hesitation}/5</span>}
                {displayDecision.confidence > 0 && <span>信心值 {displayDecision.confidence}/5</span>}
              </div>
            )}

            {selectedOptions.length > 0 && (
              <p style={{ fontSize: '13px', color: '#5a6b4f', margin: '0 0 12px 0' }}>
                最终选择：{selectedOptions.join('、')}
              </p>
            )}

            {displayDecision.review && (
              <div style={{ padding: '12px', backgroundColor: '#ebe7dc', borderRadius: '10px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#3d3428', margin: 0, lineHeight: 1.7 }}>
                  {displayDecision.review}
                </p>
              </div>
            )}

            <div style={{ borderTop: '1px solid #d4cbb8', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#8b7355' }}>来自「摇摆志」</span>
              <span style={{ fontSize: '11px', color: '#a09080' }}>记录每一次选择</span>
            </div>
          </div>
        ) : hasPrinciple ? (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f5f1e8', fontFamily: '"LXGW WenKai", serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#8b7355', padding: '2px 8px', backgroundColor: '#e8dfd0', borderRadius: '6px' }}>
                {decision.category || '未分类'}
              </span>
              {satisfaction && (
                <span style={{ fontSize: '12px', color: '#6b5d4f', padding: '2px 8px', backgroundColor: '#ece4d3', borderRadius: '6px' }}>
                  {satisfaction.emoji} {satisfaction.label}
                </span>
              )}
            </div>

            <p style={{ fontSize: '12px', color: '#8b7355', margin: '0 0 8px 0', letterSpacing: '0.3px' }}>
              最近学到的一条决策原则
            </p>

            <div style={{
              padding: '14px 14px',
              backgroundColor: '#faf5ea',
              borderRadius: '10px',
              borderLeft: '3px solid #c9b890',
              marginBottom: '16px',
            }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#3d3428', margin: 0, lineHeight: 1.65, wordBreak: 'break-word' }}>
                “{decision.decisionPrinciple.trim()}”
              </p>
            </div>

            <p style={{ fontSize: '12px', color: '#a09080', margin: '0 0 16px 0', lineHeight: 1.6 }}>
              每一次选择，都在塑造下一次更清晰的自己。
            </p>

            <div style={{ borderTop: '1px solid #d4cbb8', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#8b7355' }}>来自「摇摆志」</span>
              <span style={{ fontSize: '11px', color: '#a09080' }}>记录每一次选择</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '32px 24px', borderRadius: '16px', backgroundColor: '#f5f1e8', textAlign: 'center' }}>
            <Eye className="w-8 h-8 mx-auto mb-3 text-[#a09080]" strokeWidth={1.5} />
            <p className="text-[14px] text-[#6b5d4f] leading-relaxed mb-1.5">
              这条决策还没有沉淀原则
            </p>
            <p className="text-[12px] text-[#a09080] leading-relaxed">
              在复盘时填写「写给未来自己的提醒」，就可以匿名分享了
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            className="flex-1 rounded-2xl gap-1.5 h-11"
            onClick={handleSaveImage}
            disabled={generating || (shareMode === 'anonymous' && !hasPrinciple)}
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            {generating ? '生成中...' : '保存图片'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-2xl gap-1.5 h-11"
            onClick={handleCopyText}
            disabled={shareMode === 'anonymous' && !hasPrinciple}
          >
            <Copy className="w-4 h-4" strokeWidth={1.5} />
            复制文案
          </Button>
        </div>

        <p className="text-center text-[11px] text-white/60 mt-3">
          {shareMode === 'anonymous'
            ? '匿名分享：不暴露具体决策内容'
            : enableSanitize ? '已自动隐藏敏感信息' : '请确认分享内容不含敏感信息'}
        </p>
      </div>
    </div>
  );
}
