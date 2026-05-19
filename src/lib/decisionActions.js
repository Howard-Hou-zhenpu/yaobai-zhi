function isReviewDue(reviewDueAt) {
  if (!reviewDueAt) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(reviewDueAt) <= today;
}

function countNamedOptions(options) {
  if (!Array.isArray(options)) return 0;
  return options.filter((o) => o && typeof o.name === 'string' && o.name.trim()).length;
}

/**
 * Compute the suggested next action for a decision.
 *
 * Possible type values:
 *   - 'add_options'      Active decision with fewer than 2 valid options
 *   - 'ai_analyze'       Reserved for future use (AI-driven analysis nudge)
 *   - 'make_choice'      Active decision with 2+ options but no selection yet
 *   - 'set_review_time'  Completed decision without a scheduled review time
 *   - 'review_due'       Completed decision whose reviewDueAt has passed
 *   - 'none'             No action required (reviewed, or in waiting window)
 *
 * Returns a stable object so callers can safely destructure:
 *   { type, label, actionText }
 */
export function getDecisionNextAction(decision) {
  const fallback = { type: 'none', label: '', actionText: '' };
  if (!decision || typeof decision !== 'object') return fallback;

  const status = decision.status || 'active';

  if (status === 'reviewed') return fallback;

  if (status === 'completed') {
    if (isReviewDue(decision.reviewDueAt)) {
      return {
        type: 'review_due',
        label: '现在可以复盘了',
        actionText: '去复盘',
      };
    }
    if (!decision.reviewDueAt) {
      return {
        type: 'set_review_time',
        label: '建议设置复盘时间',
        actionText: '设置复盘',
      };
    }
    return fallback;
  }

  if (status === 'active') {
    const namedCount = countNamedOptions(decision.options);
    if (namedCount < 2) {
      return {
        type: 'add_options',
        label: '先补充 2 个可选方案',
        actionText: '补充选项',
      };
    }
    if (!decision.selectedOption || !String(decision.selectedOption).trim()) {
      return {
        type: 'make_choice',
        label: '现在更倾向哪个？',
        actionText: '去选择',
      };
    }
    return fallback;
  }

  return fallback;
}
