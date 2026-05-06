import html2canvas from 'html2canvas';

/**
 * 决策性格报告图片导出工具
 * 使用离屏容器渲染，确保导出图片稳定、精致
 */

/**
 * 等待字体加载完成
 */
async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // 等待2帧，确保字体渲染完成
  await new Promise(resolve =>
    requestAnimationFrame(() =>
      requestAnimationFrame(resolve)
    )
  );
}

/**
 * 创建离屏容器
 */
function createOffscreenContainer() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '750px';
  container.style.zIndex = '-1';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);
  return container;
}

/**
 * 导出决策性格报告为图片
 * @param {React.ReactElement} cardElement - 要导出的报告卡片组件
 * @param {string} filename - 文件名（不含扩展名）
 * @returns {Promise<void>}
 */
export async function exportReportToImage(cardElement, filename = '摇摆志-决策性格报告') {
  let container = null;

  try {
    // 1. 创建离屏容器
    container = createOffscreenContainer();

    // 2. 渲染卡片到离屏容器
    const { createRoot } = await import('react-dom/client');
    const root = createRoot(container);

    await new Promise((resolve) => {
      root.render(cardElement);
      // 等待 React 渲染完成
      setTimeout(resolve, 150);
    });

    // 3. 等待字体加载
    await waitForFonts();

    // 4. 获取渲染的卡片元素
    const cardNode = container.firstChild;
    if (!cardNode) {
      throw new Error('报告卡片渲染失败');
    }

    // 5. 使用 html2canvas 生成图片
    const canvas = await html2canvas(cardNode, {
      scale: 2,
      backgroundColor: '#f5efe6',
      useCORS: true,
      allowTaint: false,
      logging: false,
      removeContainer: false,
    });

    // 6. 下载图片
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    const safeFilename = `${filename}-${timestamp}`.replace(/[<>:"/\\|?*]/g, '-');
    link.download = `${safeFilename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // 7. 清理
    root.unmount();
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    return true;
  } catch (error) {
    console.error('导出报告图片失败:', error);
    // 清理
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    throw error;
  }
}
