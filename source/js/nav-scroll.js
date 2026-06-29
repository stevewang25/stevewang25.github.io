/**
 * 导航栏滚动行为
 * - 页面顶部：半透明（nav-transparent）
 * - 滚动后：强毛玻璃（nav-frosted）
 * - PJAX 兼容，滚动监听在导航切换时重建
 */
(function () {
  if (typeof window === 'undefined') return;

  var SCROLL_THRESHOLD = 50;
  var scrollHandler;

  function updateNavClass() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var scrollY = window.scrollY || window.pageYOffset;

    nav.classList.remove('nav-transparent', 'nav-frosted');

    if (scrollY < SCROLL_THRESHOLD) {
      nav.classList.add('nav-transparent');
    } else {
      nav.classList.add('nav-frosted');
    }
  }

  function init() {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
    }
    scrollHandler = updateNavClass;
    updateNavClass();
    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  function destroy() {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    var nav = document.getElementById('nav');
    if (nav) {
      nav.classList.remove('nav-transparent', 'nav-frosted');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // PJAX 支持
  if (typeof window.pjax !== 'undefined') {
    document.addEventListener('pjax:send', destroy);
    document.addEventListener('pjax:complete', init);
  }
})();
