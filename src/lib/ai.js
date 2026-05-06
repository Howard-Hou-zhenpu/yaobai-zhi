import { getActiveConfig, incrementFreeUsage } from './apiKeyStore';
import { buildPersonalityReportPrompt, buildDecisionAnalysisPrompt, buildReviewQuestionsPrompt, parseAIJson } from './aiPrompts';

const ENDPOINTS = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  kimi: 'https://api.moonshot.cn/v1/chat/completions',
};

const MODELS = {
  deepseek: 'deepseek-chat',
  kimi: 'moonshot-v1-8k',
};

const SATISFACTION_LABELS = { satisfied: '满意', neutral: '一般', regret: '后悔' };

function buildPrompt(decision) {
  const parts = [`决策标题：${decision.title}`];
  if (decision.description) parts.push(`决策描述：${decision.description}`);
  if (decision.selectedOption) parts.push(`选择的选项：${decision.selectedOption}`);
  if (decision.satisfaction) parts.push(`满意度：${SATISFACTION_LABELS[decision.satisfaction] || decision.satisfaction}`);
  if (decision.review) parts.push(`用户的复盘总结：${decision.review}`);

  return `你是一个温和的决策复盘引导者。用户完成了一个决策，请根据以下信息生成 3-5 个反思问题，帮助用户更深入地理解自己的决策过程。

${parts.join('\n')}

要求：
- 问题要具体，针对这个决策的实际内容
- 引导用户思考决策过程而非评判结果
- 帮助用户发现自己的决策模式
- 语气温和、支持性，像朋友在聊天
- 每个问题一行，不要编号，不要多余格式
- 最多 5 个问题`;
}

export async function generateReflection(decision) {
  const config = getActiveConfig();
  if (!config) throw new Error('没有可用的 AI 额度，请在设置中填写 API Key');

  const endpoint = ENDPOINTS[config.provider];
  const model = MODELS[config.provider];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildPrompt(decision) }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`AI 调用失败 (${response.status})${err ? ': ' + err : ''}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  if (config.isFree) incrementFreeUsage();

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function callAI(prompt, maxTokens = 500) {
  const config = getActiveConfig();
  if (!config) throw new Error('没有可用的 AI 额度，请在设置中填写 API Key');

  const response = await fetch(ENDPOINTS[config.provider], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: MODELS[config.provider],
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`AI 调用失败 (${response.status})${err ? ': ' + err : ''}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (config.isFree) incrementFreeUsage();
  return text;
}

export async function generateAnalysisHints(title, description, options) {
  const optionNames = options.map((o) => o.name).filter(Boolean).join('、');
  const prompt = `你是一个决策分析助手。用户正在做一个重要决策，请为每个选项提供简短的分析维度提示，帮助用户思考。

决策标题：${title}
${description ? `决策描述：${description}` : ''}
选项：${optionNames}

请为每个选项分别生成简短提示，格式如下（严格按此格式，不要多余内容）：
【选项名称】
优点：一句话提示
缺点：一句话提示
风险：一句话提示

每个维度只写一句话（15字以内），用来启发用户自己深入思考，不要替用户做判断。`;

  const text = await callAI(prompt, 600);
  const entries = [];
  let current = null;
  text.split('\n').forEach((line) => {
    const l = line.trim();
    const nameMatch = l.match(/^【(.+?)】$/);
    if (nameMatch) { current = { name: nameMatch[1], pros: '', cons: '', risks: '' }; entries.push(current); return; }
    if (current && l.startsWith('优点：')) current.pros = l.replace('优点：', '').trim();
    if (current && l.startsWith('缺点：')) current.cons = l.replace('缺点：', '').trim();
    if (current && l.startsWith('风险：')) current.risks = l.replace('风险：', '').trim();
  });
  return entries;
}

