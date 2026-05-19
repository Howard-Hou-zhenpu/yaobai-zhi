import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import {
  useDecision,
  useUpdateDecision,
  useReplaceDecisionOptions,
} from '../hooks/useDecisions';
import { CATEGORIES } from '../lib/constants';
import { toast } from 'sonner';

const EMPTY_OPTION = { name: '', pros: '', cons: '', risks: '', worstCase: '', solution: '' };

export default function EditDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: decision, isLoading } = useDecision(id);
  const updateDecision = useUpdateDecision();
  const replaceOptions = useReplaceDecisionOptions();

  const [type, setType] = useState('quick');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [description, setDescription] = useState('');
  const [hesitation, setHesitation] = useState(0);
  const [options, setOptions] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!decision || hydrated) return;
    setTitle(decision.title || '');
    const presetValues = CATEGORIES.map((c) => c.value);
    const cat = decision.category || '';
    if (cat && cat !== '未分类' && !presetValues.includes(cat)) {
      setShowCustomInput(true);
      setCustomCategory(cat);
      setCategory(cat);
    } else {
      setCategory(cat === '未分类' ? '' : cat);
    }
    setType(decision.type === 'deep' ? 'deep' : 'quick');
    setDescription(decision.description || '');
    setHesitation(Number(decision.hesitation) || 0);
    setOptions(
      Array.isArray(decision.options)
        ? decision.options.map((o) => ({
            name: o?.name || '',
            pros: o?.pros || '',
            cons: o?.cons || '',
            risks: o?.risks || '',
            worstCase: o?.worstCase || '',
            solution: o?.solution || '',
          }))
        : []
    );
    setHydrated(true);
  }, [decision, hydrated]);

  if (isLoading || !decision) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> 载入中…
      </div>
    );
  }

  const isReadonly = decision.status !== 'active';

  const addOption = () => {
    setOptions([...options, { ...EMPTY_OPTION }]);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, field, value) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const upgradeToDeep = () => {
    setType('deep');
    toast.success('已升级为深度决策，记得补充优缺点和风险');
  };

  const handleSave = async () => {
    if (isReadonly) {
      toast.error('当前状态不允许编辑');
      return;
    }
    if (!title.trim()) {
      toast.error('标题不能为空');
      return;
    }

    const cleanOptions = options
      .map((o) => ({
        ...o,
        name: (o.name || '').trim(),
      }))
      .filter((o) => o.name);

    const validNames = new Set(cleanOptions.map((o) => o.name));
    const savedSelected = (decision.selectedOption || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((name) => validNames.has(name));

    try {
      await updateDecision.mutateAsync({
        id,
        updates: {
          title: title.trim(),
          category: (category || '').trim() || '未分类',
          type,
          description: description.trim(),
          hesitation,
          selectedOption: savedSelected.join(','),
        },
      });
      await replaceOptions.mutateAsync({ id, options: cleanOptions });
      toast.success('已保存');
      navigate(`/decision/${id}`);
    } catch (err) {
      toast.error(err?.message || '保存失败');
    }
  };

  const submitting = updateDecision.isPending || replaceOptions.isPending;

  return (
    <div className="pb-20 px-5 max-w-[430px] mx-auto">
      <div className="flex items-center gap-3 py-5">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <h1 className="text-lg font-medium text-[#3d3428]">编辑决策</h1>
      </div>

      {isReadonly && (
        <Card className="mb-5 border-[#d4cbb8] bg-[#faf6ef]">
          <CardContent className="p-3.5 text-xs text-[#8b7355] leading-relaxed">
            这条决策已经完成或复盘，暂不支持在这里修改。如需重新打开，请回到详情页。
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-6">
        <Button
          variant={type === 'quick' ? 'default' : 'outline'}
          className="flex-1 rounded-2xl"
          onClick={() => setType('quick')}
          disabled={isReadonly}
        >
          快速决策
        </Button>
        <Button
          variant={type === 'deep' ? 'default' : 'outline'}
          className="flex-1 rounded-2xl"
          onClick={() => setType('deep')}
          disabled={isReadonly}
        >
          深度决策
        </Button>
      </div>

      {type === 'quick' && !isReadonly && (
        <button
          type="button"
          onClick={upgradeToDeep}
          className="w-full mb-5 flex items-center justify-center gap-1.5 text-xs text-[#a8893a] hover:text-[#8b7355] py-2 rounded-xl border border-dashed border-[#ecdfb5] bg-[#fbf6e6]"
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
          升级为深度决策，补充优缺点和风险
        </button>
      )}

      <div className="space-y-5">
        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">标题 *</Label>
          <Input
            className="mt-2"
            placeholder="例如：是否跳槽到新公司"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isReadonly}
          />
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">分类</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                className={`cursor-pointer transition-all rounded-lg ${
                  category === cat.value && !showCustomInput
                    ? cat.color + ' ring-1 ring-primary/40'
                    : 'bg-card text-muted-foreground border-border/60'
                }`}
                onClick={() => {
                  if (isReadonly) return;
                  setCategory(cat.value);
                  setShowCustomInput(false);
                  setCustomCategory('');
                }}
              >
                {cat.label}
              </Badge>
            ))}
            <Badge
              className={`cursor-pointer transition-all rounded-lg ${
                showCustomInput
                  ? 'bg-[#e8dfd0] text-[#6b5d4f] ring-1 ring-primary/40'
                  : 'bg-card text-muted-foreground border-border/60'
              }`}
              onClick={() => {
                if (isReadonly) return;
                setShowCustomInput(true);
                setCategory(customCategory);
              }}
            >
              + 自定义
            </Badge>
          </div>
          {showCustomInput && (
            <Input
              className="mt-2"
              placeholder="输入自定义分类..."
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value);
                setCategory(e.target.value);
              }}
              disabled={isReadonly}
            />
          )}
          <p className="text-xs text-[#a09080] mt-1.5">留空将保存为「未分类」。</p>
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">描述信息</Label>
          <Textarea
            className="mt-2"
            placeholder="描述一下这个决策的背景..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={isReadonly}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-muted-foreground tracking-wide text-xs uppercase">决策选项</Label>
            <Button variant="ghost" size="sm" onClick={addOption} className="text-primary gap-1" disabled={isReadonly}>
              <Plus className="w-4 h-4" strokeWidth={1.5} /> 添加选项
            </Button>
          </div>
          {options.length === 0 ? (
            <Card className="border-dashed border-[#d4cbb8]">
              <CardContent className="p-4 text-center text-sm text-[#a09080]">
                还没有选项，点上方「添加选项」可以加几个可选方案。
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {options.map((option, index) => (
                <Card key={index}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 tracking-wide">
                        选项 {index + 1}
                      </span>
                      <Input
                        placeholder="选项名称"
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        disabled={isReadonly}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive"
                        onClick={() => removeOption(index)}
                        disabled={isReadonly}
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                    {type === 'deep' && (
                      <div className="space-y-2 pl-16">
                        <Textarea placeholder="优点" value={option.pros} onChange={(e) => updateOption(index, 'pros', e.target.value)} rows={2} disabled={isReadonly} />
                        <Textarea placeholder="缺点" value={option.cons} onChange={(e) => updateOption(index, 'cons', e.target.value)} rows={2} disabled={isReadonly} />
                        <Textarea placeholder="风险" value={option.risks} onChange={(e) => updateOption(index, 'risks', e.target.value)} rows={2} disabled={isReadonly} />
                        <Textarea placeholder="最坏结果" value={option.worstCase} onChange={(e) => updateOption(index, 'worstCase', e.target.value)} rows={2} disabled={isReadonly} />
                        <Textarea placeholder="应对方案" value={option.solution} onChange={(e) => updateOption(index, 'solution', e.target.value)} rows={2} disabled={isReadonly} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <p className="text-xs text-[#a09080] mt-2">没填名称的选项会被自动忽略。</p>
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">纠结程度</Label>
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="5"
              value={hesitation}
              onChange={(e) => setHesitation(Number(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              disabled={isReadonly}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>未设置</span>
              <span className="font-medium text-foreground">
                {['未设置', '很轻松', '有点想法', '有些纠结', '很纠结', '极度纠结'][hesitation] || '未设置'}
              </span>
              <span>纠结</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full mt-8 h-12 text-base rounded-2xl gap-2"
        onClick={handleSave}
        disabled={isReadonly || submitting}
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        保存修改
      </Button>
    </div>
  );
}
