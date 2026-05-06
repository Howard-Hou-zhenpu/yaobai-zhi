import html2canvas from 'html2canvas';

/**
 * 稳定的图片导出工具
 * 使用离屏容器渲染，确保导出图片布局一致
 */

/**
 * 等待字体加载完成
 */
async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // 额外等待一帧，确保字体渲染完成
  await new Promise(resolve => requestAnimationFrame(resolve));
}

/**
 * 创建离屏容器
 */
function createOffscreenContainer() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  document.body.appendChild(container);
  return container;
}

/**
 * 导出卡片为图片
 * @param {React.ReactElement} cardElement - 要导出的卡片组件
 * @param {string} filename - 文件名
 * @returns {Promise<void>}
 */
export async function exportCardToImage(cardElement, filename) {
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
      setTimeout(resolve, 100);
    });

    // 3. 等待字体加载
    await waitForFonts();

    // 4. 再等待一帧，确保布局稳定
    await new Promise(resolve => requestAnimationFrame(resolve));

    // 5. 获取渲染的卡片元素
    const cardNode = container.firstChild;
    if (!cardNode) {
      throw new Error('卡片渲染失败');
    }

    // 6. 使用 html2canvas 生成图片
    const canvas = await html2canvas(cardNode, {
      scale: window.devicePixelRatio || 2,
      backgroundColor: '#f4efe6',
      useCORS: true,
      allowTaint: false,
      logging: false,
      windowWidth: 760,
      windowHeight: cardNode.scrollHeight,
    });

    // 7. 下载图片
    const link = document.createElement('a');
    // 清理文件名中的特殊字符
    const safeFilename = filename.replace(/[<>:"/\\|?*]/g, '-');
    link.download = `${safeFilename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // 8. 清理
    root.unmount();
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    return true;
  } catch (error) {
    console.error('导出图片失败:', error);
    // 清理
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    throw error;
  }
}

/**
 * 生成安全的文件名
 * @param {string} title - 决策标题
 * @returns {string}
 */
export function generateFilename(title) {
  const date = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
  const safeTitle = title.substring(0, 20); // 限制长度
  return `摇摆志-${safeTitle}-${date}`;
}
