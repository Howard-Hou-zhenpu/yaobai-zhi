import { useState } from 'react';
import { X, Lightbulb, Star, Share2, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export default function ReviewCompletedModal({
  hasPrinciple,
  isFavorite,
  saving,
  onSavePrinciple,
  onToggleFavorite,
  onShare,
  onClose,
}) {
  const [showPrincipleInput, setShowPrincipleInput] = useState(false);
  const [principleText, setPrincipleText] = useState('');

  const handleSubmitPrinciple = () => {
    const text = principleText.trim();
    if (!text) return;
    onSavePrinciple(text);
  };

  const principleDone = hasPrinciple;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-[var(--card-solid)] rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-medium text-[#3d3428]">这次复盘已完成</h3>
          <button onClick={onClose} className="text-[#a09080] hover:text-[#6b5d4f] -mr-1 -mt-1">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-sm text-[#6b5d4f] mb-5 leading-relaxed">要不要把这次经验留下来？</p>

        <div className="space-y-2.5">
          {principleDone ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#d4cbb8] bg-[#faf6ef]">
              <Lightbulb className="w-4 h-4 text-[#8b7355] shrink-0" strokeWidth={1.5} />
              <span className="text-sm text-[#3d3428] flex-1">保存为个人原则</span>
              <span className="flex items-center gap-1 text-xs text-[#5a6b4f]">
                <Check className="w-3.5 h-3.5" strokeWidth={2} /> 已保存
              </span>
            </div>
          ) : showPrincipleInput ? (
            <div className="px-4 py-3 rounded-xl border border-[#d4cbb8] bg-white space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#8b7355]" strokeWidth={1.5} />
                <span className="text-sm font-medium text-[#3d3428]">写下这次的原则</span>
              </div>
              <Textarea
                placeholder="下次遇到类似选择时，我要提醒自己……"
                value={principleText}
                onChange={(e) => setPrincipleText(e.target.value)}
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#a09080]"
                  onClick={() => setShowPrincipleInput(false)}
                  disabled={saving}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={handleSubmitPrinciple}
                  disabled={saving || !principleText.trim()}
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                  保存
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPrincipleInput(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#d4cbb8] bg-white text-left hover:border-[#8b7355] hover:bg-[#faf6ef] transition-all"
            >
              <Lightbulb className="w-4 h-4 text-[#8b7355] shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#3d3428]">保存为个人原则</p>
                <p className="text-[11px] text-[#a09080] mt-0.5">写一句话提醒未来的自己</p>
              </div>
            </button>
          )}

          <button
            onClick={onToggleFavorite}
            disabled={saving}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
              isFavorite
                ? 'border-[#e6d49a] bg-[#fbf6e6]'
                : 'border-[#d4cbb8] bg-white hover:border-[#8b7355] hover:bg-[#faf6ef]'
            }`}
          >
            <Star
              className={`w-4 h-4 shrink-0 ${isFavorite ? 'text-[#c9a84c]' : 'text-[#8b7355]'}`}
              strokeWidth={1.5}
              fill={isFavorite ? 'currentColor' : 'none'}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#3d3428]">{isFavorite ? '已收藏这次复盘' : '收藏这次复盘'}</p>
              <p className="text-[11px] text-[#a09080] mt-0.5">在复盘中心快速找到</p>
            </div>
            {isFavorite && (
              <span className="flex items-center gap-1 text-xs text-[#a8893a]">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
              </span>
            )}
          </button>

          <button
            onClick={onShare}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#d4cbb8] bg-white text-left hover:border-[#8b7355] hover:bg-[#faf6ef] transition-all"
          >
            <Share2 className="w-4 h-4 text-[#8b7355] shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#3d3428]">生成分享卡片</p>
              <p className="text-[11px] text-[#a09080] mt-0.5">把这次复盘做成图片</p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center text-sm text-[#a09080] hover:text-[#6b5d4f] py-3 mt-3"
        >
          稍后再说
        </button>
      </div>
    </div>
  );
}
