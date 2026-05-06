import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle2, AlertCircle, LayoutList, Columns2, Pencil, Square, CheckSquare, Star, MessageSquarePlus, RotateCcw, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useDecision, useUpdateDecision, useDeleteDecision } from '../hooks/useDecisions';
import { STATUS_MAP, SATISFACTION_MAP } from '../lib/constants';
import { getReviewGuide, getCompletionFeedback } from '../lib/prompts';
import Timeline from '../components/Timeline';
import UniversalShareModal from '../components/UniversalShareModal';
import AIInsights from '../components/AIInsights';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

function parseSelected(str) {
  if (!str) return [];
  return str.split(',').filter(Boolean);
}

export default function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: decision } = useDecision(id);
  const updateDecision = useUpdateDecision();
  const deleteMutation = useDeleteDecision();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [confidence, setConfidence] = useState(3);
  const [satisfaction, setSatisfaction] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editing, setEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);
  const [reviewGuide] = useState(getReviewGuide);

  if (!decision) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">决策不存在</p>
      </div>
    );
  }

  const status = STATUS_MAP[decision.status];
  const savedSelections = parseSelected(decision.selectedOption);

  const toggleOption = (name) => {
    if (decision.status !== 'active') return;
    setSelectedOptions((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleComplete = () => {
    if (selectedOptions.length === 0) { toast.error('请至少选择一个选项'); return; }
    updateDecision.mutate(
      {
        id,
        updates: {
          status: 'completed',
          selectedOption: selectedOptions.join(','),
          confidence,
          completedAt: new Date().toISOString(),
        },
      },
      { onSuccess: () => toast.success('决策已完成') }
    );
  };

  const handleReview = () => {
    if (!satisfaction) { toast.error('请选择满意度'); return; }
    updateDecision.mutate(
      {
        id,
        updates: {
          status: 'reviewed',
          satisfaction,
          review: reviewText.trim(),
          reviewedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success('复盘已保存', { description: getCompletionFeedback() });
          setEditing(false);
        },
      }
    );
  };

  const startEditReview = () => {
    setSatisfaction(decision.satisfaction || '');
    setReviewText(decision.review || '');
    setEditing(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, { onSuccess: () => { toast.success('已删除'); navigate('/'); } });
  };

  const toggleFavorite = () => {
    updateDecision.mutate(
      { id, updates: { isFavorite: !decision.isFavorite } },
      { onSuccess: () => toast.success(decision.isFavorite ? '已取消收藏' : '已收藏这条复盘') }
    );
  };

  const handleSaveNotes = () => {
    updateDecision.mutate(
      { id, updates: { notes: notesText.trim() } },
      { onSuccess: () => toast.success('备注已保存') }
    );
  };

  const handleReopen = () => {
    updateDecision.mutate(
      {
        id,
        updates: {
          status: 'active',
          satisfaction: '',
          review: '',
          reviewedAt: null,
        },
      },
      { onSuccess: () => toast.success('已重新打开这个决策') }
    );
  };

  const renderOptionCard = (option, index, isCompare) => {
    const isSelected = savedSelections.includes(option.name);
    const isSelecting = decision.status === 'active' && selectedOptions.includes(option.name);
    const padding = isCompare ? 'p-3' : 'p-4';

    return (
      <Card
        key={index}
        className={cn(
          'transition-all duration-200',
          isCompare && 'flex-1 min-w-[150px]',
          isSelected && 'border-[#7a9b6a]/60 bg-[#dde5d4]/40',
          isSelecting && !isSelected && 'border-primary ring-2 ring-primary/30',
          decision.status === 'active' && 'cursor-pointer hover:border-primary/50'
        )}
        onClick={() => toggleOption(option.name)}
      >
        <CardContent className={padding}>
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn('font-medium', isCompare && 'text-sm')}>{option.name}</h3>
            {decision.status === 'active' ? (
              isSelecting
                ? <CheckSquare className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
                : <Square className="w-5 h-5 text-border shrink-0" strokeWidth={1.5} />
            ) : (
              isSelected && <CheckCircle2 className={cn('text-[#5a6b4f] shrink-0', isCompare ? 'w-4 h-4' : 'w-5 h-5')} strokeWidth={1.5} />
            )}
          </div>
          {decision.type === 'deep' && (
            <div className={cn('mt-2 space-y-2 leading-relaxed', isCompare ? 'text-xs' : 'text-sm')}>
              {[
                { label: '优点', value: option.pros, color: 'text-[#5a6b4f]' },
                { label: '缺点', value: option.cons, color: 'text-[#a0522d]' },
                { label: '风险', value: option.risks, color: 'text-[#7a6245]' },
                { label: isCompare ? '最坏' : '最坏结果', value: option.worstCase, color: 'text-[#8b4513]' },
                { label: isCompare ? '应对' : '应对方案', value: option.solution, color: 'text-[#6b5570]' },
              ].map((field) => field.value && (
                <div key={field.label}>
                  <span className={`${field.color} font-medium`}>{field.label}：</span>
                  <span className="text-muted-foreground">{field.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="pb-20 px-5">
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <h1 className="text-lg font-medium truncate">{decision.title}</h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge className={`${status.color} rounded-lg`}>{status.label}</Badge>
          {(decision.status === 'completed' || decision.status === 'reviewed') && (
            <Button variant="ghost" size="icon" onClick={() => setShowShareCard(true)}>
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <Timeline decision={decision} />

      {showDeleteConfirm && (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive" strokeWidth={1.5} />
              <span>确定删除这条决策？</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>删除</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="rounded-lg">{decision.category}</Badge>
            <Badge variant="secondary" className="rounded-lg">{decision.type === 'deep' ? '深度决策' : '快速决策'}</Badge>
            {decision.hesitation > 0 && (
              <span className="text-xs text-muted-foreground">纠结度 {decision.hesitation}/5</span>
            )}
          </div>
          {decision.description && (
            <p className="text-sm text-muted-foreground mt-3leading-relaxed">{decision.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <span>创建于 {new Date(decision.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          {decision.completedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              完成于 {new Date(decision.completedAt).toLocaleString('zh-CN')}
              {decision.confidence > 0 && ` · 信心值 ${decision.confidence}/5`}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-sm font-medium text-muted-foreground tracking-widest uppercase">决策选项</h2>
        <div className="h-px flex-1 bg-border" />
        {decision.type === 'deep' && (
          <div className="flex gap-1">
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="w-7 h-7" onClick={() => setViewMode('list')}>
              <LayoutList className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
            <Button variant={viewMode === 'compare' ? 'secondary' : 'ghost'} size="icon" className="w-7 h-7" onClick={() => setViewMode('compare')}>
              <Columns2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          </div>
        )}
      </div>

      {decision.status === 'active' && selectedOptions.length > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          已选 {selectedOptions.length} 项：{selectedOptions.join('、')}
        </p>
      )}

      {viewMode === 'compare' && decision.type === 'deep' ? (
        <div className="overflow-x-auto mb-5 -mx-1 px-1">
          <div className="flex gap-2" style={{ minWidth: decision.options.length * 160 }}>
            {decision.options.map((option, index) => renderOptionCard(option, index, true))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {decision.options.map((option, index) => renderOptionCard(option, index, false))}
        </div>
      )}

      {decision.status === 'active' && (
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground tracking-wide text-xs uppercase">你对这个选择有多确定？</Label>
            <div className="mt-2">
              <input type="range" min="1" max="5" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>不太确定</span>
                <span className="font-medium text-foreground">{['', '很犹豫', '有点犹豫', '还行', '比较确定', '非常确定'][confidence]}</span>
                <span>非常确定</span>
              </div>
            </div>
          </div>
          <Button className="w-full h-12 text-base rounded-2xl" onClick={handleComplete}>
            <CheckCircle2 className="w-5 h-5 mr-1" strokeWidth={1.5} />
            确认选择 {selectedOptions.length > 0 && `(${selectedOptions.length})`}
          </Button>
        </div>
      )}

      {decision.status === 'completed' && (
        <>
        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="text-base font-medium">复盘总结</CardTitle>
            <div className="mt-2 px-3 py-2 border-l-2 border-primary/30 bg-background/50 rounded-r-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">{reviewGuide}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">满意度评价 *</Label>
              <div className="flex gap-2">
                {Object.entries(SATISFACTION_MAP).map(([key, val]) => (
                  <Button key={key} variant={satisfaction === key ? 'default' : 'outline'} className="flex-1 rounded-xl" onClick={() => setSatisfaction(key)}>
                    <span className={satisfaction === key ? '' : val.color}>{val.emoji}</span> {val.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">经验总结</Label>
              <Textarea placeholder="记录你的反思和教训..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} />
            </div>
            <Button className="w-full rounded-2xl" onClick={handleReview}>保存复盘</Button>
          </CardContent>
        </Card>
        <AIInsights decision={decision} />
        </>
      )}

      {decision.status === 'reviewed' && !editing && (
        <>
        <Card className="mt-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">复盘记录</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className={cn('w-8 h-8', decision.isFavorite ? 'text-[#c9a84c]' : 'text-muted-foreground')} onClick={toggleFavorite}>
                  <Star className="w-4 h-4" strokeWidth={1.5} fill={decision.isFavorite ? 'currentColor' : 'none'} />
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={startEditReview}>
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} /> 修改
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('text-2xl', SATISFACTION_MAP[decision.satisfaction]?.color)}>{SATISFACTION_MAP[decision.satisfaction]?.emoji}</span>
              <span className={cn('font-medium', SATISFACTION_MAP[decision.satisfaction]?.color)}>
                {SATISFACTION_MAP[decision.satisfaction]?.label}
              </span>
            </div>
            {decision.review && <p className="text-sm text-muted-foregroundleading-relaxed">{decision.review}</p>}
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
              复盘于 {new Date(decision.reviewedAt).toLocaleString('zh-CN')}
            </p>
          </CardContent>
        </Card>
        <AIInsights decision={decision} />
        </>
      )}

      {decision.status === 'reviewed' && editing && (
        <Card className="mt-5">
          <CardHeader><CardTitle className="text-base font-medium">修改复盘</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">满意度评价 *</Label>
              <div className="flex gap-2">
                {Object.entries(SATISFACTION_MAP).map(([key, val]) => (
                  <Button key={key} variant={satisfaction === key ? 'default' : 'outline'} className="flex-1 rounded-xl" onClick={() => setSatisfaction(key)}>
                    <span className={satisfaction === key ? '' : val.color}>{val.emoji}</span> {val.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">经验总结</Label>
              <Textarea placeholder="记录你的反思和教训..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setEditing(false)}>取消</Button>
              <Button className="flex-1 rounded-2xl" onClick={handleReview}>保存修改</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(decision.status === 'completed' || decision.status === 'reviewed') && (
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground w-full justify-start" onClick={() => { setShowNotes(!showNotes); if (!notesText) setNotesText(decision.notes || ''); }}>
            <MessageSquarePlus className="w-3.5 h-3.5" strokeWidth={1.5} />
            追加备注
            {showNotes ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            {decision.notes && !showNotes && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1" />}
          </Button>
          {showNotes && (
            <div className="mt-2 space-y-2">
              <Textarea placeholder="后来又想到……" value={notesText} onChange={(e) => setNotesText(e.target.value)} rows={3} />
              <Button size="sm" className="rounded-xl" onClick={handleSaveNotes}>保存备注</Button>
            </div>
          )}
        </div>
      )}

      {decision.status === 'reviewed' && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={handleReopen}>
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            重新打开这个决策
          </Button>
        </div>
      )}

      {showShareCard && <UniversalShareModal type="decision" data={decision} onClose={() => setShowShareCard(false)} />}
    </div>
  );
}