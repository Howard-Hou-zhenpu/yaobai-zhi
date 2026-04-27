import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { useAddDecision } from '../hooks/useDecisions';
import { CATEGORIES } from '../lib/constants';
import { TEMPLATES } from '../lib/templates';
import { toast } from 'sonner';

export default function CreateDecision() {
  const navigate = useNavigate();
  const addDecision = useAddDecision();
  const [type, setType] = useState('quick');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    { name: '', pros: '', cons: '', risks: '', worstCase: '', solution: '' },
    { name: '', pros: '', cons: '', risks: '', worstCase: '', solution: '' },
  ]);

  const applyTemplate = (tpl) => {
    setTitle(tpl.name);
    setCategory(tpl.category);
    setType(tpl.type);
    setDescription(tpl.description);
    setOptions(tpl.options.map((o) => ({ ...o })));
    setShowTemplates(false);
    setShowCustomInput(false);
    setCustomCategory('');
    toast.success('已应用模板，可以根据实际情况修改');
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
    if (!title.trim()) { toast.error('请输入决策标题'); return; }
    if (!category) { toast.error('请选择分类标签'); return; }
    if (options.some((o) => !o.name.trim())) { toast.error('请填写所有选项名称'); return; }

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
      completedAt: '',
      reviewedAt: '',
    };

    addDecision.mutate(decision, {
      onSuccess: () => {
        toast.success('决策创建成功', {
          description: '做出选择后记得回来复盘，总结经验让下次决策更好',
          duration: 5000,
        });
        navigate('/');
      },
    });
  };

  return (
    <div className="pb-20 px-5">
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <h1 className="text-lg font-medium">创建决策</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-1 rounded-xl" onClick={() => setShowTemplates(!showTemplates)}>
          <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
          模板
        </Button>
      </div>

      {showTemplates && (
        <Card className="mb-5">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground tracking-wide uppercase mb-2">选择模板快速开始</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tpl) => (
                <Button
                  key={tpl.name}
                  variant="outline"
                  className="h-auto py-2 px-3 flex-col items-start text-left rounded-xl"
                  onClick={() => applyTemplate(tpl)}
                >
                  <span className="text-sm font-medium">{tpl.name}</span>
                  <span className="text-[11px] text-muted-foreground">{tpl.category}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-6">
        <Button
          variant={type === 'quick' ? 'default' : 'outline'}
          className="flex-1 rounded-2xl"
          onClick={() => setType('quick')}
        >
          快速决策
        </Button>
        <Button
          variant={type === 'deep' ? 'default' : 'outline'}
          className="flex-1 rounded-2xl"
          onClick={() => setType('deep')}
        >
          深度决策
        </Button>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">决策标题 *</Label>
          <Input className="mt-2" placeholder="例如：是否跳槽到新公司" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">分类标签 *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                className={`cursor-pointer transition-all rounded-lg ${category === cat.value && !showCustomInput ? cat.color + ' ring-1 ring-primary/40' : 'bg-card text-muted-foreground border-border/60'}`}
                onClick={() => { setCategory(cat.value); setShowCustomInput(false); setCustomCategory(''); }}
              >
                {cat.label}
              </Badge>
            ))}
            <Badge
              className={`cursor-pointer transition-all rounded-lg ${showCustomInput ? 'bg-[#e8dfd0] text-[#6b5d4f] ring-1 ring-primary/40' : 'bg-card text-muted-foreground border-border/60'}`}
              onClick={() => { setShowCustomInput(true); setCategory(''); }}
            >
              + 自定义
            </Badge>
          </div>
          {showCustomInput && (
            <Input
              className="mt-2"
              placeholder="输入自定义分类..."
              value={customCategory}
              onChange={(e) => { setCustomCategory(e.target.value); setCategory(e.target.value); }}
              autoFocus
            />
          )}
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">描述信息</Label>
          <Textarea className="mt-2" placeholder="描述一下这个决策的背景..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-muted-foreground tracking-wide text-xs uppercase">决策选项 *</Label>
            <Button variant="ghost" size="sm" onClick={addOption} className="text-primary gap-1">
              <Plus className="w-4 h-4" strokeWidth={1.5} /> 添加选项
            </Button>
          </div>
          <div className="space-y-3">
            {options.map((option, index) => (
              <Card key={index}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 tracking-wide">选项 {index + 1}</span>
                    <Input placeholder="选项名称" value={option.name} onChange={(e) => updateOption(index, 'name', e.target.value)} />
                    {options.length > 2 && (
                      <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => removeOption(index)}>
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    )}
                  </div>
                  {type === 'deep' && (
                    <div className="space-y-2 pl-16">
                      <Textarea placeholder="优点" value={option.pros} onChange={(e) => updateOption(index, 'pros', e.target.value)} rows={2} />
                      <Textarea placeholder="缺点" value={option.cons} onChange={(e) => updateOption(index, 'cons', e.target.value)} rows={2} />
                      <Textarea placeholder="风险" value={option.risks} onChange={(e) => updateOption(index, 'risks', e.target.value)} rows={2} />
                      <Textarea placeholder="最坏结果" value={option.worstCase} onChange={(e) => updateOption(index, 'worstCase', e.target.value)} rows={2} />
                      <Textarea placeholder="应对方案" value={option.solution} onChange={(e) => updateOption(index, 'solution', e.target.value)} rows={2} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full mt-8 h-12 text-base rounded-2xl" onClick={handleSubmit}>
        保存决策
      </Button>
    </div>
  );
}
