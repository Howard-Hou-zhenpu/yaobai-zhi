import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Scale, History, ArrowRight } from 'lucide-react';

export default function ModeSelectModal({ onClose, onSelect }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handlePick = (mode) => {
    onSelect(mode);
  };

  const sheet = (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 mode-sheet-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="选择创建方式"
    >
      <div
        className="w-full max-w-[430px] bg-[var(--card-solid)] rounded-t-3xl px-6 pt-6 mode-sheet-panel"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-medium text-[#3d3428]">这次想做点什么？</h3>
          <button
            onClick={onClose}
            className="text-[#a09080] hover:text-[#6b5d4f]"
            aria-label="关闭"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handlePick('active')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#d4cbb8] bg-white hover:border-[#8b7355] hover:bg-[#faf6ef] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8dfd0] flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-[#8b7355]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3d3428]">正在做选择</p>
              <p className="text-xs text-[#a09080] mt-0.5">列出选项，权衡利弊，认真做一次决策</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#a09080] shrink-0" strokeWidth={1.5} />
          </button>

          <button
            onClick={() => handlePick('backfill')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#d4cbb8] bg-white hover:border-[#8b7355] hover:bg-[#faf6ef] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#dde5d4] flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-[#5a6b4f]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3d3428]">补记一个决定</p>
              <p className="text-xs text-[#a09080] mt-0.5">已经做过的事，简单几句记下来就行</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#a09080] shrink-0" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
