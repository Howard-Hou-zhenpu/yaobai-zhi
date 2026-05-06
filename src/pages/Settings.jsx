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
    <div className="pb-24 px-4 max-w-[430px] mx-auto">
      <div className="flex items-center gap-3 py-5">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[#9AA6A2] hover:text-[#6F7D78]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <h1 className="text-[20px] font-bold text-[#22332F]">AI 设置</h1>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-[14px] font-semibold text-[#6F7D78] tracking-wide">免费额度</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[32px] font-bold text-[#22332F]">{freeRemaining}<span className="text-[15px] text-[#9AA6A2] font-normal"> / 3 次</span></p>
          <p className="text-[13px] text-[#9AA6A2] mt-2">每月重置，使用默认 AI 模型</p>
        </CardContent>
      </Card>

      {existing?.apiKey && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="mb-3">
              <p className="text-[15px] font-semibold text-[#22332F]">优先使用</p>
              <p className="text-[13px] text-[#9AA6A2] mt-1">
                {preferCustom ? '优先使用自定义 Key' : '优先使用免费额度，用完再切换'}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                className={`cursor-pointer rounded-full flex-1 justify-center py-2 text-[13px] font-medium ${!preferCustom ? 'bg-[#4F9D8B] text-white' : 'bg-[#F0F5F3] text-[#6F7D78] border-[#E6EEEA]'}`}
                onClick={() => { setPrefer(false); setPreferCustom(false); }}
              >
                免费优先
              </Badge>
              <Badge
                className={`cursor-pointer rounded-full flex-1 justify-center py-2 text-[13px] font-medium ${preferCustom ? 'bg-[#4F9D8B] text-white' : 'bg-[#F0F5F3] text-[#6F7D78] border-[#E6EEEA]'}`}
                onClick={() => { setPrefer(true); setPreferCustom(true); }}
              >
                自定义优先
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[14px] font-semibold text-[#6F7D78] tracking-wide">自定义 API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[14px] text-[#6F7D78] leading-relaxed">填写自己的 Key 后不限次数使用，Key 仅保存在本地浏览器中。</p>

          <div>
            <Label className="text-[#9AA6A2] tracking-wide text-[11px] uppercase mb-2 block">选择模型</Label>
            <div className="flex gap-2">
              {PROVIDERS.map((p) => (
                <Badge
                  key={p.value}
                  className={`cursor-pointer rounded-full flex-1 justify-center py-2 text-[13px] font-medium ${provider === p.value ? 'bg-[#4F9D8B] text-white' : 'bg-[#F0F5F3] text-[#6F7D78] border-[#E6EEEA]'}`}
                  onClick={() => setProvider(p.value)}
                >
                  {p.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[#9AA6A2] tracking-wide text-[11px] uppercase mb-2 block">API Key</Label>
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
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-[#9AA6A2] hover:text-[#6F7D78]"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-full h-11 font-medium" onClick={handleSave}>保存</Button>
            {existing?.apiKey && (
              <Button variant="destructive" className="rounded-full gap-1.5 h-11 font-medium" onClick={handleClear}>
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> 清除
              </Button>
            )}
          </div>

          <div className="pt-3 border-t border-[#E6EEEA]">
            <p className="text-[13px] text-[#9AA6A2]">
              还没有 Key？去 <a href={currentProvider?.url} target="_blank" rel="noopener noreferrer" className="text-[#4F9D8B] underline">{currentProvider?.label} 官网</a> 免费申请
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
