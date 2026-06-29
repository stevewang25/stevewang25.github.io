/**
 * 视频背景 - 优先视频，无视频时降级为静态图
 * 凡人修仙传 - 韩立水墨风
 */
(function () {
  if (typeof window === 'undefined') return;

  function initVideoBg() {
    var header = document.getElementById('page-header');
    if (!header) return setTimeout(initVideoBg, 200);

    // 检查是否有视频文件
    fetch('/video/hanli-ink.mp4', { method: 'HEAD' })
      .then(function (res) {
        if (res.ok) {
          // 有视频 - 插入视频背景
          setupVideo(header);
        } else {
          // 无视频 - 不做额外处理，用主题默认的静态图
          console.log('视频不可用，使用静态背景');
        }
      })
      .catch(function () {
        // 请求失败，使用静态图
      });
  }

  function setupVideo(header) {
    var video = document.createElement('video');
    video.id = 'bg-video';
    video.src = '/video/hanli-ink.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'object-fit:cover;z-index:-1;pointer-events:none;';

    // 找到 header 内的容器并前置视频
    var container = header.querySelector('#post-info, #page-site-info') || header;
    if (container) {
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      container.insertBefore(video, container.firstChild);
    }

    // 加一层半透明遮罩保持文字可读
    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(10,8,4,0.4);z-index:0;pointer-events:none;';
    if (container) container.insertBefore(overlay, video.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoBg);
  } else {
    initVideoBg();
  }
})();
