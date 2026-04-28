import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useDecisions } from '../hooks/useDecisions';
import ReviewChart from '../components/ReviewChart';
import DecisionProfile from '../components/DecisionProfile';
import KeywordCloud from '../components/KeywordCloud';
import DecisionCard from '../components/DecisionCard';
import { CATEGORIES } from '../lib/constants';

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
    <div className="pb-20 px-5">
      <div className="py-6">
        <h1 className="text-xl font-medium">复盘中心</h1>
        <p className="text-sm text-muted-foreground mt-1">回顾决策，总结经验</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-medium">{total}</p>
          <p className="text-[11px] text-muted-foreground tracking-wide">总决策</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-medium text-[#5a6b4f]">{completed}</p>
          <p className="text-[11px] text-muted-foreground tracking-wide">已完成</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-medium text-[#6b5570]">{reviewed}</p>
          <p className="text-[11px] text-muted-foreground tracking-wide">已复盘</p>
        </CardContent></Card>
      </div>

      <ReviewChart decisions={decisions} />
      <DecisionProfile decisions={decisions} />
      <KeywordCloud decisions={decisions} />

      <div className="mt-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input className="pl-9" placeholder="搜索决策..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <Badge
              key={f.value}
              className={`cursor-pointer transition-all rounded-lg ${statusFilter === f.value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border/60'}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Badge>
          ))}
          <Badge
            className={`cursor-pointer transition-all rounded-lg gap-1 ${favoriteOnly ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'bg-card text-muted-foreground border-border/60'}`}
            onClick={() => setFavoriteOnly(!favoriteOnly)}
          >
            <Star className="w-3 h-3" strokeWidth={1.5} fill={favoriteOnly ? 'currentColor' : 'none'} /> 收藏
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-xs gap-1 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            筛选 {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-3 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1.5">分类</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    className={`cursor-pointer rounded-lg text-xs ${!categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border/60'}`}
                    onClick={() => setCategoryFilter('')}
                  >
                    全部
                  </Badge>
                  {allCategories.map((cat) => (
                    <Badge
                      key={cat}
                      className={`cursor-pointer rounded-lg text-xs ${categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border/60'}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1.5">时间范围</p>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_FILTERS.map((f) => (
                    <Badge
                      key={f.value}
                      className={`cursor-pointer rounded-lg text-xs ${timeFilter === f.value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border/60'}`}
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
            <p className="text-center text-sm text-muted-foreground py-8">没有找到匹配的决策</p>
          )}
        </div>
      </div>
    </div>
  );
}
