import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle2, AlertCircle, LayoutList, Columns2, Pencil, Square, CheckSquare, Star, MessageSquarePlus, RotateCcw, ChevronDown, ChevronUp, Share2, CalendarClock, Lightbulb, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useDecision, useUpdateDecision, useDeleteDecision } from '../hooks/useDecisions';
import { STATUS_MAP, SATISFACTION_MAP, REGRET_REASONS } from '../lib/constants';
import { getReviewGuide, getCompletionFeedback } from '../lib/prompts';
import Timeline from '../components/Timeline';
import ShareCard from '../components/ShareCard';
import ReviewTimeModal from '../components/ReviewTimeModal';
import ReviewCompletedModal from '../components/ReviewCompletedModal';
import AIInsights from '../components/AIInsights';
import NextActionHint from '../components/NextActionHint';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

function parseSelected(str, validNames) {
  if (!str) return [];
  const list = String(str).split(',').map((s) => s.trim()).filter(Boolean);
  if (!validNames || validNames.length === 0) return [];
  const set = new Set(validNames);
  return list.filter((n) => set.has(n));
}

function parseRegretReasons(str) {
  if (!str) return [];
  return String(str).split(',').map((s) => s.trim()).filter(Boolean);
}

function isQuickDraft(decision) {
  if (!decision || decision.status !== 'active') return false;
  const hasNamedOptions =
    Array.isArray(decision.options) &&
    decision.options.some((o) => o && typeof o.name === 'string' && o.name.trim());
  const hasDescription = !!(decision.description || '').trim();
  return decision.type === 'quick' && !hasNamedOptions && !hasDescription;
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
  const [showReviewTimeModal, setShowReviewTimeModal] = useState(false);
  const [reviewTimeMode, setReviewTimeMode] = useState('complete');
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [savingPrinciple, setSavingPrinciple] = useState(false);
  const [principleText, setPrincipleText] = useState('');
  const [regretReasons, setRegretReasons] = useState([]);
  const [reviewGuide] = useState(getReviewGuide);

  if (!decision) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">决策不存在</p>
      </div>
    );
  }

  const status = STATUS_MAP[decision.status];
  const optionsList = Array.isArray(decision.options) ? decision.options : [];
  const validOptionNames = optionsList
    .map((o) => o && typeof o.name === 'string' ? o.name.trim() : '')
    .filter(Boolean);
  const savedSelections = parseSelected(decision.selectedOption, validOptionNames);
  const draftMode = isQuickDraft(decision);

  const toggleOption = (name) => {
    if (decision.status !== 'active') return;
    setSelectedOptions((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleRegretReason = (reason) => {
    setRegretReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleComplete = () => {
    if (validOptionNames.length === 0) { toast.error('请先添加选项'); return; }
    if (selectedOptions.length === 0) { toast.error('请至少选择一个选项'); return; }
    setReviewTimeMode('complete');
    setShowReviewTimeModal(true);
  };

  const handleReviewTimeConfirm = (reviewDueAt) => {
    setShowReviewTimeModal(false);
    if (reviewTimeMode === 'updateOnly') {
      if (!reviewDueAt) return;
      updateDecision.mutate(
        { id, updates: { reviewDueAt } },
        { onSuccess: () => toast.success('复盘时间已设置') }
      );
      return;
    }
    updateDecision.mutate(
      {
        id,
        updates: {
          status: 'completed',
          selectedOption: selectedOptions.join(','),
          confidence,
          completedAt: new Date().toISOString(),
          reviewDueAt,
        },
      },
      { onSuccess: () => toast.success('决策已完成') }
    );
  };

  const handleNextAction = (action) => {
    if (action.type === 'set_review_time') {
      setReviewTimeMode('updateOnly');
      setShowReviewTimeModal(true);
      return;
    }
    if (action.type === 'add_options') {
      navigate(`/decision/${id}/edit`);
      return;
    }
    if (action.type === 'make_choice') {
      const el = document.getElementById('decision-options-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else toast(action.label);
      return;
    }
    if (action.type === 'review_due') {
      const el = document.getElementById('review-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else toast(action.label);
    }
  };

  const handleReview = () => {
    if (!satisfaction) { toast.error('请选择满意度'); return; }
    const finalRegret = satisfaction === 'regret' ? regretReasons.join(',') : '';
    const wasEditing = editing;
    updateDecision.mutate(
      {
        id,
        updates: {
          status: 'reviewed',
          satisfaction,
          review: reviewText.trim(),
          decisionPrinciple: principleText.trim(),
          regretReasons: finalRegret,
          reviewedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success('复盘已保存', { description: getCompletionFeedback() });
          setEditing(false);
          if (!wasEditing) setShowCompletedModal(true);
        },
      }
    );
  };

  const handleSavePrincipleFromModal = (text) => {
    setSavingPrinciple(true);
    updateDecision.mutate(
      { id, updates: { decisionPrinciple: text } },
      {
        onSuccess: () => {
          toast.success('已保存为个人原则');
          setPrincipleText(text);
          setSavingPrinciple(false);
        },
        onError: () => setSavingPrinciple(false),
      }
    );
  };

  const handleShareFromModal = () => {
    setShowCompletedModal(false);
    setShowShareCard(true);
  };

  const startEditReview = () => {
    setSatisfaction(decision.satisfaction || '');
    setReviewText(decision.review || '');
    setPrincipleText(decision.decisionPrinciple || '');
    setRegretReasons(parseRegretReasons(decision.regretReasons));
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
          regretReasons: '',
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
          {decision.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-[#8b7355]"
              onClick={() => navigate(`/decision/${id}/edit`)}
              title="编辑"
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          )}
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
            <Badge variant="outline" className="rounded-lg">{decision.category || '未分类'}</Badge>
            <Badge variant="secondary" className="rounded-lg">{decision.type === 'deep' ? '深度决策' : '快速决策'}</Badge>
            {decision.hesitation > 0 && (
              <span className="text-xs text-muted-foreground">纠结度 {decision.hesitation}/5</span>
            )}
          </div>
          {decision.description ? (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{decision.description}</p>
          ) : decision.status === 'active' ? (
            <button
              type="button"
              onClick={() => navigate(`/decision/${id}/edit`)}
              className="mt-3 text-sm text-[#a09080] italic hover:text-[#6b5d4f] text-left"
            >
              还没有补充背景，可以之后再写。
            </button>
          ) : null}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <span>创建于 {new Date(decision.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          {decision.completedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              完成于 {new Date(decision.completedAt).toLocaleString('zh-CN')}
              {decision.confidence > 0 && ` · 信心值 ${decision.confidence}/5`}
            </p>
          )}
          {decision.reviewDueAt && (
            <p className="text-xs mt-1 flex items-center gap-1 text-[#8b7355]">
              <CalendarClock className="w-3 h-3" strokeWidth={1.5} />
              预计复盘：{new Date(decision.reviewDueAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </CardContent>
      </Card>

      {draftMode && (
        <Card className="mb-4 border-[#dde5d4] bg-[#f5f8f0]">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#5a6b4f] leading-relaxed flex-1">
              这条决策是先记下来的，你可以继续补充分类、描述、选项和复盘时间。
            </p>
            <Button
              size="sm"
              className="rounded-xl shrink-0"
              onClick={() => navigate(`/decision/${id}/edit`)}
            >
              继续补全
            </Button>
          </CardContent>
        </Card>
      )}

      <NextActionHint decision={decision} onAction={handleNextAction} />

      <div className="flex items-center gap-3 mb-4" id="decision-options-section">
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

      {decision.status === 'active' && validOptionNames.length > 0 && selectedOptions.length > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          已选 {selectedOptions.length} 项：{selectedOptions.join('、')}
        </p>
      )}

      {validOptionNames.length === 0 ? (
        <Card className="mb-5 border-dashed border-[#d4cbb8]">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm text-[#a09080]">还没有选项，可以先添加几个可选方案。</p>
            {decision.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-1"
                onClick={() => navigate(`/decision/${id}/edit`)}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                添加选项
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'compare' && decision.type === 'deep' ? (
        <div className="overflow-x-auto mb-5 -mx-1 px-1">
          <div className="flex gap-2" style={{ minWidth: optionsList.length * 160 }}>
            {optionsList.map((option, index) => renderOptionCard(option, index, true))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {optionsList.map((option, index) => renderOptionCard(option, index, false))}
        </div>
      )}

      {decision.status === 'active' && validOptionNames.length > 0 && (
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
        <Card className="mt-5" id="review-form-section">
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
            {satisfaction === 'regret' && (
              <div className="rounded-xl border border-[#e5d5c8] bg-[#faf2eb] p-3.5">
                <Label className="mb-1 block text-[#a0522d] tracking-wide text-xs uppercase">这次后悔，可能因为……</Label>
                <p className="text-[11px] text-[#a09080] mb-2.5 leading-relaxed">不是责怪自己，只是看清楚发生了什么，下次会更清晰。可以多选。</p>
                <div className="flex flex-wrap gap-1.5">
                  {REGRET_REASONS.map((reason) => {
                    const active = regretReasons.includes(reason);
                    return (
                      <Badge
                        key={reason}
                        className={cn(
                          'cursor-pointer rounded-lg text-xs transition-all',
                          active
                            ? 'bg-[#a0522d] text-[#faf2eb] border-[#a0522d]'
                            : 'bg-card text-[#7a6245] border-[#d4cbb8]'
                        )}
                        onClick={() => toggleRegretReason(reason)}
                      >
                        {reason}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">经验总结</Label>
              <Textarea placeholder="记录你的反思和教训..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} />
            </div>
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">写给未来自己的提醒</Label>
              <Textarea placeholder="下次遇到类似选择时，我要提醒自己……" value={principleText} onChange={(e) => setPrincipleText(e.target.value)} rows={2} />
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
            {decision.satisfaction === 'regret' && parseRegretReasons(decision.regretReasons).length > 0 && (
              <div className="mb-3 rounded-xl border border-[#e5d5c8] bg-[#faf2eb] p-3">
                <p className="text-[11px] text-[#a0522d] tracking-wide uppercase mb-2">后悔原因</p>
                <div className="flex flex-wrap gap-1.5">
                  {parseRegretReasons(decision.regretReasons).map((reason) => (
                    <Badge key={reason} className="rounded-lg text-xs bg-[#f3e2d4] text-[#7a4a2d] border-[#e5d5c8]">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {decision.review && <p className="text-sm text-muted-foregroundleading-relaxed">{decision.review}</p>}
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
              复盘于 {new Date(decision.reviewedAt).toLocaleString('zh-CN')}
            </p>
          </CardContent>
        </Card>
        {decision.decisionPrinciple && (
          <Card className="mt-3 border-[#d4cbb8] bg-[#faf6ef]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-[#8b7355]" strokeWidth={1.5} />
                <span className="text-sm font-medium text-[#6b5d4f]">这次学到的原则</span>
              </div>
              <p className="text-sm text-[#3d3428] leading-relaxed pl-6">{decision.decisionPrinciple}</p>
            </CardContent>
          </Card>
        )}
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
            {satisfaction === 'regret' && (
              <div className="rounded-xl border border-[#e5d5c8] bg-[#faf2eb] p-3.5">
                <Label className="mb-1 block text-[#a0522d] tracking-wide text-xs uppercase">这次后悔，可能因为……</Label>
                <p className="text-[11px] text-[#a09080] mb-2.5 leading-relaxed">不是责怪自己，只是看清楚发生了什么，下次会更清晰。可以多选。</p>
                <div className="flex flex-wrap gap-1.5">
                  {REGRET_REASONS.map((reason) => {
                    const active = regretReasons.includes(reason);
                    return (
                      <Badge
                        key={reason}
                        className={cn(
                          'cursor-pointer rounded-lg text-xs transition-all',
                          active
                            ? 'bg-[#a0522d] text-[#faf2eb] border-[#a0522d]'
                            : 'bg-card text-[#7a6245] border-[#d4cbb8]'
                        )}
                        onClick={() => toggleRegretReason(reason)}
                      >
                        {reason}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">经验总结</Label>
              <Textarea placeholder="记录你的反思和教训..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} />
            </div>
            <div>
              <Label className="mb-2 block text-muted-foreground tracking-wide text-xs uppercase">写给未来自己的提醒</Label>
              <Textarea placeholder="下次遇到类似选择时，我要提醒自己……" value={principleText} onChange={(e) => setPrincipleText(e.target.value)} rows={2} />
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

      {showShareCard && <ShareCard decision={decision} onClose={() => setShowShareCard(false)} />}
      {showReviewTimeModal && (
        <ReviewTimeModal
          category={decision.category}
          onConfirm={handleReviewTimeConfirm}
          onClose={() => setShowReviewTimeModal(false)}
        />
      )}
      {showCompletedModal && (
        <ReviewCompletedModal
          hasPrinciple={!!(decision.decisionPrinciple || '').trim()}
          isFavorite={!!decision.isFavorite}
          saving={savingPrinciple}
          onSavePrinciple={handleSavePrincipleFromModal}
          onToggleFavorite={toggleFavorite}
          onShare={handleShareFromModal}
          onClose={() => setShowCompletedModal(false)}
        />
      )}
    </div>
  );
}