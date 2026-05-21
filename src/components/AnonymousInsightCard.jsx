import { SATISFACTION_MAP } from '../lib/constants';

/**
 * 匿名洞察分享卡片（导出图片用）
 * 只展示：分类、满意度、决策原则、产品标语
 * 固定 760px 宽度，inline 样式，不暴露具体决策内容
 */
export default function AnonymousInsightCard({ decision }) {
  const satisfaction = SATISFACTION_MAP[decision.satisfaction];
  const principle = (decision.decisionPrinciple || '').trim();

  return (
    <div
      style={{
        width: '760px',
        backgroundColor: '#f4efe6',
        padding: '56px 48px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      }}
    >
      {/* 顶部 meta：分类 + 满意度 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '40px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '24px',
            color: '#8b7a5d',
            backgroundColor: '#e8dfd0',
            padding: '8px 20px',
            borderRadius: '12px',
            fontWeight: 500,
          }}
        >
          {decision.category || '未分类'}
        </span>
        {satisfaction && (
          <span
            style={{
              fontSize: '24px',
              color: '#6b5d4f',
              padding: '8px 16px',
              backgroundColor: '#ece4d3',
              borderRadius: '12px',
            }}
          >
            {satisfaction.emoji} {satisfaction.label}
          </span>
        )}
      </div>

      {/* 引导语 */}
      <p
        style={{
          fontSize: '24px',
          color: '#8b7a5d',
          margin: '0 0 20px 0',
          letterSpacing: '0.5px',
        }}
      >
        最近学到的一条决策原则
      </p>

      {/* 主体：决策原则 */}
      <div
        style={{
          position: 'relative',
          padding: '36px 32px',
          backgroundColor: '#faf5ea',
          borderRadius: '20px',
          borderLeft: '6px solid #c9b890',
          marginBottom: '44px',
        }}
      >
        <p
          style={{
            fontSize: '34px',
            fontWeight: 600,
            color: '#3d3428',
            lineHeight: 1.6,
            margin: 0,
            wordBreak: 'break-word',
          }}
        >
          “{principle}”
        </p>
      </div>

      {/* 副文案 */}
      <p
        style={{
          fontSize: '22px',
          color: '#a09080',
          lineHeight: 1.6,
          margin: '0 0 56px 0',
        }}
      >
        每一次选择，都在塑造下一次更清晰的自己。
      </p>

      {/* 底部分割线和来源 */}
      <div
        style={{
          borderTop: '2px solid rgba(139, 122, 93, 0.28)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '21px',
            color: '#8b7a5d',
            fontWeight: 500,
          }}
        >
          来自「摇摆志」
        </span>
        <span
          style={{
            fontSize: '21px',
            color: '#a09080',
          }}
        >
          记录每一次选择
        </span>
      </div>
    </div>
  );
}
