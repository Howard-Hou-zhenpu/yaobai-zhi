import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { useAddDecision, useUpdateDecision } from '../hooks/useDecisions';
import { CATEGORIES } from '../lib/constants';
import ReviewTimeModal from '../components/ReviewTimeModal';
import { toast } from 'sonner';

const SATISFACTION_OPTIONS = [
  { value: 'satisfied', label: '满意', emoji: '✦', color: 'bg-[#dde5d4] text-[#5a6b4f] border-[#c8d4bb]' },
  { value: 'neutral', label: '一般', emoji: '◇', color: 'bg-[#e8dfd0] text-[#8b7355] border-[#d4cbb8]' },
  { value: 'regret', label: '后悔', emoji: '✧', color: 'bg-[#e8d5cc] text-[#a0522d] border-[#d4bbab]' },
  { value: 'unsure', label: '还不确定', emoji: '?', color: 'bg-[#ddd8e0] text-[#6b5570] border-[#c8c0d0]' },
];

export default function BackfillDecision() {
  const navigate = useNavigate();
  const addDecision = useAddDecision();
  const updateDecision = useUpdateDecision();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [reason, setReason] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [needsReview, setNeedsReview] = useState(false);

  const [showReviewTimeModal, setShowReviewTimeModal] = useState(false);
  const [pendingDecisionId, setPendingDecisionId] = useState(null);

  const isUnsure = satisfaction === 'unsure';
  const willPromptReview = isUnsure || needsReview;

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('请填写决策标题'); return; }
    if (!category) { toast.error('请选择分类'); return; }
    if (!selectedOption.trim()) { toast.error('请填写最终选择'); return; }
    if (!satisfaction) { toast.error('请选择当前感受'); return; }

    const now = new Date().toISOString();
    const finalSatisfaction = isUnsure ? '' : satisfaction;
    const status = willPromptReview ? 'completed' : 'reviewed';

    const decision = {
      title: title.trim(),
      category,
      type: 'quick',
      description: reason.trim(),
      status,
      selectedOption: selectedOption.trim(),
      satisfaction: finalSatisfaction,
      review: '',
      hesitation: 0,
      confidence: 0,
      notes: '',
      isFavorite: false,
      completedAt: now,
      reviewedAt: status === 'reviewed' ? now : '',
      options: [
        { name: selectedOption.trim(), pros: '', cons: '', risks: '', worstCase: '', solution: '' },
      ],
    };

    addDecision.mutate(decision, {
      onSuccess: (data) => {
        if (willPromptReview && data?.id) {
          setPendingDecisionId(data.id);
          setShowReviewTimeModal(true);
        } else {
          toast.success('已经帮你补记下来了');
          if (data?.id) navigate(`/decision/${data.id}`);
          else navigate('/');
        }
      },
      onError: (err) => toast.error(err?.message || '保存失败'),
    });
  };

  const handleReviewTimeConfirm = (reviewDueAt) => {
    if (!pendingDecisionId) {
      setShowReviewTimeModal(false);
      return;
    }
    if (reviewDueAt) {
      updateDecision.mutate(
        { id: pendingDecisionId, updates: { reviewDueAt } },
        {
          onSuccess: () => {
            toast.success('已记录，到时候记得回来复盘');
            setShowReviewTimeModal(false);
            navigate(`/decision/${pendingDecisionId}`);
          },
          onError: () => {
            toast.success('已经帮你补记下来了');
            setShowReviewTimeModal(false);
            navigate(`/decision/${pendingDecisionId}`);
          },
        }
      );
    } else {
      toast.success('已经帮你补记下来了');
      setShowReviewTimeModal(false);
      navigate(`/decision/${pendingDecisionId}`);
    }
  };

  const submitting = addDecision.isPending || updateDecision.isPending;

  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] px-5 max-w-[430px] mx-auto">
      <div className="flex items-center gap-3 py-5">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Button>
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#5a6b4f]" strokeWidth={1.5} />
          <h1 className="text-lg font-medium text-[#3d3428]">补记一个决定</h1>
        </div>
      </div>

      <Card className="mb-5 border-[#dde5d4] bg-[#f5f8f0]">
        <CardContent className="p-3.5 text-xs text-[#5a6b4f] leading-relaxed">
          已经做过的决定也值得被记下来。简单几句就好，之后想补充再回来。
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">标题 *</Label>
          <Input
            className="mt-2"
            placeholder="例如：当时选了 A 公司"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">分类 *</Label>
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
                setShowCustomInput(true);
                setCategory('');
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
              autoFocus
            />
          )}
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">最终选择 *</Label>
          <Input
            className="mt-2"
            placeholder="例如：去 A 公司"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">当时为什么这么选</Label>
          <Textarea
            className="mt-2"
            placeholder="一两句话说说当时的考虑就行..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label className="text-muted-foreground tracking-wide text-xs uppercase">现在的感受 *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {SATISFACTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSatisfaction(opt.value);
                  if (opt.value === 'unsure') setNeedsReview(false);
                }}
                className={`px-3 py-2.5 rounded-xl border text-sm transition-all ${
                  satisfaction === opt.value
                    ? opt.color + ' ring-1 ring-primary/40'
                    : 'bg-white text-[#6b5d4f] border-[#d4cbb8]'
                }`}
              >
                <span className="mr-1.5">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!isUnsure && satisfaction && (
          <div>
            <Label className="text-muted-foreground tracking-wide text-xs uppercase">是否需要以后再复盘一次</Label>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setNeedsReview(false)}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                  !needsReview
                    ? 'bg-[#8b7355] text-[#f5f1e8] border-[#8b7355]'
                    : 'bg-white text-[#6b5d4f] border-[#d4cbb8]'
                }`}
              >
                不需要
              </button>
              <button
                type="button"
                onClick={() => setNeedsReview(true)}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                  needsReview
                    ? 'bg-[#8b7355] text-[#f5f1e8] border-[#8b7355]'
                    : 'bg-white text-[#6b5d4f] border-[#d4cbb8]'
                }`}
              >
                以后再复盘
              </button>
            </div>
          </div>
        )}

        {willPromptReview && (
          <p className="text-xs text-[#a09080] -mt-2">
            保存后会让你设置一下复盘时间。
          </p>
        )}
      </div>

      <Button
        className="w-full mt-8 h-12 text-base rounded-2xl gap-2"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        保存这次补记
      </Button>

      {showReviewTimeModal && (
        <ReviewTimeModal
          category={category}
          onConfirm={handleReviewTimeConfirm}
          onClose={() => handleReviewTimeConfirm(null)}
        />
      )}
    </div>
  );
}
