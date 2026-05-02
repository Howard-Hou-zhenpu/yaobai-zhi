import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/review', label: '复盘', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border/50 z-50">
      <div className="max-w-[375px] mx-auto flex">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                isActive && 'bg-[#e8dfd0]'
              )}>
                <tab.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className="tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
