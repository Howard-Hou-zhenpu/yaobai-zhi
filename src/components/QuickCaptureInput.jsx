import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PencilLine } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAddDecision } from '../hooks/useDecisions';
import { toast } from 'sonner';

export default function QuickCaptureInput() {
  const navigate = useNavigate();
  const addDecision = useAddDecision();
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast('先写一句让你纠结的事吧～');
      return;
    }

    const draft = {
      title: trimmed,
      category: '未分类',
      type: 'quick',
      description: '',
      status: 'active',
      selectedOption: '',
      satisfaction: '',
      review: '',
      hesitation: 0,
      confidence: 0,
      notes: '',
      isFavorite: false,
      completedAt: '',
      reviewedAt: '',
      options: [],
    };

    addDecision.mutate(draft, {
      onSuccess: (data) => {
        setText('');
        toast.success('已经先帮你记下来了，可以继续补全分类、选项和思考过程。');
        if (data?.id) navigate(`/decision/${data.id}`);
      },
      onError: (err) => {
        toast.error(err?.message || '保存失败，请稍后再试');
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!addDecision.isPending) handleSubmit();
    }
  };

  return (
    <div className="mt-3 rounded-2xl bg-[#faf6ef] border border-[#e8dfd0] p-3">
      <div className="flex items-center gap-2">
        <PencilLine className="w-4 h-4 text-[#a09080] shrink-0 ml-0.5" strokeWidth={1.5} />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="现在有什么选择让你纠结？"
          className="flex-1 h-9 bg-transparent border-none shadow-none px-1 text-sm placeholder:text-[#b5a896] focus-visible:ring-0"
          maxLength={80}
        />
        <Button
          size="sm"
          className="rounded-full shrink-0 h-9 px-4 gap-1"
          onClick={handleSubmit}
          disabled={addDecision.isPending}
        >
          {addDecision.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          先记下
        </Button>
      </div>
      <p className="text-[11px] text-[#a09080] mt-1.5 ml-6 leading-relaxed">
        先记一句也可以，之后再慢慢补全分类、选项和思考过程。
      </p>
    </div>
  );
}
