import { useState } from 'react';
import { MessageSquare, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const RATING_OPTIONS = [
  { value: 'helpful', label: '有帮助', color: 'text-[#5a6b4f] border-[#c8d4bb] bg-[#f5f8f0]' },
  { value: 'neutral', label: '一般', color: 'text-[#8b7355] border-[#d4cbb8] bg-[#faf6ef]' },
  { value: 'not_helpful', label: '没帮助', color: 'text-[#a09080] border-border bg-card' },
];

const FEEDBACK_TYPES = [
  { value: 'useful', label: '有用' },
  { value: 'confusing', label: '有点困惑' },
  { value: 'inaccurate', label: '不够准确' },
  { value: 'too_long', label: '太长' },
  { value: 'missing_context', label: '缺少上下文' },
  { value: 'feature_request', label: '功能建议' },
  { value: 'bug', label: '问题反馈' },
  { value: 'other', label: '其他' },
];

export default function FeedbackForm() {
  const [rating, setRating] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inferFeatureFromPath = (hash) => {
    if (hash.includes('/review')) return 'review_center';
    if (hash.includes('/personality-report')) return 'decision_report';
    if (hash.includes('/decision/')) return 'decision_detail';
    if (hash.includes('/create')) return 'quick_log';
    if (hash.includes('/settings')) return 'settings';
    return 'other';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error('请选择一个满意度评分');
      return;
    }

    if (!feedbackType) {
      toast.error('请选择反馈类型');
      return;
    }

    if (message.trim().length < 5) {
      toast.error('反馈内容至少需要 5 个字符');
      return;
    }

    setSubmitting(true);

    try {
      const sourcePage = window.location.hash || '/';
      const feature = inferFeatureFromPath(sourcePage);

      const { error } = await supabase.from('feedback').insert([
        {
          rating,
          feature,
          feedback_type: feedbackType,
          message: message.trim(),
          contact: contact.trim() || null,
          source_page: sourcePage,
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      setRating('');
      setFeedbackType('');
      setMessage('');
      setContact('');
      toast.success('谢谢反馈，这会帮助我继续迭代产品。');

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('提交反馈失败:', error);
      const errorMsg = error?.message || error?.error_description || '未知错误';
      toast.error('提交失败，请稍后再试。', {
        description: errorMsg,
        duration: 8000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-[#dde5d4] bg-[#f5f8f0]">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#5a6b4f]/10 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-[#5a6b4f]" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#3d3428]">反馈已收到</p>
            <p className="text-xs text-[#6b5d4f] mt-0.5">
              谢谢反馈，这会帮助我继续迭代产品。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#8b7355]" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-[#3d3428]">产品反馈</h3>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground tracking-wide uppercase mb-2 block">
              这次使用感觉如何？*
            </Label>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRating(option.value)}
                  className={cn(
                    'flex-1 h-10 rounded-xl border text-xs font-medium transition-all',
                    rating === option.value
                      ? option.color + ' ring-1 ring-primary/40'
                      : 'border-border/60 bg-card text-muted-foreground hover:border-border'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground tracking-wide uppercase mb-2 block">
              反馈类型 *
            </Label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-[#3d3428] focus:outline-none focus:border-primary"
            >
              <option value="">请选择</option>
              {FEEDBACK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground tracking-wide uppercase mb-2 block">
              具体反馈 *
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="告诉我你的想法..."
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {message.length}/500 字符
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground tracking-wide uppercase mb-2 block">
              联系方式（可选）
            </Label>
            <Input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="可选：留下邮箱或联系方式，方便我后续追问"
              maxLength={100}
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={submitting}
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? '提交中…' : '提交反馈'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
