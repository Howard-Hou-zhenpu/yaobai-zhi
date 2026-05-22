/**
 * AI Prompt 模板集中管理
 * 所有 AI 调用的 prompt 都在这里定义
 */

/**
 * 生成决策性格报告的 prompt
 * @param {Object} stats - 统计数据
 * @returns {string}
 */
export function buildPersonalityReportPrompt(stats) {
  const {
    totalDecisions,
    completedCount,
    reviewedCount,
    satisfiedCount,
    neutralCount,
    regretCount,
    topCategories,
    avgHesitation,
    avgConfidence,
    keywords,
    decisions
  } = stats;

  const satisfactionRate = reviewedCount > 0 ? Math.round((satisfiedCount / reviewedCount) * 100) : 0;
  const regretRate = reviewedCount > 0 ? Math.round((regretCount / reviewedCount) * 100) : 0;

  const decisionSummary = decisions.slice(0, 10).map(d => {
    const sat = d.satisfaction === 'satisfied' ? '满意' : d.satisfaction === 'neutral' ? '一般' : d.satisfaction === 'regret' ? '后悔' : '未复盘';
    return `- "${d.title}"（${d.category}）→ ${sat}${d.hesitation ? `，纠结度${d.hesitation}/5` : ''}${d.confidence ? `，信心值${d.confidence}/5` : ''}`;
  }).join('\n');

  return `你是一个温和的决策行为分析师。请根据用户的历史决策数据，生成一份结构化的"决策性格报告"。

用户数据概览：
- 总决策数：${totalDecisions}
- 已完成：${completedCount}
- 已复盘：${reviewedCount}
- 满意率：${satisfactionRate}%
- 后悔率：${regretRate}%
- 平均纠结度：${avgHesitation.toFixed(1)}/5
- 平均信心值：${avgConfidence.toFixed(1)}/5
- 高频分类：${topCategories.slice(0, 3).map(c => c.category).join('、')}
${keywords.length > 0 ? `- 高频关键词：${keywords.slice(0, 5).join('、')}` : ''}

最近决策记录：
${decisionSummary}

请严格按照以下 JSON 格式返回，不要有任何其他内容：

{
  "decisionType": "决策人格类型（从以下选择：谨慎权衡型/机会探索型/情绪感受型/效率行动型/稳定保守型/成长导向型/反复验证型）",
  "oneSentenceSummary": "一句话总结用户的决策风格（30字以内）",
  "confidenceLevel": "决策信心水平（高/中等/偏低）",
  "coreTraits": [
    {
      "title": "核心特质标题",
      "description": "具体描述这个特质的表现"
    }
  ],
  "dataInsights": [
    {
      "label": "数据标签",
      "value": "数据值",
      "explanation": "这个数据说明了什么"
    }
  ],
  "patterns": [
    {
      "pattern": "发现的决策模式",
      "evidence": "支持这个模式的证据"
    }
  ],
  "regretReasons": [
    {
      "reason": "可能导致后悔的原因",
      "suggestion": "针对性建议"
    }
  ],
  "nextActions": [
    "具体可执行的建议1",
    "具体可执行的建议2",
    "具体可执行的建议3"
  ],
  "shareCardText": "适合分享的一句话总结（50字以内）"
}

要求：
1. 必须严格返回 JSON 格式，不要有任何 markdown 标记或其他文字
2. 语气温和、具体、非诊断式
3. 使用"你"而非"用户"
4. 基于实际数据说话，不要编造不存在的信息
5. 如果数据不足，在相应字段中说明"数据有限，暂无法分析"
6. coreTraits 建议 2-3 个
7. dataInsights 建议 3-4 个
8. patterns 建议 2-3 个
9. regretReasons 建议 1-2 个
10. nextActions 建议 3 个
11. 不要使用绝对化语言，多用"倾向于""可能""从数据看"等表达`;
}

/**
 * 生成结构化决策分析的 prompt
 * @param {Object} decision - 决策信息
 * @returns {string}
 */
