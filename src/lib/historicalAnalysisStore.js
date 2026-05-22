/**
 * 历史分析结果的本地持久化
 * V1 用 localStorage 按决策 id 存储，避免改 DB schema
 */
const STORE_KEY = 'yaobai-zhi-historical-analysis';

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(obj) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  } catch {}
}

export function getHistoricalAnalysis(decisionId) {
  if (!decisionId) return null;
  const store = readStore();
  return store[decisionId] || null;
}

export function saveHistoricalAnalysis(decisionId, payload) {
  if (!decisionId) return;
  const store = readStore();
  store[decisionId] = { ...payload, savedAt: new Date().toISOString() };
  writeStore(store);
}

export function clearHistoricalAnalysis(decisionId) {
  if (!decisionId) return;
  const store = readStore();
  if (decisionId in store) {
    delete store[decisionId];
    writeStore(store);
  }
}
