import { useState, useRef } from 'react';
import { X, Download, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import ReportShareCard from './ReportShareCard';

/**
 * 分享卡片弹窗
 * 展示卡片预览，支持保存图片和复制文案
 */
export default function ShareCardModal({ report, onClose }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const handleCopyText = () => {
    const shareText = report.shareCardText || `我的决策人格：${report.decisionType}\n\n${report.oneSentenceSummary}`;
    const fullText = shareText + '\n\n来自「摇摆志」';

    navigator.clipboard.writeText(fullText)
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
    if (!cardRef.current) return;

    setSaving(true);
    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#e8e3d8',
        scale: 2, // 提高清晰度
        logging: false,
        useCORS: true,
      });

      // 转换为 blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('生成图片失败');
          return;
        }

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `摇摆志-决策性格报告-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('图片已保存', {
          description: '可以在相册中找到并分享到微信'
        });
      }, 'image/png');
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

        {/* 卡片预览 */}
        <div className="mb-4 flex justify-center">
          <ReportShareCard ref={cardRef} report={report} />
        </div>

        {/* 提示文字 */}
        <p className="text-[13px] text-[#6b5d4f] text-center mb-4">
          保存图片后可以分享到微信朋友圈或好友
        </p>

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
