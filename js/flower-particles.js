(function () {
  'use strict';

  var started = false;

  function ellipse(ctx, x, y, rx, ry, rotation, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation || 0);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawLeaf(ctx, x, y, scale, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-24, -11, -34, -36, -28, -48);
    ctx.bezierCurveTo(-4, -42, 13, -22, 0, 0);
    ctx.fillStyle = '#55a87b';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-1, -2);
    ctx.lineTo(-25, -43);
    ctx.strokeStyle = '#b6e6bd';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawRose(ctx, x, y, scale, hueShift) {
    var outer = hueShift ? '#ff9db8' : '#f36f9d';
    var middle = hueShift ? '#f1749c' : '#d94f87';
    var inner = hueShift ? '#cc4e7d' : '#ad366d';
    for (var i = 0; i < 9; i++) {
      var angle = i * Math.PI * 2 / 9;
      ellipse(ctx, x + Math.cos(angle) * 17 * scale, y + Math.sin(angle) * 12 * scale,
        18 * scale, 11 * scale, angle + .25, outer);
    }
    for (var j = 0; j < 7; j++) {
      var innerAngle = j * Math.PI * 2 / 7 + .35;
      ellipse(ctx, x + Math.cos(innerAngle) * 10 * scale, y + Math.sin(innerAngle) * 7 * scale,
        13 * scale, 8 * scale, innerAngle, middle);
    }
    ellipse(ctx, x, y, 9 * scale, 7 * scale, -.4, inner);
    ellipse(ctx, x + 3 * scale, y - 1 * scale, 5 * scale, 3 * scale, .45, '#ffbfd0');
  }

  function drawDaisy(ctx, x, y, scale) {
    for (var i = 0; i < 10; i++) {
      var angle = i * Math.PI * 2 / 10;
      ellipse(ctx, x + Math.cos(angle) * 15 * scale, y + Math.sin(angle) * 15 * scale,
        6 * scale, 14 * scale, angle + Math.PI / 2, '#fff8ed');
    }
    ellipse(ctx, x, y, 10 * scale, 10 * scale, 0, '#ffc85e');
    ellipse(ctx, x - 2 * scale, y - 2 * scale, 4 * scale, 4 * scale, 0, '#fff1a5');
  }

  function drawTulip(ctx, x, y, scale, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(-28, -20);
    ctx.bezierCurveTo(-12, -17, -9, -34, 0, -44);
    ctx.bezierCurveTo(8, -31, 14, -17, 28, -22);
    ctx.bezierCurveTo(27, 8, 16, 23, 0, 24);
    ctx.bezierCurveTo(-17, 22, -28, 7, -28, -20);
    ctx.fillStyle = '#ff8da7';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.bezierCurveTo(-7, -18, -6, 8, 0, 21);
    ctx.bezierCurveTo(8, 5, 7, -19, 0, -42);
    ctx.fillStyle = '#ffb2bb';
    ctx.fill();
    ctx.restore();
  }

  function drawBouquetMap(ctx) {
    ctx.clearRect(0, 0, 600, 340);
    ctx.lineCap = 'round';

    var stems = [
      [300, 322, 197, 124], [300, 322, 300, 96], [300, 322, 411, 136],
      [300, 322, 151, 184], [300, 322, 458, 202], [300, 322, 232, 158],
      [300, 322, 372, 166], [300, 322, 270, 185], [300, 322, 345, 198]
    ];
    ctx.strokeStyle = '#4f9b70';
    ctx.lineWidth = 5;
    stems.forEach(function (stem) {
      ctx.beginPath();
      ctx.moveTo(stem[0], stem[1]);
      ctx.quadraticCurveTo((stem[0] + stem[2]) / 2 + (stem[2] < 300 ? -8 : 8), 230, stem[2], stem[3]);
      ctx.stroke();
    });

    drawLeaf(ctx, 261, 254, 1.0, -1.05);
    drawLeaf(ctx, 332, 267, 1.0, 1.05);
    drawLeaf(ctx, 238, 217, .85, -.92);
    drawLeaf(ctx, 366, 222, .86, .95);
    drawLeaf(ctx, 287, 274, .76, -.18);
    drawLeaf(ctx, 317, 239, .72, .25);

    drawTulip(ctx, 151, 184, .88, -.42);
    drawTulip(ctx, 458, 202, .86, .4);
    drawDaisy(ctx, 225, 153, .88);
    drawDaisy(ctx, 380, 164, .8);
    drawDaisy(ctx, 349, 203, .68);
    drawRose(ctx, 199, 124, 1.0, true);
    drawRose(ctx, 300, 98, 1.18, false);
    drawRose(ctx, 411, 136, 1.03, true);
    drawRose(ctx, 273, 184, .82, false);

    ctx.beginPath();
    ctx.moveTo(250, 270);
    ctx.quadraticCurveTo(300, 293, 350, 270);
    ctx.lineTo(336, 329);
    ctx.quadraticCurveTo(300, 342, 264, 329);
    ctx.closePath();
    ctx.fillStyle = '#e8c7b0';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(270, 285);
    ctx.quadraticCurveTo(300, 307, 330, 285);
    ctx.strokeStyle = '#c75f86';
    ctx.lineWidth = 9;
    ctx.stroke();
  }

  function buildParticles(map, mobile, reducedMotion) {
    var data = map.getImageData(0, 0, 600, 340).data;
    var gap = mobile ? 8 : 6;
    var particles = [];

    for (var y = 0; y < 340; y += gap) {
      for (var x = 0; x < 600; x += gap) {
        var index = (y * 600 + x) * 4;
        if (data[index + 3] < 90 || Math.random() < .06) continue;
        var startSpread = reducedMotion ? 0 : 34;
        particles.push({
          x: 300 + (Math.random() - .5) * startSpread,
          y: 326 + (Math.random() - .5) * startSpread,
          tx: x,
          ty: y,
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          size: (mobile ? 1.55 : 1.4) + Math.random() * 1.2,
          delay: reducedMotion ? 0 : Math.floor(Math.random() * 42),
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    return particles;
  }

  window.startFlowerParticles = function () {
    if (started) return;
    started = true;

    var canvas = document.getElementById('flower-particle-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var mapCanvas = document.createElement('canvas');
    mapCanvas.width = 600;
    mapCanvas.height = 340;
    var map = mapCanvas.getContext('2d');
    var mobile = window.matchMedia('(max-width: 600px)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var particles;
    var frame = 0;
    var lastFrame = 0;

    drawBouquetMap(map);
    particles = buildParticles(map, mobile, reducedMotion);

    function render(timestamp) {
      if (timestamp - lastFrame < (reducedMotion ? 90 : 33)) {
        window.requestAnimationFrame(render);
        return;
      }
      lastFrame = timestamp;
      ctx.clearRect(0, 0, 600, 340);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (frame < p.delay) continue;
        if (!reducedMotion) {
          p.x += (p.tx - p.x) * .075;
          p.y += (p.ty - p.y) * .075;
        } else {
          p.x = p.tx;
          p.y = p.ty;
        }
        var age = frame - p.delay;
        var alpha = Math.min(1, age / 18);
        var shimmer = age > 85 ? Math.sin(timestamp * .0015 + p.phase) * .55 : 0;
        ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x + shimmer, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      frame++;
      if (!reducedMotion) window.requestAnimationFrame(render);
    }

    window.requestAnimationFrame(render);
  };
}());
