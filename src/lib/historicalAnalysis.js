/**
 * "结合我的记录分析"功能的历史筛选与摘要逻辑
 * V1：基于规则打分，不做语义匹配
 */

const SATISFACTION_LABELS = { satisfied: '满意', neutral: '一般', regret: '后悔' };
const MAX_HISTORY = 10;

/**
 * 从所有决策中挑出参考用的历史记录
 * @param {Object} current 当前决策
 * @param {Array}  all     所有决策
 * @returns {{selected: Array, sameCategoryCount: number, totalCandidates: number}}
 */
export function selectHistoricalDecisions(current, all) {
  if (!current || !Array.isArray(all)) {
    return { selected: [], sameCategoryCount: 0, totalCandidates: 0 };
  }

  const candidates = all.filter(
    (d) =>
      d &&
      d.id !== current.id &&
      (d.status === 'completed' || d.status === 'reviewed')
  );

  const scored = candidates.map((d) => {
    let s = 0;
    if (current.category && d.category && d.category === current.category) s += 100;
    if (d.status === 'reviewed') s += 30;
    if (d.decisionPrinciple && d.decisionPrinciple.trim()) s += 20;
    if (d.regretReasons && d.regretReasons.trim()) s += 10;
    return { d, s };
  });

  scored.sort((a, b) => {
    if (a.s !== b.s) return b.s - a.s;
    const ta = new Date(a.d.reviewedAt || a.d.completedAt || a.d.createdAt || 0).getTime();
    const tb = new Date(b.d.reviewedAt || b.d.completedAt || b.d.createdAt || 0).getTime();
    return tb - ta;
  });

  const selected = scored.slice(0, MAX_HISTORY).map((x) => x.d);
  const sameCategoryCount = selected.filter(
    (d) => current.category && d.category === current.category
  ).length;

  return { selected, sameCategoryCount, totalCandidates: candidates.length };
}

/**
 * 把一条历史决策压缩成给 AI 的轻量摘要
 */
export function summarizeHistoryForPrompt(d, currentCategory) {
  const parts = [];
  parts.push(`- 标题：${d.title || '（无标题）'}`);
  parts.push(`  分类：${d.category || '未分类'}${currentCategory && d.category !== currentCategory ? '（跨分类）' : ''}`);
  if (d.description && d.description.trim()) {
    const desc = d.description.trim().slice(0, 80);
    parts.push(`  背景：${desc}${d.description.length > 80 ? '…' : ''}`);
  }
  if (d.selectedOption) parts.push(`  最终选择：${d.selectedOption}`);
  if (d.satisfaction) parts.push(`  满意度：${SATISFACTION_LABELS[d.satisfaction] || d.satisfaction}`);
  if (d.confidence > 0) parts.push(`  信心值：${d.confidence}/5`);
  if (d.hesitation > 0) parts.push(`  纠结度：${d.hesitation}/5`);
  if (d.decisionPrinciple && d.decisionPrinciple.trim()) {
    parts.push(`  沉淀原则：${d.decisionPrinciple.trim().slice(0, 100)}`);
  }
  if (d.regretReasons && d.regretReasons.trim()) {
    parts.push(`  后悔原因：${d.regretReasons.trim()}`);
  }
  const ts = d.reviewedAt || d.completedAt || d.createdAt;
  if (ts) parts.push(`  时间：${new Date(ts).toLocaleDateString('zh-CN')}`);
  return parts.join('\n');
}

/**
 * 把当前决策压缩成给 AI 的描述
 */
export function summarizeCurrentForPrompt(c) {
  const lines = [];
  lines.push(`标题：${c.title || '（无标题）'}`);
  lines.push(`分类：${c.category || '未分类'}`);
  if (c.description && c.description.trim()) {
    lines.push(`背景：${c.description.trim()}`);
  }
  if (c.hesitation > 0) lines.push(`纠结度：${c.hesitation}/5`);
  if (c.notes && c.notes.trim()) {
    lines.push(`备注：${c.notes.trim()}`);
  }

  const opts = (c.options || []).filter((o) => o && o.name && o.name.trim());
  lines.push(`\n候选选项（共 ${opts.length} 个）：`);
  opts.forEach((o, i) => {
    lines.push(`  ${i + 1}. ${o.name}`);
    if (o.pros) lines.push(`     已记录的优点：${o.pros}`);
    if (o.cons) lines.push(`     已记录的缺点：${o.cons}`);
    if (o.risks) lines.push(`     已记录的风险：${o.risks}`);
    if (o.worstCase) lines.push(`     最坏情况：${o.worstCase}`);
    if (o.solution) lines.push(`     应对方案：${o.solution}`);
  });

  return lines.join('\n');
}