export async function generateDecisionReport(decisions) {
  const summary = decisions.map((d) => {
    const sat = SATISFACTION_LABELS[d.satisfaction] || '未复盘';
    return `- "${d.title}"（${d.category}）→ ${sat}${d.hesitation ? `，纠结度${d.hesitation}/5` : ''}${d.confidence ? `，信心值${d.confidence}/5` : ''}`;
  }).join('\n');

  const categoryStats = {};
  decisions.forEach((d) => {
    if (!categoryStats[d.category]) categoryStats[d.category] = { total: 0, satisfied: 0, regret: 0 };
    categoryStats[d.category].total++;
    if (d.satisfaction === 'satisfied') categoryStats[d.category].satisfied++;
    if (d.satisfaction === 'regret') categoryStats[d.category].regret++;
  });

  const prompt = `你是一个决策行为分析师。根据以下用户的历史决策数据，生成一份简短的"决策性格报告"。

用户共有 ${decisions.length} 条决策记录：
${summary}

请生成一份 150 字以内的性格报告，包含：
1. 用户的决策风格特征（保守型/冒险型/犹豫型/果断型等）
2. 一个有趣的发现（比如某类决策满意度特别高或低）
3. 一句鼓励性的建议

要求：
- 用第二人称"你"
- 语气温和、像朋友分析
- 不要用标题或编号，写成一段连贯的文字
- 基于数据说话，不要泛泛而谈`;

  return await callAI(prompt, 400);
}

/**
 * 生成结构化决策性格报告
 * @param {Array} decisions - 决策列表
 * @returns {Promise<Object>}
 */
export async function generatePersonalityReport(decisions) {
  // 计算统计数据
  const totalDecisions = decisions.length;
  const completedCount = decisions.filter(d => d.status === 'completed' || d.status === 'reviewed').length;
  const reviewedCount = decisions.filter(d => d.status === 'reviewed').length;
  const satisfiedCount = decisions.filter(d => d.satisfaction === 'satisfied').length;
  const neutralCount = decisions.filter(d => d.satisfaction === 'neutral').length;
  const regretCount = decisions.filter(d => d.satisfaction === 'regret').length;

  // 统计分类
  const categoryMap = {};
  decisions.forEach(d => {
    categoryMap[d.category] = (categoryMap[d.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // 计算平均值
  const decisionsWithHesitation = decisions.filter(d => d.hesitation > 0);
  const avgHesitation = decisionsWithHesitation.length > 0
    ? decisionsWithHesitation.reduce((sum, d) => sum + d.hesitation, 0) / decisionsWithHesitation.length
    : 0;

  const decisionsWithConfidence = decisions.filter(d => d.confidence > 0);
  const avgConfidence = decisionsWithConfidence.length > 0
    ? decisionsWithConfidence.reduce((sum, d) => sum + d.confidence, 0) / decisionsWithConfidence.length
    : 0;

  // 提取关键词（简单实现）
  const keywords = [];
  decisions.forEach(d => {
    if (d.title) keywords.push(...d.title.split(/[，。、；]/));
    if (d.description) keywords.push(...d.description.split(/[，。、；]/));
  });
  const keywordFreq = {};
  keywords.forEach(k => {
    const word = k.trim();
    if (word.length >= 2 && word.length <= 6) {
      keywordFreq[word] = (keywordFreq[word] || 0) + 1;
    }
  });
  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  const stats = {
    totalDecisions,
    completedCount,
    reviewedCount,
    satisfiedCount,
    neutralCount,
    regretCount,
    topCategories,
    avgHesitation,
    avgConfidence,
    keywords: topKeywords,
    decisions: decisions.filter(d => d.status === 'reviewed').slice(0, 10)
  };

  const prompt = buildPersonalityReportPrompt(stats);
  const text = await callAI(prompt, 1500);
  const parsed = parseAIJson(text);

  if (!parsed) {
    throw new Error('AI 返回格式解析失败');
  }

  return {
    ...parsed,
    stats,
    rawResponse: text
  };
}

/**
 * 生成结构化决策分析
 * @param {Object} decision - 决策信息
 * @returns {Promise<Object>}
 */
export async function generateStructuredAnalysis(decision) {
  const prompt = buildDecisionAnalysisPrompt(decision);
  const text = await callAI(prompt, 1200);
  const parsed = parseAIJson(text);

  if (!parsed) {
    throw new Error('AI 返回格式解析失败');
  }

  return {
    ...parsed,
    rawResponse: text
  };
}

/**
 * 生成结构化复盘追问
 * @param {Object} decision - 决策信息
 * @returns {Promise<Object>}
 */
export async function generateStructuredReviewQuestions(decision) {
  const prompt = buildReviewQuestionsPrompt(decision);
  const text = await callAI(prompt, 800);
  const parsed = parseAIJson(text);

  if (!parsed) {
    throw new Error('AI 返回格式解析失败');
  }

  return {
    ...parsed,
    rawResponse: text
  };
}
