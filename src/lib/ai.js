import { getActiveConfig, incrementFreeUsage } from './apiKeyStore';

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
