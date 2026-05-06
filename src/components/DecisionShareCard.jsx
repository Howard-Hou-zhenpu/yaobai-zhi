import { forwardRef } from 'react';
import { Scale } from 'lucide-react';

/**
 * 单次决策复盘分享卡片
 * 用于生成可保存的图片
 */
const DecisionShareCard = forwardRef(({ decision, sanitized = false }, ref) => {
  if (!decision) return null;

  const satisfactionLabel = decision.satisfaction === 'satisfied' ? '满意' :
                           decision.satisfaction === 'neutral' ? '一般' :
                           decision.satisfaction === 'regret' ? '后悔' : '未复盘';

  const satisfactionColor = decision.satisfaction === 'satisfied' ? '#5a6b4f' :
                            decision.satisfaction === 'neutral' ? '#8b7355' :
                            decision.satisfaction === 'regret' ? '#a0522d' : '#a09080';

  // 截取描述和复盘总结
  const shortDescription = decision.description && decision.description.length > 60
    ? decision.description.substring(0, 60) + '...'
    : decision.description;

  const shortReview = decision.review && decision.review.length > 100
    ? decision.review.substring(0, 100) + '...'
    : decision.review;

  return (
    <div
      ref={ref}
      data-share-card="true"
      style={{
        width: '375px',
        minHeight: '500px',
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
          <Scale style={{ width: '20px', height: '20px', color: '#8b7355', strokeWidth: 1.5 }} />
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3d3428' }}>摇摆志</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#a09080' }}>{decision.category}</span>
          <span style={{ fontSize: '12px', color: satisfactionColor, fontWeight: '600' }}>{satisfactionLabel}</span>
        </div>
      </div>

      {/* 主要内容 */}
      <div style={{ backgroundColor: '#f5f1e8', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
        {/* 决策标题 */}
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#3d3428',
          marginBottom: '12px',
          lineHeight: '1.4',
          wordBreak: 'break-word',
          whiteSpace: 'normal'
        }}>
          {decision.title}
        </h2>

        {/* 描述 */}
        {shortDescription && (
          <p style={{
            fontSize: '13px',
            color: '#6b5d4f',
            lineHeight: '1.6',
            marginBottom: '16px',
            wordBreak: 'break-word',
            whiteSpace: 'normal'
          }}>
            {shortDescription}
          </p>
        )}

        {/* 数据指标 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#a09080', margin: '0 0 4px 0' }}>纠结度</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#3d3428', margin: '0' }}>{decision.hesitation || 0}/5</p>
          </div>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#a09080', margin: '0 0 4px 0' }}>信心值</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#3d3428', margin: '0' }}>{decision.confidence || 0}/5</p>
          </div>
        </div>

        {/* 复盘总结 */}
        {shortReview && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#3d3428', margin: '0 0 6px 0' }}>复盘总结</p>
            <p style={{
              fontSize: '12px',
              color: '#6b5d4f',
              lineHeight: '1.5',
              margin: '0',
              wordBreak: 'break-word',
              whiteSpace: 'normal'
            }}>
              {shortReview}
            </p>
          </div>
        )}
      </div>

      {/* 底部文案 */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#a09080', margin: '0' }}>记录每一次选择，成就更好的决策</p>
      </div>
    </div>
  );
});

DecisionShareCard.displayName = 'DecisionShareCard';

export default DecisionShareCard;
