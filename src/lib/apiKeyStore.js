const STORE_KEY = 'yaobai-zhi-api-config';
const USAGE_KEY = 'yaobai-zhi-ai-usage';
const PREFER_KEY = 'yaobai-zhi-ai-prefer';
const FREE_LIMIT = 3;

export function getApiConfig() {
  try {
    const data = localStorage.getItem(STORE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveApiConfig(config) {
  localStorage.setItem(STORE_KEY, JSON.stringify(config));
}

export function clearApiConfig() {
  localStorage.removeItem(STORE_KEY);
}

export function getFreeUsage() {
  try {
    const data = localStorage.getItem(USAGE_KEY);
    if (!data) return { month: '', count: 0 };
    return JSON.parse(data);
  } catch {
    return { month: '', count: 0 };
  }
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getFreeRemaining() {
  const usage = getFreeUsage();
  const currentMonth = getCurrentMonth();
  if (usage.month !== currentMonth) return FREE_LIMIT;
  return Math.max(0, FREE_LIMIT - usage.count);
}

export function incrementFreeUsage() {
  const currentMonth = getCurrentMonth();
  const usage = getFreeUsage();
  if (usage.month !== currentMonth) {
    localStorage.setItem(USAGE_KEY, JSON.stringify({ month: currentMonth, count: 1 }));
  } else {
    localStorage.setItem(USAGE_KEY, JSON.stringify({ month: currentMonth, count: usage.count + 1 }));
  }
}

export function canUseAI() {
  const customConfig = getApiConfig();
  if (customConfig?.apiKey) return true;
  return getFreeRemaining() > 0;
}

export function getPreferCustom() {
  return localStorage.getItem(PREFER_KEY) === 'true';
}

export function setPreferCustom(value) {
  localStorage.setItem(PREFER_KEY, value ? 'true' : 'false');
}

export function getActiveConfig() {
  const custom = getApiConfig();
  const defaultKey = import.meta.env.VITE_KIMI_API_KEY;
  const hasCustom = !!custom?.apiKey;
  const hasFree = defaultKey && getFreeRemaining() > 0;
  const preferCustom = getPreferCustom();

  if (preferCustom && hasCustom) {
    return { provider: custom.provider, apiKey: custom.apiKey, isFree: false };
  }
  if (hasFree) {
    return { provider: 'kimi', apiKey: defaultKey, isFree: true };
  }
  if (hasCustom) {
    return { provider: custom.provider, apiKey: custom.apiKey, isFree: false };
  }
  return null;
}
