import { forwardRef } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * 决策性格报告分享卡片
 * 用于生成可保存的图片
 */
const ReportShareCard = forwardRef(({ report }, ref) => {
  if (!report) return null;

  const satisfactionRate = report.stats?.reviewedCount > 0
    ? Math.round((report.stats.satisfiedCount / report.stats.reviewedCount) * 100)
    : 0;
  const regretRate = report.stats?.reviewedCount > 0
    ? Math.round((report.stats.regretCount / report.stats.reviewedCount) * 100)
    : 0;
  const topCategory = report.stats?.topCategories?.[0]?.category || '未知';

  return (
    <div
      ref={ref}
      className="w-[375px] bg-[#e8e3d8] p-6 rounded-[28px] shadow-[0_8px_24px_rgba(61,52,40,0.15)]"
      style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif' }}
    >
      {/* 顶部标识 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#8b7355]" strokeWidth={1.5} />
          <span className="text-[16px] font-bold text-[#3d3428]">摇摆志</span>
        </div>
        <span className="text-[12px] text-[#a09080]">决策性格报告</span>
      </div>

      {/* 主要内容 */}
      <div className="bg-[#f5f1e8] rounded-[20px] p-5 mb-4">
        <div className="text-center mb-4">
          <div className="inline-block bg-[#e8dfd0] px-4 py-1.5 rounded-full mb-3">
            <span className="text-[15px] font-semibold text-[#8b7355]">{report.decisionType}</span>
          </div>
          <p className="text-[14px] text-[#6b5d4f] leading-relaxed px-2">
            {report.oneSentenceSummary}
          </p>
        </div>

        {/* 关键数据 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-[#3d3428]">{report.stats?.reviewedCount || 0}</p>
            <p className="text-[11px] text-[#a09080]">已复盘</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-[#5a6b4f]">{satisfactionRate}%</p>
            <p className="text-[11px] text-[#a09080]">满意率</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-[#a0522d]">{regretRate}%</p>
            <p className="text-[11px] text-[#a09080]">后悔率</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-[13px] font-semibold text-[#8b7355] truncate">{topCategory}</p>
            <p className="text-[11px] text-[#a09080]">最常纠结</p>
          </div>
        </div>

        {/* 核心建议 */}
        {report.nextActions && report.nextActions.length > 0 && (
          <div className="bg-white rounded-xl p-3">
            <p className="text-[12px] font-medium text-[#3d3428] mb-2">下次决策建议</p>
            <div className="space-y-1">
              {report.nextActions.slice(0, 2).map((action, index) => (
                <div key={index} className="flex items-start gap-1.5">
                  <span className="text-[#8b7355] text-[12px] mt-0.5">•</span>
                  <p className="text-[12px] text-[#6b5d4f] leading-relaxed flex-1">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部文案 */}
      <div className="text-center">
        <p className="text-[12px] text-[#a09080]">安静地与自己对话</p>
      </div>
    </div>
  );
});

ReportShareCard.displayName = 'ReportShareCard';

export default ReportShareCard;
