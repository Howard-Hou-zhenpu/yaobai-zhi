import { Sparkles } from 'lucide-react';

/**
 * 决策性格报告导出专用海报组件
 * 固定尺寸：750px 宽，专门用于生成分享图片
 * 不依赖响应式布局，所有样式固定
 */
export default function PersonalityReportExportCard({ report }) {
  if (!report) return null;

  const satisfactionRate = report.stats?.reviewedCount > 0
    ? Math.round((report.stats.satisfiedCount / report.stats.reviewedCount) * 100)
    : 0;
  const regretRate = report.stats?.reviewedCount > 0
    ? Math.round((report.stats.regretCount / report.stats.reviewedCount) * 100)
    : 0;
  const topCategory = report.stats?.topCategories?.[0]?.category || '未知';

  // 只取前2条建议，每条最多显示2行
  const suggestions = report.nextActions?.slice(0, 2) || [];

  return (
    <div
      style={{
        width: '750px',
        backgroundColor: '#f5efe6',
        padding: '48px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      }}
    >
      {/* 顶部：品牌和标题 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '36px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles style={{ width: '28px', height: '28px', color: '#8b7a5d', strokeWidth: 1.5 }} />
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#3d3428',
              fontFamily: '"Songti SC", "SimSun", "Noto Serif CJK SC", serif',
            }}
          >
            摇摆志
          </span>
        </div>
        <span
          style={{
            fontSize: '22px',
            color: '#a89376',
            fontWeight: 500,
          }}
        >
          决策性格报告
        </span>
      </div>

      {/* 主内容卡片 */}
      <div
        style={{
          backgroundColor: '#ebe7dc',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '36px',
        }}
      >
        {/* 性格类型标签 */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#e8dfd0',
              padding: '10px 28px',
              borderRadius: '999px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#8b7a5d',
              }}
            >
              {report.decisionType}
            </span>
          </div>
          <p
            style={{
              fontSize: '24px',
              color: '#6b5d4f',
              lineHeight: 1.6,
              margin: '0',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {report.oneSentenceSummary}
          </p>
        </div>

        {/* 四个数据卡片 2x2 布局 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* 已复盘 */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '42px',
                fontWeight: 700,
                color: '#3d3428',
                margin: '0 0 8px 0',
                lineHeight: 1,
              }}
            >
              {report.stats?.reviewedCount || 0}
            </p>
            <p
              style={{
                fontSize: '20px',
                color: '#a89376',
                margin: '0',
              }}
            >
              已复盘
            </p>
          </div>

          {/* 满意率 */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '42px',
                fontWeight: 700,
                color: '#5a6b4f',
                margin: '0 0 8px 0',
                lineHeight: 1,
              }}
            >
              {satisfactionRate}%
            </p>
            <p
              style={{
                fontSize: '20px',
                color: '#a89376',
                margin: '0',
              }}
            >
              满意率
            </p>
          </div>

          {/* 后悔率 */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '42px',
                fontWeight: 700,
                color: '#a0522d',
                margin: '0 0 8px 0',
                lineHeight: 1,
              }}
            >
              {regretRate}%
            </p>
            <p
              style={{
                fontSize: '20px',
                color: '#a89376',
                margin: '0',
              }}
            >
              后悔率
            </p>
          </div>

          {/* 最常纠结 */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#6b5d4f',
                margin: '0 0 8px 0',
                lineHeight: 1.2,
              }}
            >
              {topCategory}
            </p>
            <p
              style={{
                fontSize: '20px',
                color: '#a89376',
                margin: '0',
              }}
            >
              最常纠结
            </p>
          </div>
        </div>

        {/* 建议区 */}
        {suggestions.length > 0 && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '28px 30px',
            }}
          >
            <p
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: '#3d3428',
                margin: '0 0 16px 0',
              }}
            >
              下次决策建议
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {suggestions.map((action, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      color: '#8b7a5d',
                      fontSize: '20px',
                      lineHeight: 1.5,
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    •
                  </span>
                  <p
                    style={{
                      fontSize: '20px',
                      color: '#6b5d4f',
                      lineHeight: 1.5,
                      margin: '0',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部：分割线和来源 */}
      <div
        style={{
          borderTop: '2px solid rgba(139, 122, 93, 0.28)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '32px',
        }}
      >
        <span
          style={{
            fontSize: '22px',
            color: '#8b7a5d',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          来自「摇摆志」
        </span>
        <span
          style={{
            fontSize: '22px',
            color: '#a89376',
            lineHeight: 1.45,
            textAlign: 'right',
            maxWidth: '360px',
          }}
        >
          记录每一次选择，成就更好的决策
        </span>
      </div>
    </div>
  );
}
