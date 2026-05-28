import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Lock, ExternalLink, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { getApiConfig, saveApiConfig, clearApiConfig, getFreeRemaining, getPreferCustom, setPreferCustom } from '../lib/apiKeyStore';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', url: 'https://platform.deepseek.com/api_keys', placeholder: '请输入 DeepSeek API Key' },
  { value: 'kimi', label: 'Kimi (Moonshot)', url: 'https://platform.moonshot.cn/console/api-keys', placeholder: '请输入 Kimi API Key' },
];

const FREE_LIMIT = 3;

function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 3)}••••••••${key.slice(-4)}`;
}

function ProviderCard({ provider, savedConfig, onSaved, onCleared }) {
  const isActive = savedConfig?.provider === provider.value && !!savedConfig?.apiKey;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      toast.error('请输入 API Key');
      return;
    }
    try {
      saveApiConfig({ provider: provider.value, apiKey: trimmed });
      toast.success('已保存。');
      setDraft('');
      setEditing(false);
      onSaved?.();
    } catch {
      toast.error('保存失败，请稍后再试');
    }
  };

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    clearApiConfig();
    toast.success('已清除。');
    setConfirmingClear(false);
    onCleared?.();
  };

  return (
    <Card className="border border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-[#3d3428] truncate">{provider.label}</span>
            {isActive && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#dde5d4] text-[#5a6b4f] text-[10px] shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={2} />
                当前启用
              </span>
            )}
          </div>
        </div>

        {isActive && !editing ? (
          <>
            <div className="rounded-lg bg-[#f5f1e8] border border-border/40 px-3 py-2 text-xs text-[#6b5d4f]">
              <span className="text-muted-foreground">已保存：</span>
              <span className="font-mono tabular-nums">{maskKey(savedConfig.apiKey)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full h-10"
                onClick={() => { setEditing(true); setDraft(''); }}
              >
                替换
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'rounded-full h-10 gap-1.5',
                  confirmingClear ? 'text-destructive border border-destructive/40' : 'text-[#a09080]'
                )}
                onClick={handleClear}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                {confirmingClear ? '确认清除' : '清除'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={provider.placeholder}
            />
            <div className="flex gap-2">
              <Button className="flex-1 rounded-full h-10 font-medium" onClick={handleSave}>保存</Button>
              {editing && (
                <Button
                  variant="ghost"
                  className="rounded-full h-10 text-[#a09080]"
                  onClick={() => { setEditing(false); setDraft(''); }}
                >
                  取消
                </Button>
              )}
            </div>
          </>
        )}

        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
          还没有 API Key？可以前往
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8b7355] underline underline-offset-2 mx-1 inline-flex items-center gap-0.5"
          >
            {provider.label} 官网
            <ExternalLink className="w-2.5 h-2.5" strokeWidth={1.5} />
          </a>
          申请。
        </p>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [savedConfig, setSavedConfig] = useState(getApiConfig());
  const [preferCustom, setPrefer] = useState(getPreferCustom());
  const freeRemaining = getFreeRemaining();
  const hasCustom = !!savedConfig?.apiKey;

  const refresh = () => setSavedConfig(getApiConfig());

  const handlePriorityChange = (value) => {
    setPrefer(value);
    setPreferCustom(value);
  };

  return (
    <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] px-4 max-w-[430px] mx-auto">
      <div className="flex items-center gap-3 py-5">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[#a09080] hover:text-[#6b5d4f]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <h1 className="text-[20px] font-bold text-[#3d3428]">AI 设置</h1>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-[11px] text-[#a09080] tracking-wide leading-none">免费额度</p>
          <p className="text-[28px] font-semibold text-[#3d3428] mt-2 leading-none tabular-nums">
            {freeRemaining}<span className="text-base font-normal text-muted-foreground"> / {FREE_LIMIT} 次可用</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
            {freeRemaining > 0
              ? '每月自动重置，用于默认 AI 分析。'
              : '本月免费额度已用完。你可以等待下月重置，或使用自定义 API Key。'}
          </p>
        </CardContent>
      </Card>

      {hasCustom && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-[#3d3428]">使用优先级</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                有自定义 Key 时，可以选择优先使用哪一种。
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handlePriorityChange(false)}
                className={cn(
                  'w-full text-left rounded-xl border p-3 transition-all',
                  !preferCustom
                    ? 'border-[#8b7355] bg-[#faf6ef]'
                    : 'border-border/50 bg-card hover:border-[#d4cbb8]'
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center',
                      !preferCustom ? 'border-[#8b7355]' : 'border-[#d4cbb8]'
                    )}
                  >
                    {!preferCustom && <span className="w-1.5 h-1.5 rounded-full bg-[#8b7355]" />}
                  </span>
                  <span className="text-sm font-medium text-[#3d3428]">免费额度优先</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-5 leading-relaxed">
                  优先使用每月免费额度，用完后再使用自定义 Key。
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePriorityChange(true)}
                className={cn(
                  'w-full text-left rounded-xl border p-3 transition-all',
                  preferCustom
                    ? 'border-[#8b7355] bg-[#faf6ef]'
                    : 'border-border/50 bg-card hover:border-[#d4cbb8]'
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center',
                      preferCustom ? 'border-[#8b7355]' : 'border-[#d4cbb8]'
                    )}
                  >
                    {preferCustom && <span className="w-1.5 h-1.5 rounded-full bg-[#8b7355]" />}
                  </span>
                  <span className="text-sm font-medium text-[#3d3428]">自定义 Key 优先</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-5 leading-relaxed">
                  优先使用你填写的 API Key，不消耗免费额度。
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-2">
        <h2 className="text-sm font-medium text-[#3d3428]">自定义 API Key</h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          填写自己的 Key 后，可使用对应模型。
        </p>
      </div>

      <div className="rounded-xl border border-[#dde5d4] bg-[#f5f8f0] px-3 py-2 mb-3 flex items-start gap-2">
        <Lock className="w-3.5 h-3.5 text-[#5a6b4f] shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-[11px] text-[#5a6b4f] leading-relaxed">
          你的 API Key 只保存在当前浏览器本地，不会上传到服务器。
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground/80 mb-3 leading-relaxed">
        目前同一时间只能启用一个模型 Key，保存新的会替换之前的。
      </p>

      <div className="space-y-3">
        {PROVIDERS.map((p) => (
          <ProviderCard
            key={p.value}
            provider={p}
            savedConfig={savedConfig}
            onSaved={refresh}
            onCleared={refresh}
          />
        ))}
      </div>
    </div>
  );
}
