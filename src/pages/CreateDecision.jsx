import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, FileText, Sparkles, Loader2, ChevronDown, ChevronUp, Zap, Layers, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { useAddDecision } from '../hooks/useDecisions';
import { CATEGORIES } from '../lib/constants';
import { TEMPLATES } from '../lib/templates';
import { generateAnalysisHints } from '../lib/ai';
import { canUseAI } from '../lib/apiKeyStore';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const HESITATION_LABELS = ['', '很轻松', '有点想法', '有些纠结', '很纠结', '极度纠结'];

const CATEGORY_COLOR_MAP = CATEGORIES.reduce((acc, c) => { acc[c.value] = c.color; return acc; }, {});

function SectionTitle({ title, hint, action }) {
  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-[#3d3428]">{title}</h2>
        {action}
      </div>
      {hint && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{hint}</p>}
    </div>
  );
}

function OptionCard({ option, index, type, options, updateOption, removeOption }) {
  const [expanded, setExpanded] = useState(false);
  const hasDeepContent = !!(option.pros || option.cons || option.risks || option.worstCase || option.solution);

  return (
    <Card className="border border-border/60">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground w-12 shrink-0 tracking-wide">选项 {index + 1}</span>
          <Input
            placeholder="比如：留在现公司"
            value={option.name}
            onChange={(e) => updateOption(index, 'name', e.target.value)}
          />
          {options.length > 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground/70 hover:text-destructive w-8 h-8"
              onClick={() => removeOption(index)}
              aria-label="删除选项"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
        {type === 'deep' && (
          <>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-[#8b7355] pl-14 hover:text-[#6b5d4f]"
            >
              {expanded ? <ChevronUp className="w-3 h-3" strokeWidth={1.5} /> : <ChevronDown className="w-3 h-3" strokeWidth={1.5} />}
              {expanded ? '收起' : (hasDeepContent ? '展开已填写的细节' : '展开填写优点 / 缺点 / 风险等')}
            </button>
            {expanded && (
              <div className="space-y-2 pl-14">
                <Textarea placeholder="优点" value={option.pros} onChange={(e) => updateOption(index, 'pros', e.target.value)} rows={2} />
                <Textarea placeholder="缺点" value={option.cons} onChange={(e) => updateOption(index, 'cons', e.target.value)} rows={2} />
                <Textarea placeholder="风险" value={option.risks} onChange={(e) => updateOption(index, 'risks', e.target.value)} rows={2} />
                <Textarea placeholder="最坏结果" value={option.worstCase} onChange={(e) => updateOption(index, 'worstCase', e.target.value)} rows={2} />
                <Textarea placeholder="应对方案" value={option.solution} onChange={(e) => updateOption(index, 'solution', e.target.value)} rows={2} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function CreateDecision() {
  const navigate = useNavigate();
  const addDecision = useAddDecision();
  const [type, setType] = useState('quick');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hesitation, setHesitation] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHints, setAiHints] = useState([]);
  const [description, setDescription] = useState('');
  const [appliedTemplateName, setAppliedTemplateName] = useState('');
  const [options, setOptions] = useState([
    { name: '', pros: '', cons: '', risks: '', worstCase: '', solution: '' },
    { name: '', pros: '', cons: '', risks: '', worstCase: '', solution: '' },
  ]);

  const hasUserContent = !!(
    title.trim() ||
    description.trim() ||
    category ||
    options.some((o) => o.name.trim())
  );

  const applyTemplate = (tpl) => {
    if (hasUserContent && appliedTemplateName !== tpl.name) {
      const ok = window.confirm('套用模板会覆盖当前已填写内容，是否继续？');
      if (!ok) return;
    }
    setTitle(tpl.name);
    setCategory(tpl.category);
    setType(tpl.type);
    setDescription(tpl.description);
    setOptions(tpl.options.map((o) => ({ ...o })));
    setShowTemplates(false);
    setShowCustomInput(false);
    setCustomCategory('');
    setAppliedTemplateName(tpl.name);
    toast.success(`已套用「${tpl.name}」模板，可以继续修改。`);
  };

  const addOption = () => {
    setOptions([...options, { name: '', pros: '', cons: '', risks: '', worstCase: '', solution: '' }]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, field, value) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('先写下这次要决定什么。'); return; }
    if (!category) { toast.error('选一个分类，方便之后回看。'); return; }
    if (options.some((o) => !o.name.trim())) { toast.error('每个选项都需要一个名称。'); return; }

    const decision = {
      title: title.trim(),
      category,
      type,
      description: description.trim(),
      options: options.map((o) => ({ ...o, name: o.name.trim() })),
      status: 'active',
      selectedOption: '',
      satisfaction: '',
      review: '',
      hesitation,
      completedAt: '',
      reviewedAt: '',
    };

    addDecision.mutate(decision, {
      onSuccess: () => {
        toast.success('已保存。', {
          description: '做出选择后记得回来复盘，总结经验让下次决策更好',
          duration: 5000,
        });
        navigate('/');
      },
      onError: (err) => {
        toast.error(err?.message || '保存失败，请稍后再试。');
      },
    });
  };

  return (
    <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] px-5 max-w-[430px] mx-auto">
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <h1 className="text-lg font-medium text-[#3d3428]">创建决策</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1 rounded-xl shrink-0 h-8 px-2.5 text-xs',
            showTemplates
              ? 'text-[#8b7355] bg-[#faf6ef] border border-[#d4cbb8]'
              : 'text-muted-foreground border border-border/50'
          )}
          onClick={() => setShowTemplates(!showTemplates)}
        >
          <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
          {showTemplates ? '收起模板' : '模板'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
        先把这次选择记录下来，之后还可以继续补充。
      </p>

      {showTemplates && TEMPLATES.length > 0 && (
        <div className="mb-5">
          <SectionTitle
            title="从模板开始"
            hint="常见选择可以直接套用模板，之后再修改。"
          />
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((tpl) => {
              const isApplied = appliedTemplateName === tpl.name;
              const catColor = CATEGORY_COLOR_MAP[tpl.category] || 'bg-secondary text-muted-foreground';
              return (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className={cn(
                    'relative text-left rounded-xl border p-3 transition-all bg-card',
                    isApplied
                      ? 'border-[#8b7355] bg-[#faf6ef]'
                      : 'border-border/50 hover:border-[#d4cbb8]'
                  )}
                >
                  {isApplied && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#dde5d4] text-[#5a6b4f] text-[10px]">
                      <Check className="w-2.5 h-2.5" strokeWidth={2} />
                      已套用
                    </span>
                  )}
                  <p className={cn(
                    'text-sm font-medium leading-snug line-clamp-2 break-words',
                    isApplied ? 'text-[#3d3428]' : 'text-[#3d3428]',
                    isApplied && 'pr-14'
                  )}>
                    {tpl.name}
                  </p>
                  <span
                    className={cn(
                      'inline-block mt-2 px-1.5 py-0.5 rounded-md text-[10px] tracking-wide',
                      catColor
                    )}
                  >
                    {tpl.category}
                  </span>
                  {tpl.description && (
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-6">
        <SectionTitle title="决策类型" />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('quick')}
            className={cn(
              'rounded-2xl border p-3 text-left transition-all',
              type === 'quick'
                ? 'border-[#8b7355] bg-[#faf6ef]'
                : 'border-border/50 bg-card hover:border-[#d4cbb8]'
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className={cn('w-3.5 h-3.5', type === 'quick' ? 'text-[#8b7355]' : 'text-muted-foreground')} strokeWidth={1.5} />
              <span className={cn('text-sm font-medium', type === 'quick' ? 'text-[#3d3428]' : 'text-[#6b5d4f]')}>快速决策</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              适合日常小选择，只记录标题、分类和选项。
            </p>
          </button>
          <button
            type="button"
            onClick={() => setType('deep')}
            className={cn(
              'rounded-2xl border p-3 text-left transition-all',
              type === 'deep'
                ? 'border-[#8b7355] bg-[#faf6ef]'
                : 'border-border/50 bg-card hover:border-[#d4cbb8]'
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className={cn('w-3.5 h-3.5', type === 'deep' ? 'text-[#8b7355]' : 'text-muted-foreground')} strokeWidth={1.5} />
              <span className={cn('text-sm font-medium', type === 'deep' ? 'text-[#3d3428]' : 'text-[#6b5d4f]')}>深度决策</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              适合重要选择，可以补充优点、缺点、风险和应对方案。
            </p>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <SectionTitle
          title="这次在纠结什么？"
          hint="先写下标题，背景可以之后再补。"
        />
        <div className="space-y-2.5">
          <Input
            placeholder="比如：要不要跳槽？"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="简单写下背景、目标或你现在的顾虑。"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="mb-6">
        <SectionTitle
          title="选择分类"
          hint="方便之后在复盘中心看到不同领域的决策模式。"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.value}
              className={cn(
                'cursor-pointer transition-all rounded-lg',
                category === cat.value && !showCustomInput
                  ? cat.color + ' ring-1 ring-primary/40'
                  : 'bg-card text-muted-foreground border-border/60'
              )}
              onClick={() => { setCategory(cat.value); setShowCustomInput(false); setCustomCategory(''); }}
            >
              {cat.label}
            </Badge>
          ))}
          <Badge
            className={cn(
              'cursor-pointer transition-all rounded-lg',
              showCustomInput
                ? 'bg-[#e8dfd0] text-[#6b5d4f] ring-1 ring-primary/40'
                : 'bg-card text-muted-foreground/70 border-dashed border-border/60'
            )}
            onClick={() => { setShowCustomInput(true); setCategory(''); }}
          >
            + 自定义
          </Badge>
        </div>
        {showCustomInput && (
          <Input
            className="mt-2.5"
            placeholder="输入自定义分类..."
            value={customCategory}
            onChange={(e) => { setCustomCategory(e.target.value); setCategory(e.target.value); }}
            autoFocus
          />
        )}
      </div>

      <div className="mb-6">
        <SectionTitle
          title="候选选项"
          hint={type === 'deep' ? '先列出几个可能的选择，可以展开补充优缺点和风险。' : '先列出几个可能的选择，之后还可以继续编辑。'}
        />
        <div className="space-y-2.5">
          {options.map((option, index) => (
            <OptionCard
              key={index}
              option={option}
              index={index}
              type={type}
              options={options}
              updateOption={updateOption}
              removeOption={removeOption}
            />
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full mt-2.5 rounded-xl gap-1 text-[#8b7355] border-dashed border-[#d4cbb8] h-10"
          onClick={addOption}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          添加选项
        </Button>

        {canUseAI() && options.some((o) => o.name.trim()) && (
          <Button
            variant="outline"
            className="w-full mt-2 rounded-2xl gap-2 text-sm h-10"
            onClick={async () => {
              if (!title.trim()) { toast.error('请先填写决策标题'); return; }
              setAiLoading(true);
              try {
                const hints = await generateAnalysisHints(title, description, options);
                setAiHints(hints);
                if (type === 'deep') {
                  const updated = options.map((o, i) => {
                    const h = hints[i];
                    if (!h) return o;
                    return {
                      ...o,
                      pros: o.pros || h.pros || '',
                      cons: o.cons || h.cons || '',
                      risks: o.risks || h.risks || '',
                    };
                  });
                  setOptions(updated);
                }
                toast.success('AI 分析完成');
              } catch (err) {
                toast.error(err.message || 'AI 调用失败');
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading}
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#c9a84c]" strokeWidth={1.5} />}
            {aiLoading ? 'AI 正在分析...' : 'AI 帮我分析各选项'}
          </Button>
        )}
        {aiHints.length > 0 && (
          <Card className="mt-3 bounce-in">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#c9a84c]" strokeWidth={1.5} />
                <span className="text-xs font-medium text-muted-foreground">AI 分析建议{type === 'deep' ? '（已填入下方）' : ''}</span>
              </div>
              <div className="space-y-2">
                {aiHints.map((h, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium mb-0.5">{h.name}</p>
                    {h.pros && <p className="text-xs text-[#5a6b4f]">优点：{h.pros}</p>}
                    {h.cons && <p className="text-xs text-[#a0522d]">缺点：{h.cons}</p>}
                    {h.risks && <p className="text-xs text-[#7a6245]">风险：{h.risks}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mb-8">
        <SectionTitle
          title="纠结程度"
          hint="记录你现在有多纠结，没有对错。"
        />
        <input
          type="range"
          min="1"
          max="5"
          value={hesitation}
          onChange={(e) => setHesitation(Number(e.target.value))}
          className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
          <span>轻松</span>
          <span className="font-medium text-foreground px-2">{HESITATION_LABELS[hesitation]}</span>
          <span>很纠结</span>
        </div>
      </div>

      <Button
        className="w-full h-12 text-base rounded-2xl"
        onClick={handleSubmit}
        disabled={addDecision.isPending}
      >
        {addDecision.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
            保存中…
          </>
        ) : (
          '保存决策'
        )}
      </Button>
    </div>
  );
}
