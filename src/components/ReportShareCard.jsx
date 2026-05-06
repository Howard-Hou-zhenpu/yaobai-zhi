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
      data-share-card="true"
      style={{
        width: '375px',
        minHeight: '600px',
        backgroundColor: '#e8e3d8',
        padding: '24px',
        borderRadius: '28px',
        boxShadow: '0 8px 24px rgba(61, 52, 40, 0.15)',
        fontFamily: '"LXGW WenKai", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部标识 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#8b7355', strokeWidth: 1.5 }} />
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3d3428' }}>摇摆志</span>
        </div>
        <span style={{ fontSize: '12px', color: '#a09080' }}>决策性格报告</span>
      </div>

      {/* 主要内容 */}
      <div style={{ backgroundColor: '#f5f1e8', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#e8dfd0', padding: '6px 16px', borderRadius: '999px', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#8b7355' }}>{report.decisionType}</span>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#6b5d4f',
            lineHeight: '1.6',
            padding: '0 8px',
            margin: '0',
            wordBreak: 'break-word',
            whiteSpace: 'normal'
          }}>
            {report.oneSentenceSummary}
          </p>
        </div>

        {/* 关键数据 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#3d3428', margin: '0 0 4px 0' }}>{report.stats?.reviewedCount || 0}</p>
            <p style={{ fontSize: '11px', color: '#a09080', margin: '0' }}>已复盘</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#5a6b4f', margin: '0 0 4px 0' }}>{satisfactionRate}%</p>
            <p style={{ fontSize: '11px', color: '#a09080', margin: '0' }}>满意率</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#a0522d', margin: '0 0 4px 0' }}>{regretRate}%</p>
            <p style={{ fontSize: '11px', color: '#a09080', margin: '0' }}>后悔率</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#8b7355',
              margin: '0 0 4px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{topCategory}</p>
            <p style={{ fontSize: '11px', color: '#a09080', margin: '0' }}>最常纠结</p>
          </div>
        </div>

        {/* 核心建议 */}
        {report.nextActions && report.nextActions.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#3d3428', margin: '0 0 8px 0' }}>下次决策建议</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {report.nextActions.slice(0, 2).map((action, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#8b7355', fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>•</span>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b5d4f',
                    lineHeight: '1.5',
                    margin: '0',
                    flex: 1,
                    wordBreak: 'break-word',
                    whiteSpace: 'normal'
                  }}>{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部文案 */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#a09080', margin: '0' }}>安静地与自己对话</p>
      </div>
    </div>
  );
});

ReportShareCard.displayName = 'ReportShareCard';

export default ReportShareCard;
