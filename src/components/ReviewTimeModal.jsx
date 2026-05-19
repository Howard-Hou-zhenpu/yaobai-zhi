import { useState } from 'react';
import { X, CalendarClock } from 'lucide-react';
import { Button } from './ui/button';

const REVIEW_OPTIONS = [
  { label: '1天后', days: 1 },
  { label: '3天后', days: 3 },
  { label: '1周后', days: 7 },
  { label: '1个月后', days: 30 },
];

const CATEGORY_RECOMMENDATIONS = {
  '生活消费': 7,
  '职业发展': 30,
  '学习教育': 7,
  '人际关系': 3,
  '健康运动': 3,
  '投资理财': 30,
  '其他': 7,
};

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export default function ReviewTimeModal({ category, onConfirm, onClose }) {
  const [customDate, setCustomDate] = useState('');
  const recommended = CATEGORY_RECOMMENDATIONS[category] || 7;

  const handleSelect = (days) => {
    onConfirm(addDays(days));
  };

  const handleCustom = () => {
    if (!customDate) return;
    const d = new Date(customDate);
    d.setHours(9, 0, 0, 0);
    onConfirm(d.toISOString());
  };

  const handleSkip = () => {
    onConfirm(null);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-[430px] bg-[var(--card-solid)] rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#8b7355]" strokeWidth={1.5} />
            <h3 className="text-base font-medium text-[#3d3428]">什么时候回来看看这个决定？</h3>
          </div>
          <button onClick={onClose} className="text-[#a09080] hover:text-[#6b5d4f]">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {REVIEW_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => handleSelect(opt.days)}
              className="relative px-4 py-3 rounded-xl border border-[#d4cbb8] bg-white text-sm font-medium text-[#3d3428] hover:border-[#8b7355] hover:bg-[#f5f1e8] transition-all"
            >
              {opt.label}
              {opt.days === recommended && (
                <span className="absolute -top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[#8b7355] text-white">推荐</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="date"
            value={customDate}
            min={minDateStr}
            onChange={(e) => setCustomDate(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border border-[#d4cbb8] bg-white text-sm text-[#3d3428] focus:outline-none focus:border-[#8b7355]"
          />
          <Button size="sm" className="rounded-xl h-10 px-4" onClick={handleCustom} disabled={!customDate}>
            确定
          </Button>
        </div>

        <button onClick={handleSkip} className="w-full text-center text-sm text-[#a09080] hover:text-[#6b5d4f] py-2">
          暂不设置
        </button>
      </div>
    </div>
  );
}
