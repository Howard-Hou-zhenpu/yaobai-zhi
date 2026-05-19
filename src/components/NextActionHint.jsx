import { Sparkles, ListPlus, Hand, CalendarClock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { getDecisionNextAction } from '../lib/decisionActions';

const ACTION_ICONS = {
  add_options: ListPlus,
  ai_analyze: Sparkles,
  make_choice: Hand,
  set_review_time: CalendarClock,
  review_due: CheckCircle2,
};

const TONE = {
  add_options: { bg: 'bg-[#faf6ef]', border: 'border-[#e8dfd0]', text: 'text-[#8b7355]' },
  ai_analyze: { bg: 'bg-[#fbf6e6]', border: 'border-[#ecdfb5]', text: 'text-[#a8893a]' },
  make_choice: { bg: 'bg-[#f5f1e8]', border: 'border-[#d4cbb8]', text: 'text-[#8b7355]' },
  set_review_time: { bg: 'bg-[#f5f8f0]', border: 'border-[#d4ddc8]', text: 'text-[#5a6b4f]' },
  review_due: { bg: 'bg-[#f0ece5]', border: 'border-[#c8b89c]', text: 'text-[#7a6245]' },
};

export default function NextActionHint({ decision, onAction, variant = 'inline' }) {
  const action = getDecisionNextAction(decision);
  if (action.type === 'none') return null;

  const Icon = ACTION_ICONS[action.type] || ArrowRight;
  const tone = TONE[action.type] || TONE.make_choice;

  const handleClick = (e) => {
    e.stopPropagation();
    onAction?.(action);
  };

  if (variant === 'compact') {
    return (
      <div
        className={`mt-2.5 flex items-center justify-between gap-2 rounded-xl border ${tone.border} ${tone.bg} px-2.5 py-1.5`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className={`w-3 h-3 shrink-0 ${tone.text}`} strokeWidth={1.5} />
          <span className={`text-xs truncate ${tone.text}`}>{action.label}</span>
        </div>
        {onAction && (
          <button
            onClick={handleClick}
            className={`text-xs font-medium shrink-0 flex items-center gap-0.5 ${tone.text} hover:opacity-80`}
          >
            {action.actionText}
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`mb-4 flex items-center justify-between gap-3 rounded-2xl border ${tone.border} ${tone.bg} p-3.5`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${tone.text}`} strokeWidth={1.5} />
        <div className="min-w-0">
          <p className={`text-sm font-medium ${tone.text}`}>下一步：{action.label}</p>
        </div>
      </div>
      {onAction && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleClick}
          className={`rounded-xl shrink-0 gap-1 ${tone.text} ${tone.border} hover:bg-white`}
        >
          {action.actionText}
          <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
        </Button>
      )}
    </div>
  );
}
