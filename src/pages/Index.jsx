import { useNavigate } from 'react-router-dom';
import { Plus, Scale, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDecisions } from '../hooks/useDecisions';
import { supabase } from '../lib/supabase';
import { getDailyPrompt } from '../lib/prompts';
import QuickStats from '../components/QuickStats';
import DecisionCard from '../components/DecisionCard';

export default function Index() {
  const navigate = useNavigate();
  const { data: decisions = [] } = useDecisions();
  const recentDecisions = decisions.slice(0, 5);
  const dailyPrompt = getDailyPrompt();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="pb-24 px-4 max-w-[430px] mx-auto">
      <div className="relative pt-6 pb-4">
        <Button variant="ghost" size="icon" onClick={handleLogout} className="absolute top-6 right-0 text-[#a09080] hover:text-[#6b5d4f]">
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="hero-gradient rounded-[28px] p-6 mb-6 shadow-[0_8px_24px_rgba(34,51,47,0.04)] border border-[#E6EEEA]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Scale className="w-7 h-7 text-[#8b7355]" strokeWidth={1.5} />
            <h1 className="text-[30px] font-bold tracking-tight text-[#3d3428]">摇摆志</h1>
          </div>
          <p className="text-[15px] text-[#6b5d4f] mb-3">记录每一次选择，成就更好的决策</p>
          <p className="text-[13px] text-[#a09080] leading-relaxed">「{dailyPrompt}」</p>
        </div>
      </div>

      <QuickStats decisions={decisions} />

      <Button
        className="w-full mt-6 h-12 text-[15px] gap-2 rounded-full font-medium"
        onClick={() => navigate('/create')}
      >
        <Plus className="w-5 h-5" strokeWidth={2} />
        开始新的决策
      </Button>

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
    </div>
  );
}
