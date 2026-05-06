import { useState, useRef } from 'react';
import { X, Download, Copy, Shield, ShieldOff } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import DecisionShareCard from './DecisionShareCard';
import ReportShareCard from './ReportShareCard';
import PersonalityReportExportCard from './PersonalityReportExportCard';
import { prepareShareData, generateShareText } from '../lib/privacy';
import { exportReportToImage } from '../lib/exportReportImage';

/**
 * 通用分享卡片弹窗
 * 支持决策和报告两种类型
 * @param {Object} props
 * @param {'decision'|'report'} props.type - 卡片类型
 * @param {Object} props.data - 数据（决策或报告）
 * @param {Function} props.onClose - 关闭回调
 */
export default function UniversalShareModal({ type, data, onClose }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [enableSanitize, setEnableSanitize] = useState(true);

  const displayData = type === 'decision' && enableSanitize
    ? prepareShareData(data, true)
    : data;

  const handleCopyText = () => {
    const shareText = generateShareText(displayData, type);

    navigator.clipboard.writeText(shareText)
      .then(() => {
        toast.success('已复制到剪贴板', {
          description: '可以粘贴到微信等应用分享'
        });
      })
      .catch(() => {
        toast.error('复制失败，请手动复制');
      });
  };

  const handleSaveImage = async () => {
    setSaving(true);
    try {
      if (type === 'report') {
        // 报告类型：使用新的离屏渲染导出方案
        await exportReportToImage(
          <PersonalityReportExportCard report={displayData} />,
          '摇摆志-决策性格报告'
        );
      } else {
        // 决策类型：使用原有方案
        if (!cardRef.current) return;
        const html2canvas = (await import('html2canvas')).default;

        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: '#f5f1e8',
          useCORS: true,
        });

        const link = document.createElement('a');
        link.download = `摇摆志-决策复盘-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      toast.success('图片已保存', {
        description: '可以在相册中找到并分享到微信'
      });
    } catch (error) {
      console.error('保存图片失败:', error);
      toast.error('保存图片失败，请截图保存');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#e8e3d8] rounded-[28px] p-4 max-w-[430px] w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-[#3d3428]">分享卡片</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#a09080] hover:text-[#6b5d4f]">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </Button>
        </div>

        {/* 隐私开关（仅决策类型显示） */}
        {type === 'decision' && (
          <div className="mb-4 flex items-center justify-between p-3 bg-[#f5f1e8] rounded-xl">
            <div className="flex items-center gap-2">
              {enableSanitize ? (
                <Shield className="w-4 h-4 text-[#5a6b4f]" strokeWidth={1.5} />
              ) : (
                <ShieldOff className="w-4 h-4 text-[#a0522d]" strokeWidth={1.5} />
              )}
              <span className="text-[13px] text-[#6b5d4f]">
                {enableSanitize ? '已隐藏敏感信息' : '显示完整信息'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px]"
              onClick={() => setEnableSanitize(!enableSanitize)}
            >
              {enableSanitize ? '关闭' : '开启'}
            </Button>
          </div>
        )}

        {/* 卡片预览 */}
        <div className="mb-4 flex justify-center">
          {type === 'decision' ? (
            <DecisionShareCard ref={cardRef} decision={displayData} sanitized={enableSanitize} />
          ) : (
            <ReportShareCard ref={cardRef} report={displayData} />
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full gap-2"
            onClick={handleCopyText}
          >
            <Copy className="w-4 h-4" strokeWidth={1.5} />
            复制文案
          </Button>
          <Button
            className="flex-1 rounded-full gap-2"
            onClick={handleSaveImage}
            disabled={saving}
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            {saving ? '保存中...' : '保存图片'}
          </Button>
        </div>

        {/* 移动端提示 */}
        <p className="text-[11px] text-[#a09080] text-center mt-3">
          如果保存失败，可以截图保存
        </p>
      </div>
    </div>
  );
}
