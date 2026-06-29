/**
 * 背景图片轮播 + 光斑效果
 * - 多张背景图 crossfade 切换（仿 XingHuiSama 风格）
 * - 注入 3 个光斑 div 增加层次感
 * - 与 video-bg.js 共存：视频激活时暂停轮播
 * - PJAX 兼容
 */
(function () {
  if (typeof window === 'undefined') return;

  var INTERVAL = 8000;   // 每张图 8 秒
  var TRANSITION = 2000; // 2 秒渐变

  var IMAGES = [];       // 实际可用的图片（预加载后填充）
  var currentIndex = 0;
  var bgLayer1, bgLayer2, activeLayer = 1;
  var intervalId;
  var videoActive = false;

  // --- 光斑 DOM 注入 ---
  function createLightOrbs() {
    if (document.querySelector('.light-orb')) return;
    for (var i = 1; i <= 3; i++) {
      var orb = document.createElement('div');
      orb.className = 'light-orb light-orb-' + i;
      document.body.appendChild(orb);
    }
  }

  // --- 预加载：检测哪些图片真实存在 ---
  function preloadImages(callback) {
    var candidates = [];
    var MAX_IMAGES = 10;
    for (var i = 1; i <= MAX_IMAGES; i++) {
      candidates.push('/images/fanren-bg-' + i + '.jpg');
    }

    var loaded = 0;
    var valid = [];

    if (candidates.length === 0) { callback([]); return; }

    candidates.forEach(function (src) {
      var img = new Image();
      img.onload = function () {
        valid.push(src);
        loaded++;
        if (loaded === candidates.length) finish();
      };
      img.onerror = function () {
        loaded++;
        if (loaded === candidates.length) finish();
      };
      img.src = src;
    });

    function finish() {
      // 排序保持编号顺序
      valid.sort();
      // 至少保证有图片可用
      if (valid.length === 0) {
        valid = candidates.slice(0, 3); // 兜底显示前 3 张
      }
      callback(valid);
    }
  }

  // --- 背景图层创建 ---
  function createBgLayers() {
    if (document.getElementById('bg-carousel-layer1')) return;

    bgLayer1 = document.createElement('div');
    bgLayer1.id = 'bg-carousel-layer1';
    bgLayer1.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-10;' +
      'background-size:cover;background-position:center;' +
      'transition:opacity ' + TRANSITION + 'ms ease-in-out;opacity:1;pointer-events:none;';

    bgLayer2 = document.createElement('div');
    bgLayer2.id = 'bg-carousel-layer2';
    bgLayer2.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-10;' +
      'background-size:cover;background-position:center;' +
      'transition:opacity ' + TRANSITION + 'ms ease-in-out;opacity:0;pointer-events:none;';

    document.body.insertBefore(bgLayer2, document.body.firstChild);
    document.body.insertBefore(bgLayer1, document.body.firstChild);

    bgLayer1.style.backgroundImage = 'url(' + IMAGES[0] + ')';
  }

  // --- 渐变切换 ---
  function crossfade() {
    if (videoActive) return;
    currentIndex = (currentIndex + 1) % IMAGES.length;

    if (activeLayer === 1) {
      bgLayer2.style.backgroundImage = 'url(' + IMAGES[currentIndex] + ')';
      bgLayer2.style.opacity = '1';
      bgLayer1.style.opacity = '0';
      activeLayer = 2;
    } else {
      bgLayer1.style.backgroundImage = 'url(' + IMAGES[currentIndex] + ')';
      bgLayer1.style.opacity = '1';
      bgLayer2.style.opacity = '0';
      activeLayer = 1;
    }
  }

  function pause() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function resume() {
    if (videoActive) return;
    if (IMAGES.length <= 1) return; // 只有一张图不用轮播
    pause();
    intervalId = setInterval(crossfade, INTERVAL);
  }

  // --- 视频共存事件 ---
  function onVideoActive() {
    videoActive = true;
    pause();
    if (bgLayer1) bgLayer1.style.opacity = '0';
    if (bgLayer2) bgLayer2.style.opacity = '0';
  }

  function onVideoInactive() {
    videoActive = false;
    if (activeLayer === 1 && bgLayer1) bgLayer1.style.opacity = '1';
    else if (bgLayer2) bgLayer2.style.opacity = '1';
    resume();
  }

  // --- 初始化 ---
  function init() {
    createLightOrbs();

    preloadImages(function (validImages) {
      IMAGES = validImages;
      if (IMAGES.length === 0) return;
      createBgLayers();
      resume();
    });

    window.addEventListener('videoBgActive', onVideoActive);
    window.addEventListener('videoBgInactive', onVideoInactive);
  }

  // --- 销毁（PJAX 前） ---
  function destroy() {
    pause();
    window.removeEventListener('videoBgActive', onVideoActive);
    window.removeEventListener('videoBgInactive', onVideoInactive);
    // 保持图层和光斑 DOM，PJAX 不替换 body 顶层元素
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
