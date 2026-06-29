/**
 * 全局固定音乐播放器
 * - 使用 Butterfly 内置 aplayerInject + MetingJS
 * - 配合 PJAX 实现跨页面不中断播放
 * - 网易云歌单，固定底部
 *
 * 注意：Butterfly 的 aplayerInject 在 enable:true + per_page:false 时
 * 会自动处理 PJAX 生命周期。此脚本作为补充确保 MetingJS 初始化。
 */
(function () {
  if (typeof window === 'undefined') return;

  function initMusic() {
    // 如果 Butterfly aplayerInject 已经处理了 APlayer，跳过
    // aplayerInject 会在 PJAX 时自动 destroy + reinit
    // MetingJS 通过 <meting-js> 元素自动初始化

    // 如果页面没有 meting-js 元素且没有 APlayer 实例，手动创建
    if (!document.querySelector('meting-js') && !document.getElementById('aplayer')) {
      var metingEl = document.createElement('meting-js');
      metingEl.setAttribute('server', 'netease');
      metingEl.setAttribute('type', 'playlist');
      metingEl.setAttribute('id', '18102789384');
      metingEl.setAttribute('fixed', 'true');
      metingEl.setAttribute('mini', 'false');
      metingEl.setAttribute('autoplay', 'false');
      metingEl.setAttribute('order', 'random');
      metingEl.setAttribute('preload', 'auto');
      metingEl.setAttribute('volume', '0.3');
      metingEl.setAttribute('loop', 'all');
      metingEl.setAttribute('lrc-type', '1');

      var container = document.createElement('div');
      container.id = 'music-container';
      container.appendChild(metingEl);
      document.body.appendChild(container);

      // 重新触发 MetingJS 解析
      if (typeof window.loadMeting === 'function') {
        try { window.loadMeting(); } catch (e) {}
      }
    }
  }

  // 延迟初始化，确保 Butterfly 的 aplayerInject 先执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(initMusic, 500);
    });
  } else {
    setTimeout(initMusic, 500);
  }

  // PJAX 支持 - 在 PJAX 完成后检查是否需要重建
  if (typeof window.pjax !== 'undefined') {
    document.addEventListener('pjax:complete', function () {
      setTimeout(initMusic, 800);
    });
  }
})();
