import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getApiConfig, saveApiConfig, clearApiConfig, getFreeRemaining, getPreferCustom, setPreferCustom } from '../lib/apiKeyStore';
import { toast } from 'sonner';

const PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', url: 'https://platform.deepseek.com/api_keys' },
  { value: 'kimi', label: 'Kimi (Moonshot)', url: 'https://platform.moonshot.cn/console/api-keys' },
];

export default function Settings() {
  const navigate = useNavigate();
  const existing = getApiConfig();
  const [provider, setProvider] = useState(existing?.provider || 'deepseek');
  const [apiKey, setApiKey] = useState(existing?.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [preferCustom, setPrefer] = useState(getPreferCustom());
  const freeRemaining = getFreeRemaining();

  const handleSave = () => {
    if (!apiKey.trim()) { toast.error('请输入 API Key'); return; }
    saveApiConfig({ provider, apiKey: apiKey.trim() });
    toast.success('API Key 已保存');
  };

  const handleClear = () => {
    clearApiConfig();
    setApiKey('');
    toast.success('已清除自定义 Key，将使用免费额度');
  };

  const currentProvider = PROVIDERS.find((p) => p.value === provider);

  return (
    <div className="pb-20 px-5">
      <div className="flex items-center gap-3 py-5">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <h1 className="text-lg font-medium">AI 设置</h1>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">免费额度</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-medium">{freeRemaining}<span className="text-sm text-muted-foreground font-normal"> / 3 次</span></p>
          <p className="text-xs text-muted-foreground mt-1">每月重置，使用默认 AI 模型</p>
        </CardContent>
      </Card>

      {existing?.apiKey && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">优先使用</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {preferCustom ? '优先使用自定义 Key' : '优先使用免费额度，用完再切换'}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={`cursor-pointer rounded-lg ${!preferCustom ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border/60'}`}
                  onClick={() => { setPrefer(false); setPreferCustom(false); }}
                >
                  免费优先
                </Badge>
                <Badge
                  className={`cursor-pointer rounded-lg ${preferCustom ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border/60'}`}
                  onClick={() => { setPrefer(true); setPreferCustom(true); }}
                >
                  自定义优先
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">自定义 API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">填写自己的 Key 后不限次数使用，Key 仅保存在本地浏览器中。</p>

          <div>
            <Label className="text-muted-foreground tracking-wide text-xs uppercase mb-2 block">选择模型</Label>
            <div className="flex gap-2">
              {PROVIDERS.map((p) => (
                <Badge
                  key={p.value}
                  className={`cursor-pointer rounded-lg flex-1 justify-center py-1.5 ${provider === p.value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border/60'}`}
                  onClick={() => setProvider(p.value)}
                >
                  {p.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground tracking-wide text-xs uppercase mb-2 block">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-2xl" onClick={handleSave}>保存</Button>
            {existing?.apiKey && (
              <Button variant="outline" className="rounded-2xl gap-1" onClick={handleClear}>
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> 清除
              </Button>
            )}
          </div>

          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              还没有 Key？去 <a href={currentProvider?.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{currentProvider?.label} 官网</a> 免费申请
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
