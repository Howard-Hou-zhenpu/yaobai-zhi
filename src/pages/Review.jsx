import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Star, Lightbulb, CalendarClock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useDecisions } from '../hooks/useDecisions';
import ReviewChart from '../components/ReviewChart';
import TrendChart from '../components/TrendChart';
import DecisionProfile from '../components/DecisionProfile';
import KeywordCloud from '../components/KeywordCloud';
import DecisionReport from '../components/DecisionReport';
import DecisionCard from '../components/DecisionCard';
import RegretAnalysis from '../components/RegretAnalysis';
import { CATEGORIES, SATISFACTION_MAP } from '../lib/constants';
import { cn } from '../lib/utils';

const STATUS_FILTERS = [
  { value: '', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'reviewed', label: '已复盘' },
];

const TIME_FILTERS = [
  { value: '', label: '不限' },
  { value: '7', label: '近7天' },
  { value: '30', label: '近30天' },
  { value: '90', label: '近3个月' },
];

export default function Review() {
  const navigate = useNavigate();
  const { data: decisions = [] } = useDecisions();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [dueOnly, setDueOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const allCategories = useMemo(() => {
    const preset = CATEGORIES.map((c) => c.value);
    const custom = decisions.map((d) => d.category).filter((c) => !preset.includes(c));
    return [...new Set([...preset, ...custom])];
  }, [decisions]);

  const filtered = decisions.filter((d) => {
    const matchSearch = !search || d.title.includes(search) || d.description?.includes(search) || d.category.includes(search);
    const matchStatus = !statusFilter || d.status === statusFilter;
    const matchCategory = !categoryFilter || d.category === categoryFilter;
    const matchFavorite = !favoriteOnly || d.isFavorite;
    let matchDue = true;
    if (dueOnly) {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      matchDue =
        d.status === 'completed' &&
        !!d.reviewDueAt &&
        new Date(d.reviewDueAt) <= todayEnd;
    }
    let matchTime = true;
    if (timeFilter) {
      const days = parseInt(timeFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      matchTime = new Date(d.createdAt) >= cutoff;
    }
    return matchSearch && matchStatus && matchCategory && matchFavorite && matchDue && matchTime;
  });

  const sortedFiltered = useMemo(() => {
    if (!dueOnly) return filtered;
    return [...filtered].sort(
      (a, b) => new Date(a.reviewDueAt).getTime() - new Date(b.reviewDueAt).getTime()
    );
  }, [filtered, dueOnly]);

  const total = decisions.length;
  const completed = decisions.filter((d) => d.status === 'completed' || d.status === 'reviewed').length;
  const reviewed = decisions.filter((d) => d.status === 'reviewed').length;
  const hasActiveFilters = categoryFilter || timeFilter || favoriteOnly;

  return (
    <div className="pb-24 px-4 max-w-[430px] mx-auto">
      <div className="py-6">
        <h1 className="text-[28px] font-bold text-[#3d3428]">复盘中心</h1>
        <p className="text-[14px] text-[#6b5d4f] mt-1.5">回顾决策，总结经验</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === 'overview' ? 'default' : 'outline'}
          className="flex-1 rounded-full h-10 font-medium"
          onClick={() => setTab('overview')}
        >
          概览
        </Button>
        <Button
          variant={tab === 'principles' ? 'default' : 'outline'}
          className="flex-1 rounded-full h-10 font-medium"
          onClick={() => setTab('principles')}
        >
          我的原则
        </Button>
        <Button
          variant={tab === 'records' ? 'default' : 'outline'}
          className="flex-1 rounded-full h-10 font-medium"
          onClick={() => setTab('records')}
        >
          记录
        </Button>
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <Card><CardContent className="p-4 text-center">
              <p className="text-[28px] font-bold text-[#3d3428]">{total}</p>
              <p className="text-[11px] text-[#a09080] tracking-wide mt-1">总决策</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-[28px] font-bold text-[#5a6b4f]">{completed}</p>
              <p className="text-[11px] text-[#a09080] tracking-wide mt-1">已完成</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-[28px] font-bold text-[#6b5570]">{reviewed}</p>
              <p className="text-[11px] text-[#a09080] tracking-wide mt-1">已复盘</p>
            </CardContent></Card>
          </div>

          <ReviewChart decisions={decisions} />
          <TrendChart decisions={decisions} />
          <RegretAnalysis decisions={decisions} />
          <DecisionProfile decisions={decisions} />
          <KeywordCloud decisions={decisions} />
          <DecisionReport decisions={decisions} />
        </div>
      )}

      {tab === 'principles' && (
        <div className="space-y-3">
          {decisions.filter((d) => d.decisionPrinciple).length === 0 ? (
            <div className="text-center py-12 text-[#a09080]">
              <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">还没有沉淀任何原则</p>
              <p className="text-xs mt-1.5 opacity-70">复盘时写下"给未来自己的提醒"，就会出现在这里</p>
            </div>
          ) : (
            decisions.filter((d) => d.decisionPrinciple).map((d) => (
              <Card
                key={d.id}
                className="cursor-pointer border-[#d4cbb8] bg-[#faf6ef] hover:shadow-[0_4px_16px_rgba(139,115,85,0.12)] transition-all"
                onClick={() => navigate(`/decision/${d.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-[#8b7355] mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#3d3428] leading-relaxed">{d.decisionPrinciple}</p>
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-[#a09080]">
                        <span className="truncate max-w-[140px]">来自「{d.title}」</span>
                        <span className="w-1 h-1 rounded-full bg-[#d4cbb8]" />
                        <span>{d.category}</span>
                        {d.satisfaction && SATISFACTION_MAP[d.satisfaction] && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[#d4cbb8]" />
                            <span className={SATISFACTION_MAP[d.satisfaction].color}>
                              {SATISFACTION_MAP[d.satisfaction].emoji} {SATISFACTION_MAP[d.satisfaction].label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'records' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09080]" strokeWidth={1.5} />
            <Input className="pl-9" placeholder="搜索决策..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {STATUS_FILTERS.map((f) => (
              <Badge
                key={f.value}
                className={`cursor-pointer transition-all rounded-full shrink-0 ${statusFilter === f.value ? 'bg-[#8b7355] text-[#f5f1e8]' : 'bg-[#e8dfd0] text-[#6b5d4f] border-[#d4cbb8]'}`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </Badge>
            ))}
            <Badge
              className={`cursor-pointer transition-all rounded-full gap-1 shrink-0 ${favoriteOnly ? 'bg-[#f0e6c8] text-[#8b7355]' : 'bg-[#e8dfd0] text-[#6b5d4f] border-[#d4cbb8]'}`}
              onClick={() => setFavoriteOnly(!favoriteOnly)}
            >
              <Star className="w-3 h-3" strokeWidth={1.5} fill={favoriteOnly ? 'currentColor' : 'none'} /> 收藏
            </Badge>
            <Badge
              className={`cursor-pointer transition-all rounded-full gap-1 shrink-0 ${dueOnly ? 'bg-[#dde5d4] text-[#5a6b4f] border-[#c8d4bb]' : 'bg-[#e8dfd0] text-[#6b5d4f] border-[#d4cbb8]'}`}
              onClick={() => setDueOnly(!dueOnly)}
            >
              <CalendarClock className="w-3 h-3" strokeWidth={1.5} /> 到期复盘
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs gap-1 shrink-0 ${hasActiveFilters ? 'text-[#8b7355]' : 'text-[#a09080]'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              筛选 {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#4F9D8B]" />}
            </Button>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-[#a09080] tracking-wide uppercase mb-2">分类</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      className={`cursor-pointer rounded-full text-xs ${!categoryFilter ? 'bg-[#8b7355] text-[#f5f1e8]' : 'bg-[#e8dfd0] text-[#6b5d4f] border-[#d4cbb8]'}`}
                      onClick={() => setCategoryFilter('')}
                    >
                      全部
                    </Badge>
                    {allCategories.map((cat) => (
                      <Badge
                        key={cat}
                        className={`cursor-pointer rounded-full text-xs ${categoryFilter === cat ? 'bg-[#8b7355] text-[#f5f1e8]' : 'bg-[#e8dfd0] text-[#6b5d4f] border-[#d4cbb8]'}`}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#a09080] tracking-wide uppercase mb-2">时间范围</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_FILTERS.map((f) => (
                      <Badge
                        key={f.value}
                        className={`cursor-pointer rounded-full text-xs ${timeFilter === f.value ? 'bg-[#8b7355] text-[#f5f1e8]' : 'bg-[#e8dfd0] text-[#6b5d4f] border-[#d4cbb8]'}`}
                        onClick={() => setTimeFilter(f.value)}
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {sortedFiltered.map((d) => (
              <div key={d.id} className="space-y-1.5">
                <DecisionCard decision={d} />
                {dueOnly && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1 text-[#5a6b4f] border-[#c8d4bb] hover:bg-[#f5f8f0]"
                      onClick={() => navigate(`/decision/${d.id}`)}
                    >
                      去复盘
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {sortedFiltered.length === 0 && (
              dueOnly ? (
                <div className="text-center py-12 text-[#a09080]">
                  <CalendarClock className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm leading-relaxed px-6">
                    现在没有到期复盘的决定。<br />
                    做完选择后设置复盘时间，会在这里出现。
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-[#a09080] py-8">没有找到匹配的决策</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
