/**
 * 隐私脱敏工具
 * 用于分享卡片时保护用户隐私
 */

/**
 * 脱敏文本
 * @param {string} text - 原始文本
 * @param {Object} options - 脱敏选项
 * @returns {string}
 */
export function sanitizeText(text, options = {}) {
  if (!text) return text;

  const {
    hideEmail = true,
    hidePhone = true,
    hideAmount = true,
    hideCompany = true,
    maxLength = 200,
  } = options;

  let result = text;

  // 脱敏邮箱
  if (hideEmail) {
    result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[邮箱]');
  }

  // 脱敏手机号
  if (hidePhone) {
    result = result.replace(/1[3-9]\d{9}/g, '[电话]');
    result = result.replace(/\d{3}-\d{4}-\d{4}/g, '[电话]');
  }

  // 脱敏金额
  if (hideAmount) {
    result = result.replace(/[¥$€£]\s*\d+[\d,.]*/g, '[金额]');
    result = result.replace(/\d+[\d,.]*\s*[元块万千百十]/g, '[金额]');
  }

  // 脱敏公司名
  if (hideCompany) {
    result = result.replace(/[一-龥]{2,}(公司|集团|科技|有限|股份|企业|工作室)/g, '[公司]');
  }

  // 脱敏连续数字（可能是身份证、账号等）
  result = result.replace(/\d{6,}/g, (match) => {
    if (match.length >= 11) return '[数字]';
    return match;
  });

  // 截断过长文本
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength) + '...';
  }

  return result;
}

/**
 * 为分享卡片准备数据
 * @param {Object} data - 原始数据
 * @param {boolean} enableSanitize - 是否启用脱敏
 * @returns {Object}
 */
export function prepareShareData(data, enableSanitize = true) {
  if (!enableSanitize) return data;

  const sanitized = { ...data };

  // 脱敏标题
  if (sanitized.title) {
    sanitized.title = sanitizeText(sanitized.title, { maxLength: 50 });
  }

  // 脱敏描述
  if (sanitized.description) {
    sanitized.description = sanitizeText(sanitized.description, { maxLength: 100 });
  }

  // 脱敏复盘总结
  if (sanitized.review) {
    sanitized.review = sanitizeText(sanitized.review, { maxLength: 150 });
  }

  // 脱敏选项名称
  if (sanitized.selectedOption) {
    sanitized.selectedOption = sanitizeText(sanitized.selectedOption, { maxLength: 30 });
  }

  return sanitized;
}

/**
 * 生成分享文案
 * @param {Object} data - 数据
 * @param {string} type - 类型：'decision' | 'report'
 * @returns {string}
 */
export function generateShareText(data, type = 'decision') {
  if (type === 'report') {
    const { decisionType, oneSentenceSummary, reviewedCount, satisfactionRate, regretRate, topCategory } = data;
    return `我的决策人格：${decisionType}

${oneSentenceSummary}

已复盘 ${reviewedCount} 次 · 满意率 ${satisfactionRate}% · 后悔率 ${regretRate}%
最常纠结：${topCategory}

来自「摇摆志」｜安静地与自己对话`;
  }

  // decision 类型
  const { category, satisfaction, title, description, hesitation, confidence, review } = data;
  const satisfactionLabel = satisfaction === 'satisfied' ? '满意' : satisfaction === 'neutral' ? '一般' : '后悔';

  return `${category} · ${satisfactionLabel}

${title}
${description || ''}

纠结度 ${hesitation}/5 · 信心值 ${confidence}/5

${review || ''}

来自「摇摆志」｜记录每一次选择`;
}
