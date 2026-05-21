import { STALE_THRESHOLD_DAYS } from './constants';

// 注：当前 decisions 表没有 updated_at 字段，updatedAt 暂以 createdAt 兜底。
// 后续如增加 updated_at 列，这里会自动用更新时间。
export function getActivityTime(decision) {
  return decision?.updatedAt || decision?.createdAt || null;
}

export function getDaysSince(isoString) {
  if (!isoString) return 0;
  const ts = new Date(isoString).getTime();
  if (Number.isNaN(ts)) return 0;
  const diffMs = Date.now() - ts;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isSnoozed(decision) {
  if (!decision?.snoozeUntil) return false;
  const ts = new Date(decision.snoozeUntil).getTime();
  if (Number.isNaN(ts)) return false;
  return ts > Date.now();
}

export function isStale(decision) {
  if (!decision || decision.status !== 'active') return false;
  if (isSnoozed(decision)) return false;
  const ref = getActivityTime(decision);
  return getDaysSince(ref) >= STALE_THRESHOLD_DAYS;
}

export function countStale(decisions) {
  return (decisions || []).filter(isStale).length;
}
