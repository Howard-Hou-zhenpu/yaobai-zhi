import { forwardRef } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * 决策性格报告分享卡片
 * 用于生成可保存的图片
 * 参考原ShareCard的可靠样式配置
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

  // 截取建议文字，避免过长
  const suggestions = report.nextActions?.slice(0, 2).map(action => {
    if (action.length > 30) {
      return action.substring(0, 30) + '...';
    }
    return action;
  }) || [];

  return (
    <div
      ref={ref}
      style={{
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: '#f5f1e8',
        fontFamily: '"LXGW WenKai", serif',
        width: '340px',
      }}
    >
      {/* 顶部标识 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles style={{ width: '18px', height: '18px', color: '#8b7355', strokeWidth: 1.5 }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#3d3428' }}>摇摆志</span>
        </div>
        <span style={{ fontSize: '11px', color: '#a09080' }}>决策性格报告</span>
      </div>

      {/* 主要内容 */}
      <div style={{ backgroundColor: '#ebe7dc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        {/* 决策类型 */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#e8dfd0', padding: '4px 12px', borderRadius: '999px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#8b7355' }}>{report.decisionType}</span>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#6b5d4f',
            lineHeight: 1.6,
            margin: '0',
          }}>
            {report.oneSentenceSummary}
          </p>
        </div>

        {/* 关键数据 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 45%', backgroundColor: 'white', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#3d3428', margin: '0 0 2px 0' }}>{report.stats?.reviewedCount || 0}</p>
            <p style={{ fontSize: '10px', color: '#a09080', margin: '0' }}>已复盘</p>
          </div>
          <div style={{ flex: '1 1 45%', backgroundColor: 'white', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#5a6b4f', margin: '0 0 2px 0' }}>{satisfactionRate}%</p>
            <p style={{ fontSize: '10px', color: '#a09080', margin: '0' }}>满意率</p>
          </div>
          <div style={{ flex: '1 1 45%', backgroundColor: 'white', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#a0522d', margin: '0 0 2px 0' }}>{regretRate}%</p>
            <p style={{ fontSize: '10px', color: '#a09080', margin: '0' }}>后悔率</p>
          </div>
          <div style={{ flex: '1 1 45%', backgroundColor: 'white', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#8b7355', margin: '0 0 2px 0' }}>{topCategory}</p>
            <p style={{ fontSize: '10px', color: '#a09080', margin: '0' }}>最常纠结</p>
          </div>
        </div>

        {/* 核心建议 */}
        {suggestions.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#3d3428', margin: '0 0 6px 0' }}>下次决策建议</p>
            {suggestions.map((action, index) => (
              <div key={index} style={{ display: 'flex', gap: '4px', marginBottom: index < suggestions.length - 1 ? '4px' : '0' }}>
                <span style={{ color: '#8b7355', fontSize: '11px' }}>•</span>
                <p style={{
                  fontSize: '11px',
                  color: '#6b5d4f',
                  lineHeight: 1.5,
                  margin: '0',
                  flex: 1,
                }}>{action}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部文案 */}
      <div style={{ borderTop: '1px solid #d4cbb8', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#8b7355' }}>来自「摇摆志」</span>
        <span style={{ fontSize: '10px', color: '#a09080' }}>记录每一次选择 成就更好的决策</span>
      </div>
    </div>
  );
});

ReportShareCard.displayName = 'ReportShareCard';

export default ReportShareCard;
