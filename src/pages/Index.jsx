import { useNavigate } from 'react-router-dom';
import { Plus, Scale, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDecisions } from '../hooks/useDecisions';
import { supabase } from '../lib/supabase';
import { getDailyPrompt } from '../lib/prompts';
import QuickStats from '../components/QuickStats';
import TrendChart from '../components/TrendChart';
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
    <div className="pb-20 px-5">
      <div className="relative py-8">
        <Button variant="ghost" size="icon" onClick={handleLogout} className="absolute top-6 right-0">
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
        </Button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-primary/70" strokeWidth={1.5} />
            <h1 className="text-3xl font-medium tracking-tight">摇摆志</h1>
          </div>
          <p className="text-sm text-muted-foreground">记录每一次选择，成就更好的决策</p>
          <p className="text-xs text-muted-foreground/60 mt-2">「{dailyPrompt}」</p>
        </div>
      </div>

      <QuickStats decisions={decisions} />
      <TrendChart decisions={decisions} />

      <Button
        className="w-full mt-5 h-12 text-base gap-2 rounded-2xl"
        onClick={() => navigate('/create')}
      >
        <Plus className="w-5 h-5" strokeWidth={1.5} />
        开始新的决策
      </Button>

      {recentDecisions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-sm font-medium text-muted-foreground tracking-widest uppercase">最近决策</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {recentDecisions.map((d) => (
              <DecisionCard key={d.id} decision={d} />
            ))}
          </div>
        </div>
      )}

      {decisions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Scale className="w-10 h-10 mx-auto mb-4 opacity-20" strokeWidth={1} />
          <p className="text-sm">每一个选择都值得被认真对待</p>
          <p className="text-xs mt-2 opacity-70">点击上方按钮，开始你的第一次对话</p>
        </div>
      )}
    </div>
  );
}
