/**
 * 专门用于导出图片的决策卡片组件
 * 固定尺寸、固定样式，不依赖响应式布局
 * 宽度：760px，确保导出图片清晰稳定
 */
export default function ExportCard({ decision }) {
  const selectedOptions = decision.selectedOption
    ? decision.selectedOption.split(',').filter(Boolean)
    : [];

  return (
    <div
      style={{
        width: '760px',
        backgroundColor: '#f4efe6',
        padding: '48px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      }}
    >
      {/* 顶部：分类标签 */}
      <div style={{ marginBottom: '32px' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '25px',
            color: '#8b7a5d',
            backgroundColor: '#e8dfd0',
            padding: '8px 20px',
            borderRadius: '12px',
            fontWeight: 500,
          }}
        >
          {decision.category}
        </span>
      </div>

      {/* 标题 */}
      <h1
        style={{
          fontSize: '38px',
          fontWeight: 700,
          color: '#3d3428',
          lineHeight: 1.25,
          margin: '0 0 24px 0',
          wordBreak: 'break-word',
        }}
      >
        {decision.title}
      </h1>

      {/* 描述 */}
      {decision.description && (
        <p
          style={{
            fontSize: '27px',
            color: '#6b5d4f',
            lineHeight: 1.55,
            margin: '0 0 36px 0',
            wordBreak: 'break-word',
          }}
        >
          {decision.description}
        </p>
      )}

      {/* 纠结度和信心值 */}
      {(decision.hesitation > 0 || decision.confidence > 0) && (
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginBottom: '36px',
            fontSize: '25px',
            color: '#6b5d4f',
          }}
        >
          {decision.hesitation > 0 && (
            <span>纠结度 {decision.hesitation}/5</span>
          )}
          {decision.confidence > 0 && (
            <span>信心值 {decision.confidence}/5</span>
          )}
        </div>
      )}

      {/* 最终选择 */}
      {selectedOptions.length > 0 && (
        <div
          style={{
            backgroundColor: '#e8f4e8',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '36px',
          }}
        >
          <p
            style={{
              fontSize: '27px',
              color: '#5a6b4f',
              margin: 0,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            最终选择：{selectedOptions.join('、')}
          </p>
        </div>
      )}

      {/* 复盘总结（如果有） */}
      {decision.review && (
        <div
          style={{
            backgroundColor: '#ebe7dc',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '36px',
          }}
        >
          <p
            style={{
              fontSize: '25px',
              color: '#3d3428',
              margin: 0,
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          >
            {decision.review}
          </p>
        </div>
      )}

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
