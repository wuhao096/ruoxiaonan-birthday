(function () {
  'use strict';

  var canvas = document.getElementById('butterfly-particle-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d'),
      dpr = Math.min(window.devicePixelRatio || 1, 1.5),
      width = 0,
      height = 0,
      lastFrame = 0,
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      palettes = [
        ['#ffd3e4', '#ff8eb8', '#fff1b8'],
        ['#c9eaff', '#86c8f2', '#efe2ff'],
        ['#ffe6a8', '#ffb66f', '#ffd4e8'],
        ['#e0caff', '#aa8ce8', '#ffc8df'],
        ['#c9f1dc', '#7ed0af', '#fff0b5']
      ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function dot(x, y, radius, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function wingPath(cx, cy, side, points, open, size, color, alpha) {
    var stepCount = width < 600 ? 4 : 5;
    for (var segment = 0; segment < points.length - 1; segment++) {
      for (var step = 0; step < stepCount; step++) {
        var t = step / stepCount,
            px = points[segment][0] + (points[segment + 1][0] - points[segment][0]) * t,
            py = points[segment][1] + (points[segment + 1][1] - points[segment][1]) * t;
        dot(cx + side * px * size * open, cy + py * size, width < 600 ? 1.3 : 1.65, color, alpha);
      }
    }
  }

  function wing(cx, cy, side, flap, size, color, accent) {
    // 上翅大而圆，下翅短而尖，避免再形成两个椭圆环。
    var open = .68 + flap * .32,
        upperWing = [[.08, -.06], [.28, -.58], [.72, -.84], [1.02, -.56], [.92, -.18], [.58, .02], [.08, -.06]],
        lowerWing = [[.08, .05], [.54, .12], [.88, .45], [.62, .72], [.26, .48], [.08, .05]];
    wingPath(cx, cy, side, upperWing, open, size, color, .95);
    wingPath(cx, cy, side, lowerWing, open, size, color, .9);

    // 从身体向翅尖分出的几条粒子纹理，进一步强调翅膀结构。
    [[.27, -.49, .74, -.63], [.27, -.3, .7, -.3], [.26, .16, .68, .42], [.25, .24, .5, .58]].forEach(function (vein, index) {
      var veinSteps = width < 600 ? 4 : 6;
      for (var v = 0; v < veinSteps; v++) {
        var t = v / (veinSteps - 1),
            vx = vein[0] + (vein[2] - vein[0]) * t,
            vy = vein[1] + (vein[3] - vein[1]) * t;
        dot(cx + side * vx * size * open, cy + vy * size, width < 600 ? 1 : 1.25, accent, index % 2 ? .72 : .82);
      }
    });
  }

  function butterfly(item, time, index) {
    var floatX = Math.sin(time * .00072 + index * 1.8) * item.drift,
        floatY = Math.cos(time * .0009 + index * 1.3) * 7,
        x = item.x * width + floatX,
        y = item.y * height + floatY,
        flap = reducedMotion ? .78 : .35 + Math.abs(Math.sin(time * item.speed + item.phase)) * .65,
        size = item.size * Math.min(1.08, Math.max(.78, width / 1180)),
        palette = palettes[index % palettes.length];

    wing(x, y, -1, flap, size, palette[0], palette[2]);
    wing(x, y, 1, flap, size, palette[1], palette[2]);

    // 身体、触角也由粒子组成，保证缩小后仍能辨认。
    for (var b = -4; b <= 5; b++) {
      dot(x, y + b * size * .11, width < 600 ? 1.35 : 1.7, '#fff4d7', .96);
    }
    for (var a = 0; a < 6; a++) {
      dot(x - a * size * .07, y - size * (.48 + a * .06), 1.05, '#fff4d7', .82);
      dot(x + a * size * .07, y - size * (.48 + a * .06), 1.05, '#fff4d7', .82);
    }
  }

  function positions() {
    if (width < 600) {
      return [
        { x: .17, y: .31, size: 24, drift: 12, speed: .009, phase: .2 },
        { x: .82, y: .29, size: 22, drift: 14, speed: .01, phase: 1.7 },
        { x: .79, y: .58, size: 20, drift: 10, speed: .011, phase: 3.1 }
      ];
    }
    return [
      { x: .27, y: .3, size: 31, drift: 17, speed: .009, phase: .2 },
      { x: .73, y: .27, size: 28, drift: 19, speed: .01, phase: 1.5 },
      { x: .22, y: .58, size: 25, drift: 14, speed: .011, phase: 2.7 },
      { x: .78, y: .57, size: 27, drift: 15, speed: .0095, phase: 4.1 },
      { x: .67, y: .18, size: 21, drift: 11, speed: .012, phase: 5.2 }
    ];
  }

  function frame(time) {
    requestAnimationFrame(frame);
    if (time - lastFrame < (reducedMotion ? 120 : 33)) return;
    lastFrame = time;
    ctx.clearRect(0, 0, width, height);
    if (!document.body.classList.contains('story-cake')) return;
    var items = positions();
    for (var i = 0; i < items.length; i++) butterfly(items[i], time, i);
    ctx.globalAlpha = 1;
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
}());
