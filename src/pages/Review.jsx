import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Star } from 'lucide-react';
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
import { CATEGORIES } from '../lib/constants';
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
  const { data: decisions = [] } = useDecisions();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
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
    let matchTime = true;
    if (timeFilter) {
      const days = parseInt(timeFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      matchTime = new Date(d.createdAt) >= cutoff;
    }
    return matchSearch && matchStatus && matchCategory && matchFavorite && matchTime;
  });

  const total = decisions.length;
  const completed = decisions.filter((d) => d.status === 'completed' || d.status === 'reviewed').length;
  const reviewed = decisions.filter((d) => d.status === 'reviewed').length;
  const hasActiveFilters = categoryFilter || timeFilter || favoriteOnly;

  return (
    <div className="pb-24 px-4 max-w-[430px] mx-auto">
      <div className="py-6">
        <h1 className="text-[28px] font-bold text-[#2F2924]">复盘中心</h1>
        <p className="text-[14px] text-[#7D7168] mt-1.5">回顾决策，总结经验</p>
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
              <p className="text-[28px] font-bold text-[#2F2924]">{total}</p>
              <p className="text-[11px] text-[#A29489] tracking-wide mt-1">总决策</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-[28px] font-bold text-[#5C8F63]">{completed}</p>
              <p className="text-[11px] text-[#A29489] tracking-wide mt-1">已完成</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-[28px] font-bold text-[#7161B8]">{reviewed}</p>
              <p className="text-[11px] text-[#A29489] tracking-wide mt-1">已复盘</p>
            </CardContent></Card>
          </div>

          <ReviewChart decisions={decisions} />
          <TrendChart decisions={decisions} />
          <DecisionProfile decisions={decisions} />
          <KeywordCloud decisions={decisions} />
          <DecisionReport decisions={decisions} />
        </div>
      )}

      {tab === 'records' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A29489]" strokeWidth={1.5} />
            <Input className="pl-9" placeholder="搜索决策..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {STATUS_FILTERS.map((f) => (
              <Badge
                key={f.value}
                className={`cursor-pointer transition-all rounded-full shrink-0 ${statusFilter === f.value ? 'bg-[#D98C5F] text-white' : 'bg-[#F6EFE7] text-[#7D7168] border-[#EFE4D8]'}`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </Badge>
            ))}
            <Badge
              className={`cursor-pointer transition-all rounded-full gap-1 shrink-0 ${favoriteOnly ? 'bg-[#FFF7DF] text-[#B8860B]' : 'bg-[#F6EFE7] text-[#7D7168] border-[#EFE4D8]'}`}
              onClick={() => setFavoriteOnly(!favoriteOnly)}
            >
              <Star className="w-3 h-3" strokeWidth={1.5} fill={favoriteOnly ? 'currentColor' : 'none'} /> 收藏
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs gap-1 shrink-0 ${hasActiveFilters ? 'text-[#D98C5F]' : 'text-[#A29489]'}`}
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
                  <p className="text-xs text-[#A29489] tracking-wide uppercase mb-2">分类</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      className={`cursor-pointer rounded-full text-xs ${!categoryFilter ? 'bg-[#D98C5F] text-white' : 'bg-[#F6EFE7] text-[#7D7168] border-[#EFE4D8]'}`}
                      onClick={() => setCategoryFilter('')}
                    >
                      全部
                    </Badge>
                    {allCategories.map((cat) => (
                      <Badge
                        key={cat}
                        className={`cursor-pointer rounded-full text-xs ${categoryFilter === cat ? 'bg-[#D98C5F] text-white' : 'bg-[#F6EFE7] text-[#7D7168] border-[#EFE4D8]'}`}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#A29489] tracking-wide uppercase mb-2">时间范围</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_FILTERS.map((f) => (
                      <Badge
                        key={f.value}
                        className={`cursor-pointer rounded-full text-xs ${timeFilter === f.value ? 'bg-[#D98C5F] text-white' : 'bg-[#F6EFE7] text-[#7D7168] border-[#EFE4D8]'}`}
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
            {filtered.map((d) => (
              <DecisionCard key={d.id} decision={d} />
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-[#A29489] py-8">没有找到匹配的决策</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
