/**
 * Firefly Particle Effect
 * Canvas-based glowing particles floating across the page
 */
(function () {
  if (typeof window === 'undefined') return;

  const CONFIG = {
    particleCount: 45,
    particleSize: 3,
    glowSize: 15,
    speed: 0.3,
    connectionDistance: 150,
    glowColor: '73, 177, 245', // blue glow
    glowColor2: '255, 114, 66', // orange glow
  };

  let canvas, ctx, particles, animId;
  let mouseX = -1000, mouseY = -1000;

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'firefly-canvas';
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
        vy: (Math.random() - 0.5) * CONFIG.speed,
        size: Math.random() * CONFIG.particleSize + 1,
        alpha: Math.random() * 0.5 + 0.2,
        alphaSpeed: (Math.random() - 0.5) * 0.01,
        color: Math.random() > 0.5 ? CONFIG.glowColor : CONFIG.glowColor2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Keep in bounds
      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));

      // Pulse alpha
      p.alpha += p.alphaSpeed;
      if (p.alpha > 0.7 || p.alpha < 0.15) p.alphaSpeed *= -1;

      // Mouse attraction (gentle)
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && dist > 0) {
        p.vx += (dx / dist) * 0.01;
        p.vy += (dy / dist) * 0.01;
      }

      // Damping
      p.vx *= 0.999;
      p.vy *= 0.999;

      // Speed limit
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > CONFIG.speed * 2) {
        p.vx = (p.vx / spd) * CONFIG.speed * 2;
        p.vy = (p.vy / spd) * CONFIG.speed * 2;
      }

      // Draw glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, CONFIG.glowSize);
      gradient.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
      gradient.addColorStop(0.5, `rgba(${p.color}, ${p.alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, CONFIG.glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 1.5})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connections
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach((b) => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDistance) {
          const alpha = (1 - dist / CONFIG.connectionDistance) * 0.08;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(73, 177, 245, ${alpha})`;
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

  // Start after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
