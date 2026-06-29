/**
 * 灵气粒子特效 - 凡人修仙传主题
 * 金色灵气光点漂浮 + 鼠标吸引 + 灵线连接
 */
(function () {
  if (typeof window === 'undefined') return;

  const CONFIG = {
    particleCount: 50,
    speed: 0.25,
    connectionDistance: 160,
    glowColor: '201, 169, 110',   // 金色灵气
    glowColor2: '180, 220, 200',  // 淡绿灵气
    glowSize: 18,
    coreSize: 3,
  };

  let canvas, ctx, particles, animId;
  let mouseX = -1000, mouseY = -1000;

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'xianxia-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;pointer-events:none;';
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed - 0.15, // 微微上浮 -> 灵气上升
        size: Math.random() * CONFIG.coreSize + 1.5,
        alpha: Math.random() * 0.4 + 0.15,
        alphaSpeed: (Math.random() - 0.5) * 0.008,
        color: Math.random() > 0.35 ? CONFIG.glowColor : CONFIG.glowColor2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // 环绕边界
      if (p.x < -50) p.x = canvas.width + 50;
      if (p.x > canvas.width + 50) p.x = -50;
      if (p.y < -50) p.y = canvas.height + 50;
      if (p.y > canvas.height + 50) p.y = -50;

      // 呼吸脉冲
      p.alpha += p.alphaSpeed;
      if (p.alpha > 0.55 || p.alpha < 0.1) p.alphaSpeed *= -1;

      // 鼠标微引力
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250 && dist > 0) {
        p.vx += (dx / dist) * 0.006;
        p.vy += (dy / dist) * 0.006;
      }

      // 阻尼
      p.vx *= 0.9995;
      p.vy *= 0.9995;

      // 限速
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > CONFIG.speed * 2.5) {
        p.vx = (p.vx / spd) * CONFIG.speed * 2.5;
        p.vy = (p.vy / spd) * CONFIG.speed * 2.5;
      }

      // 画发光
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, CONFIG.glowSize);
      gradient.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
      gradient.addColorStop(0.4, `rgba(${p.color}, ${p.alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, CONFIG.glowSize, 0, Math.PI * 2);
      ctx.fill();

      // 画核心
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 1.3})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 灵线连接
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach((b) => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDistance) {
          const alpha = (1 - dist / CONFIG.connectionDistance) * 0.06;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      });
    });

    animId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function init() {
    createCanvas();
    createParticles();
    draw();
    document.addEventListener('mousemove', onMouseMove, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
