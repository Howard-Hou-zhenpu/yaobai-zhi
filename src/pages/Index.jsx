import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Scale, LogOut, Hourglass } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDecisions } from '../hooks/useDecisions';
import { supabase } from '../lib/supabase';
import { getDailyPrompt } from '../lib/prompts';
import QuickStats from '../components/QuickStats';
import TodayTodos from '../components/TodayTodos';
import DecisionCard from '../components/DecisionCard';
import QuickCaptureInput from '../components/QuickCaptureInput';
import ModeSelectModal from '../components/ModeSelectModal';
import RecentCompleted from '../components/RecentCompleted';
import { countStale } from '../lib/staleness';

export default function Index() {
  const navigate = useNavigate();
  const { data: decisions = [] } = useDecisions();
  const visibleDecisions = decisions.filter((d) => d.status !== 'archived');
  const recentDecisions = visibleDecisions.slice(0, 5);
  const staleCount = countStale(decisions);
  const dailyPrompt = getDailyPrompt();
  const [showModeModal, setShowModeModal] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleModeSelect = (mode) => {
    setShowModeModal(false);
    if (mode === 'active') navigate('/create');
    else if (mode === 'backfill') navigate('/backfill');
  };

  const goToStale = () => {
    navigate('/review?filter=stale');
  };

  return (
    <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] px-4 max-w-[430px] mx-auto">
      <div className="flex justify-end pt-3 pb-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          aria-label="退出登录"
          className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-[#6b5d4f]"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          退出
        </Button>
      </div>

      <div className="hero-gradient rounded-[28px] p-5 mb-5 shadow-[0_8px_24px_rgba(34,51,47,0.04)] border border-[#E6EEEA]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5 mb-2.5">
            <Scale className="w-6 h-6 text-[#8b7355]" strokeWidth={1.5} />
            <h1 className="text-[26px] font-semibold tracking-tight text-[#3d3428]">摇摆志</h1>
          </div>
          <p className="text-[14px] text-[#6b5d4f] mb-2">记录每一次选择，成就更好的决策</p>
          <p className="text-[12px] text-[#a09080] leading-relaxed">「{dailyPrompt}」</p>
        </div>
      </div>

      <QuickStats decisions={decisions} />

      <Button
        className="w-full mt-5 h-12 text-[15px] gap-2 rounded-full font-medium"
        onClick={() => setShowModeModal(true)}
      >
        <Plus className="w-5 h-5" strokeWidth={2} />
        开始新的决策
      </Button>

      <QuickCaptureInput />

      <div className="mt-6">
        <TodayTodos decisions={decisions} />
      </div>

      <div className="mt-4">
        <RecentCompleted decisions={decisions} />
      </div>

      {staleCount > 0 && (
        <button
          onClick={goToStale}
          className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#e6d49a] bg-[#fbf6e6] text-left hover:bg-[#f7eed3] transition-all"
        >
          <Hourglass className="w-4 h-4 text-[#a8893a] shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#7a6245]">
              {staleCount} 条决策放了一段时间
            </p>
            <p className="text-[11px] text-[#a09080] mt-0.5">整理一下，看看是继续推进还是标记过期</p>
          </div>
        </button>
      )}

      {recentDecisions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#d4cbb8]" />
            <h2 className="text-[13px] font-medium text-[#a09080] tracking-wider">最近决策</h2>
            <div className="h-px flex-1 bg-[#d4cbb8]" />
          </div>
          <div className="space-y-3">
            {recentDecisions.map((d) => (
              <DecisionCard key={d.id} decision={d} />
            ))}
          </div>
        </div>
      )}

      {decisions.length === 0 && (
        <div className="text-center py-16 text-[#a09080]">
          <Scale className="w-10 h-10 mx-auto mb-4 opacity-20" strokeWidth={1} />
          <p className="text-sm">每一个选择都值得被认真对待</p>
          <p className="text-xs mt-2 opacity-70">点击上方按钮，开始你的第一次对话</p>
        </div>
      )}

      {showModeModal && (
        <ModeSelectModal
          onClose={() => setShowModeModal(false)}
          onSelect={handleModeSelect}
        />
      )}
    </div>
  );
}