export function buildDecisionAnalysisPrompt(decision) {
  const { title, description, options, category, hesitation } = decision;
  const optionNames = options.map(o => o.name).filter(Boolean).join('、');

  return `你是一个决策分析助手。用户正在做一个决策，请提供结构化分析帮助用户思考。

决策信息：
- 标题：${title}
${description ? `- 描述：${description}` : ''}
- 分类：${category}
- 纠结度：${hesitation}/5
- 选项：${optionNames}

请严格按照以下 JSON 格式返回，不要有任何其他内容：

{
  "coreConflict": "这个决策的核心冲突是什么（一句话）",
  "decisionGoal": "用户想通过这个决策达成什么目标（一句话）",
  "keyVariables": ["关键变量1", "关键变量2", "关键变量3"],
  "missingInfo": ["可能缺失的信息1", "可能缺失的信息2"],
  "optionAnalyses": [
    {
      "optionName": "选项名称",
      "pros": ["优点1", "优点2"],
      "cons": ["缺点1", "缺点2"],
      "risks": ["风险1", "风险2"],
      "betterWay": "优化建议（如果有）"
    }
  ],
  "suggestedChoice": {
    "choice": "建议的选择（或'需要更多信息'）",
    "reason": "建议理由"
  },
  "reviewQuestion": "复盘时可以关注的问题"
}

要求：
1. 必须严格返回 JSON 格式
2. 基于用户提供的信息分析，不要编造
3. 语气温和、启发式，不要替用户做决定
4. keyVariables 建议 3-5 个
5. missingInfo 建议 2-3 个，如果信息充足可以为空数组
6. 每个选项的 pros/cons/risks 各 2-3 个
7. betterWay 是可选的优化建议
8. suggestedChoice 要谨慎，如果不确定就说"需要更多信息"`;
}

/**
 * 生成结构化复盘追问的 prompt
 * @param {Object} decision - 决策信息
 * @returns {string}
 */
export function buildReviewQuestionsPrompt(decision) {
  const { title, description, selectedOption, satisfaction, review, category, hesitation, confidence } = decision;

  const satisfactionLabel = satisfaction === 'satisfied' ? '满意' : satisfaction === 'neutral' ? '一般' : '后悔';

  let focusArea = '';
  if (satisfaction === 'satisfied') {
    focusArea = '重点关注：哪个判断最关键、哪个经验可以复用、结果好是因为判断准确还是外部条件有利';
  } else if (satisfaction === 'neutral') {
    focusArea = '重点关注：哪部分符合预期、哪部分没有达到预期、如果重新选择会调整什么';
  } else {
    focusArea = '重点关注：后悔的是结果还是决策过程、是否被短期情绪影响、下次可以提前设置什么底线';
  }

  return `你是一个温和的决策复盘引导者。用户完成了一个决策并进行复盘，请生成结构化的反思问题。

决策信息：
- 标题：${title}
${description ? `- 描述：${description}` : ''}
- 分类：${category}
- 选择：${selectedOption}
- 满意度：${satisfactionLabel}
- 纠结度：${hesitation}/5
- 信心值：${confidence}/5
${review ? `- 用户复盘：${review}` : ''}

${focusArea}

请严格按照以下 JSON 格式返回，不要有任何其他内容：

{
  "reviewFocus": "本次复盘的重点方向（一句话）",
  "questions": [
    {
      "question": "具体问题",
      "purpose": "为什么问这个问题"
    }
  ],
  "suggestedReflection": "建议用户在复盘总结中记录什么"
}

要求：
1. 必须严格返回 JSON 格式
2. questions 建议 3-5 个
3. 问题要具体、针对这个决策的实际内容
4. 引导用户思考决策过程而非评判结果
5. 语气温和、支持性
6. purpose 要简短说明问这个问题的价值`;
}

