import { X, Scale, History, ArrowRight } from 'lucide-react';

export default function ModeSelectModal({ onClose, onSelect }) {
  const handlePick = (mode) => {
    onSelect(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-[var(--card-solid)] rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-medium text-[#3d3428]">这次想做点什么？</h3>
          <button onClick={onClose} className="text-[#a09080] hover:text-[#6b5d4f]">
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
}
