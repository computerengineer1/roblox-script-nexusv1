/**
 * Roblox Script Nexus - Luxury Silver & Titanium Stardust Canvas Background
 */
document.addEventListener('DOMContentLoaded', function() {
  var canvas = document.createElement('canvas');
  canvas.id = 'cyberParticlesCanvas';
  canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: -1; opacity: 0.45;';
  document.body.prepend(canvas);

  var ctx = canvas.getContext('2d');
  var width, height;
  var particles = [];
  var mouse = { x: null, y: null, radius: 150 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', function(e) {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseleave', function() {
    mouse.x = null;
    mouse.y = null;
  });

  function Particle() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.8 + 0.6;
    this.speedX = (Math.random() - 0.5) * 0.35;
    this.speedY = (Math.random() - 0.5) * 0.35;
    this.color = Math.random() > 0.4 ? 'rgba(255, 255, 255, ' : 'rgba(161, 161, 170, ';
    this.alpha = Math.random() * 0.55 + 0.15;
  }

  Particle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    if (mouse.x && mouse.y) {
      var dx = mouse.x - this.x;
      var dy = mouse.y - this.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        var angle = Math.atan2(dy, dx);
        var force = (mouse.radius - dist) / mouse.radius;
        this.x -= Math.cos(angle) * force * 1.8;
        this.y -= Math.sin(angle) * force * 1.8;
      }
    }
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  var particleCount = Math.min(Math.floor((width * height) / 20000), 50);
  for (var i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          var opacity = (1 - dist / 100) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity + ')';
          ctx.lineWidth = 0.65;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }

    for (var j = 0; j < particles.length; j++) {
      particles[j].update();
      particles[j].draw();
    }

    requestAnimationFrame(animate);
  }

  animate();
});