/**
 * 结合个人历史记录的决策分析 prompt
 * @param {Object} params
 * @param {string} params.currentSummary 当前决策的描述（含选项）
 * @param {string} params.historySummary 历史决策摘要（拼接好的多行字符串）
 * @param {Array}  params.optionNames    当前决策的所有选项名（用于约束输出）
 * @param {number} params.sameCategoryCount 同分类的历史条数
 * @param {number} params.totalHistory   实际参考的历史总条数
 * @returns {string}
 */
export function buildHistoricalAnalysisPrompt({
  currentSummary,
  historySummary,
  optionNames,
  sameCategoryCount,
  totalHistory,
}) {
  const hasHistory = totalHistory > 0;
  const crossCategoryNote = hasHistory && sameCategoryCount < totalHistory
    ? `（注意：历史记录中只有 ${sameCategoryCount} 条与当前同分类，其余为跨分类参考，请在分析时区分对待。）`
    : '';

  return `你是一个温和的决策教练，不替用户做决定。请结合用户的"历史决策记录"，为用户当前正在思考的决策做一份个性化分析。

—— 用户当前决策 ——
${currentSummary}

—— 用户的历史决策记录（共 ${totalHistory} 条，其中 ${sameCategoryCount} 条同分类）——
${hasHistory ? historySummary : '（暂无可参考的历史记录）'}
${crossCategoryNote}

请严格按以下 JSON 格式返回，不要有任何 markdown 或多余文字：

{
  "pastPatterns": "总结用户过去类似/相关决策中的规律。比如哪些类型的选择更容易满意，哪些原因容易导致后悔。如历史不足请明说。（80-150 字）",
  "optionAnalyses": [
    {
      "optionName": "${optionNames[0] || '选项名'}",
      "pros": ["优点1", "优点2"],
      "cons": ["缺点1", "缺点2"],
      "risks": ["风险1", "风险2"],
      "missingInfo": "如果信息不足以判断，写出缺什么；信息够则留空字符串"
    }
  ],
  "historicalConnection": [
    {
      "optionName": "选项名",
      "matchesSatisfied": "这个选项符合你过去哪种容易满意的模式（没有可写空字符串）",
      "matchesRegret": "这个选项是否可能重复你过去后悔过的模式（没有可写空字符串）"
    }
  ],
  "questionsToAsk": ["在做决定前可补充思考的问题1", "问题2", "问题3"],
  "softLeanings": [
    {
      "condition": "如果你现在更看重 X",
      "suggestion": "Y 选项可能更值得考虑的理由"
    }
  ],
  "referencedPrinciples": ["从历史复盘中引用的、和当前决策相关的提醒原话（最多 3 条；如无可写空数组）"]
}

要求：
1. 必须严格返回 JSON，不要 markdown 代码块。
2. optionAnalyses 必须覆盖所有候选选项：${optionNames.join('、')}。
3. historicalConnection 中的 optionName 必须出自上述选项。
4. softLeanings 至少 2 条，每条都必须以"如果……"这类条件句开头，**不要**使用"必须""一定""唯一正确""最佳答案"等绝对化词语。
5. questionsToAsk 给 2-4 个，要具体、可执行。
6. referencedPrinciples 只能引用确实出现在历史记录的"沉淀原则"中的原话，不能编造。
7. 语气温和、像朋友陪聊，不替用户拍板。
8. 如果历史记录不足或都不相关，pastPatterns 和 historicalConnection 可以坦诚说"参考有限"，但仍要完成 optionAnalyses 和 questionsToAsk。`;
}

/**
 * 解析 AI 返回的 JSON，带容错处理
 * @param {string} text - AI 返回的文本
 * @returns {Object|null}
 */
export function parseAIJson(text) {
  try {
    // 尝试直接解析
    return JSON.parse(text);
  } catch {
    try {
      // 尝试提取 JSON 部分（可能包含 markdown 代码块）
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // 尝试提取 { } 之间的内容
      const braceMatch = text.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        return JSON.parse(braceMatch[0]);
      }
    } catch {}
  }
  return null;
}
