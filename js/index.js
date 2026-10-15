/*
  Shape Shifter
  =============
  A canvas experiment by Kenneth Cachia
  http://www.kennethcachia.com
  Updated code
  ------------
  https://github.com/kennethcachia/Shape-Shifter
*/
var S = {
  init: function () {
    var action = window.location.href,
        i = action.indexOf('?a='),
        defaultAction = '|#countdown 3|盲盒拆开成功|今日份快乐加载中|先确认一下|小楠老师今天|不用太懂事|烦恼先放门外|好运排队入场|快乐多来几份|奶茶蛋糕都算|收到很多祝福的话|就请大方照单全收|新的一岁|所得皆所期|所失皆无碍|所求皆如愿|所行皆坦途|岁岁常欢愉|年年皆胜意|平安常相伴|万事皆顺意|小楠老师|生日快乐|#portrait|#cake|';
    S.Drawing.init('.canvas');
    document.body.classList.add('body--ready');

    function startSequence() {
      S.UI.simulate(i !== -1 ? decodeURIComponent(action.substring(i + 3)) : defaultAction);
    }

    if (window.birthdayStarted) startSequence();
    else window.addEventListener('birthday:start', startSequence, { once: true });

    S.Drawing.loop(function () {
      S.Shape.render();
    });
  }
};
S.Drawing = (function () {
  var canvas,
      context,
      renderFn,
      dpr = Math.min(window.devicePixelRatio || 1, 1.5),
      lastRenderTime = 0,
      finalFrameCleared = false,
      minFrameInterval = window.innerWidth < 600 ? 33 : 20,
      requestFrame = window.requestAnimationFrame       ||
                     window.webkitRequestAnimationFrame ||
                     window.mozRequestAnimationFrame    ||
                     window.oRequestAnimationFrame      ||
                     window.msRequestAnimationFrame     ||
                     function(callback) {
                       window.setTimeout(callback, 1000 / 60);
                     };
  return {
    init: function (el) {
      canvas = document.querySelector(el);
      context = canvas.getContext('2d');
      this.adjustCanvas();
      window.addEventListener('resize', function (e) {
        S.Drawing.adjustCanvas();
      });
    },
    loop: function (fn, timestamp) {
      renderFn = !renderFn ? fn : renderFn;
      if (document.body.classList.contains('story-finished')) {
        if (!finalFrameCleared) {
          this.clearFrame();
          finalFrameCleared = true;
        }
        requestFrame.call(window, this.loop.bind(this, renderFn));
        return;
      }
      finalFrameCleared = false;
      var portraitInterval = document.body.classList.contains('story-portrait') ? 33 : minFrameInterval;
      if (!portraitInterval || !timestamp || timestamp - lastRenderTime >= portraitInterval) {
        lastRenderTime = timestamp || 0;
        this.clearFrame();
        renderFn();
      }
      requestFrame.call(window, this.loop.bind(this, renderFn));
    },
    adjustCanvas: function () {
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      context.scale(dpr, dpr);
      minFrameInterval = w < 600 ? 33 : 20;
    },
    clearFrame: function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    getArea: function () {
      return { w: window.innerWidth, h: window.innerHeight };
    },
    drawCircle: function (p, c) {
      context.fillStyle = c.render();
      context.beginPath();
      var mobileRadius = window.innerWidth < 600;
      context.arc(p.x, p.y, mobileRadius
        ? Math.max(1.05, Math.min(3.65, p.z * .9))
        : Math.max(.82, Math.min(3.2, p.z * .78)), 0, 2 * Math.PI, true);
      context.closePath();
      context.fill();
    }
  }
}());
S.UI = (function () {
  var canvas = document.querySelector('.canvas'),
      interval,
      isTouch = false, //('ontouchstart' in window || navigator.msMaxTouchPoints),
      resizeTimer,
      time,
      maxShapeSize = 45,
      firstAction = true,
      sequence = [],
      cmd = '#';
  function formatTime(date) {
    var h = date.getHours(),
        m = date.getMinutes();
    m = m < 10 ? '0' + m : m;
    return h + ':' + m;
  }
  function getValue(value) {
    return value && value.split(' ')[1];
  }
  function getAction(value) {
    value = value && value.split(' ')[0];
    return value && value[0] === cmd && value.substring(1);
  }
  function reset(destroy) {
    clearTimeout(interval);
    sequence = [];
    time = null;
    destroy && S.Shape.switchShape(S.ShapeBuilder.letter(''));
  }
  function performAction(value) {
    sequence = (typeof(value) === 'object' ? value : value.split('|')).filter(function (item) {
      return item !== '';
    });

    function next() {
      var current = sequence.shift(),
          action,
          actionValue;

      if (typeof current === 'undefined') {
        window.dispatchEvent(new Event('birthday:final'));
        return;
      }

      action = getAction(current);
      actionValue = getValue(current);

      switch (action) {
        case 'countdown':
          var count = parseInt(actionValue, 10) || 3;
          function countdown() {
            if (count <= 0) {
              next();
              return;
            }
            S.Shape.switchShape(S.ShapeBuilder.letter(count, 5), true, true);
            count--;
            interval = setTimeout(countdown, 1000);
          }
          countdown();
          return;
        case 'rectangle':
          actionValue = actionValue && actionValue.split('x');
          actionValue = (actionValue && actionValue.length === 2) ? actionValue : [maxShapeSize, maxShapeSize / 2];
          S.Shape.switchShape(S.ShapeBuilder.rectangle(Math.min(maxShapeSize, parseInt(actionValue[0], 10)), Math.min(maxShapeSize, parseInt(actionValue[1], 10))));
          break;
        case 'circle':
          actionValue = parseInt(actionValue, 10) || maxShapeSize;
          actionValue = Math.min(actionValue, maxShapeSize);
          S.Shape.switchShape(S.ShapeBuilder.circle(actionValue));
          break;
        case 'time':
          var t = formatTime(new Date());
          time = t;
          S.Shape.switchShape(S.ShapeBuilder.letter(time));
          break;
        case 'cake':
          document.body.classList.remove('story-portrait');
          document.body.classList.add('story-cake');
          S.Shape.switchShape(S.ShapeBuilder.cake(), true);
          break;
        case 'portrait':
          document.body.classList.remove('story-cake');
          document.body.classList.add('story-portrait');
          S.Shape.switchShape(S.ShapeBuilder.portrait(), true);
          break;
        default:
          document.body.classList.remove('story-portrait');
          document.body.classList.remove('story-cake');
          S.Shape.switchShape(S.ShapeBuilder.letter(current[0] === cmd ? 'What?' : current));
          if (!window.birthdayMusicStarted && current.indexOf('小楠老师') !== -1) {
            window.birthdayMusicStarted = true;
            window.dispatchEvent(new Event('birthday:music'));
          }
      }

      var isCakeFrame = current === '#cake',
          isPortraitFrame = current === '#portrait';
      var mobilePause = window.innerWidth < 600 ? 4200 : 3200;
      interval = setTimeout(next, sequence.length > 0 ? (isPortraitFrame ? (window.innerWidth < 600 ? 6000 : 5200) : mobilePause) : (isCakeFrame ? 6000 : (window.innerWidth < 600 ? 4300 : 3400)));
    }

    clearTimeout(interval);
    next();
  }
  function bindEvents() {
    canvas.addEventListener('click', function (e) {
      var overlay = document.querySelector('.overlay');
      if (overlay) overlay.classList.remove('overlay--visible');
    });
  }
  function init() {
    bindEvents();
    isTouch && document.body.classList.add('touch');
  }
  // Init
  init();
  return {
    simulate: function (action) {
      performAction(action);
    }
  }
}());
S.UI.Tabs = (function () {
  var tabs = document.querySelector('.tabs'),
      labels = document.querySelector('.tabs-labels'),
      triggers = document.querySelectorAll('.tabs-label'),
      panels = document.querySelectorAll('.tabs-panel');
  function activate(i) {
    triggers[i].classList.add('tabs-label--active');
    panels[i].classList.add('tabs-panel--active');
  }
  function bindEvents() {
    labels.addEventListener('click', function (e) {
      var el = e.target,
          index;
      if (el.classList.contains('tabs-label')) {
        for (var t = 0; t < triggers.length; t++) {
          triggers[t].classList.remove('tabs-label--active');
          panels[t].classList.remove('tabs-panel--active');
          if (el === triggers[t]) {
            index = t;
          }
        }
        activate(index);
      }
    });
  }
  function init() {
    activate(0);
    bindEvents();
  }
  // Init
  init();
}());
S.Point = function (args) {
  this.x = args.x;
  this.y = args.y;
  this.color = args.color || null;
  this.z = args.z;
  this.a = args.a;
  this.h = args.h;
};
S.Color = function (r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};
S.Color.prototype = {
  render: function () {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
  }
};
S.Dot = function (x, y) {
  this.p = new S.Point({
    x: x,
    y: y,
    z: 2.8 + Math.random() * .55,
    a: 1,
    h: 0
  });
  this.e = 0.0;
  this.s = true;
  var tint = Math.random();
  this.c = tint > 0.90
    ? new S.Color(255, 190, 218, this.p.a)
    : (tint > 0.84 ? new S.Color(255, 226, 174, this.p.a) : new S.Color(255, 255, 255, this.p.a));
  this.tc = { r: this.c.r, g: this.c.g, b: this.c.b };
  this.t = this.clone();
  this.q = [];
};
S.Dot.prototype = {
  clone: function () {
    return new S.Point({
      x: this.p.x,
      y: this.p.y,
      z: this.p.z,
      a: this.p.a,
      h: this.p.h
    });
  },
  _draw: function () {
    this.c.a = this.p.a;
    S.Drawing.drawCircle(this.p, this.c);
  },
  _moveTowards: function (n) {
    var details = this.distanceTo(n, true),
        dx = details[0],
        dy = details[1],
        d = details[2],
        e = Math.min(this.e * d, 32);
    if (this.p.h === -1) {
      this.p.x = n.x;
      this.p.y = n.y;
      return true;
    }
    if (d > 1) {
      this.p.x -= ((dx / d) * e);
      this.p.y -= ((dy / d) * e);
    } else {
      if (this.p.h > 0) {
        this.p.h--;
      } else {
        return true;
      }
    }
    return false;
  },
  _update: function () {
	this.c.r += (this.tc.r - this.c.r) * 0.08;
	this.c.g += (this.tc.g - this.c.g) * 0.08;
	this.c.b += (this.tc.b - this.c.b) * 0.08;
    if (this._moveTowards(this.t)) {
      var p = this.q.shift();
      if (p) {
        this.t.x = p.x || this.p.x;
        this.t.y = p.y || this.p.y;
        this.t.z = p.z || this.p.z;
        this.t.a = p.a || this.p.a;
        this.p.h = p.h || 0;
      } else {
        if (this.s) {
          this.p.x -= Math.sin(Math.random() * 3.142);
          this.p.y -= Math.sin(Math.random() * 3.142);
        } else {
          this.move(new S.Point({
            x: this.p.x + (Math.random() * 50) - 25,
            y: this.p.y + (Math.random() * 50) - 25,
          }));
        }
      }
    }
    this.p.a += (this.t.a - this.p.a) * 0.12;
    this.p.a = Math.max(0.08, Math.min(1, this.p.a));
    d = this.p.z - this.t.z;
    this.p.z = Math.max(1, this.p.z - (d * 0.05));
  },
  distanceTo: function (n, details) {
    var dx = this.p.x - n.x,
        dy = this.p.y - n.y,
        d = Math.sqrt(dx * dx + dy * dy);
    return details ? [dx, dy, d] : d;
  },
  move: function (p, avoidStatic) {
    if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
      this.q.push(p);
    }
  },
  setTargetColor: function (color) {
    this.tc = { r: color[0], g: color[1], b: color[2] };
  },
  render: function () {
    this._update();
    this._draw();
  }
}
S.ShapeBuilder = (function () {
  var gap = window.innerWidth < 600 ? 6 : 8,
      shapeCanvas = document.createElement('canvas'),
      shapeContext = shapeCanvas.getContext('2d'),
      fontSize = 500,
      fontFamily = 'Microsoft YaHei, PingFang SC, Noto Sans CJK SC, STKaiti, KaiTi, sans-serif';
  function fit() {
    shapeCanvas.width = Math.floor(window.innerWidth / gap) * gap;
    shapeCanvas.height = Math.floor(window.innerHeight / gap) * gap;
    shapeContext.fillStyle = 'red';
    shapeContext.textBaseline = 'middle';
    shapeContext.textAlign = 'center';
  }
  function processCanvas(sampleGap) {
    var pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data,
        step = sampleGap || gap,
        dots = [],
        fx = shapeCanvas.width,
        fy = shapeCanvas.height,
        w = 0,
        h = 0;
    for (var y = 0; y < shapeCanvas.height; y += step) {
      for (var x = 0; x < shapeCanvas.width; x += step) {
        var p = (y * shapeCanvas.width + x) * 4;
        if (pixels[p + 3] > 0) {
          dots.push(new S.Point({
            x: x,
            y: y,
            color: (pixels[p] !== 255 || pixels[p + 1] !== 0 || pixels[p + 2] !== 0)
              ? [pixels[p], pixels[p + 1], pixels[p + 2]]
              : null
          }));
          w = x > w ? x : w;
          h = y > h ? y : h;
          fx = x < fx ? x : fx;
          fy = y < fy ? y : fy;
        }
      }
    }
    return { dots: dots, w: w + fx, h: h + fy };
  }
  function setFontSize(s) {
    shapeContext.font = '600 ' + s + 'px ' + fontFamily;
  }
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  function init() {
    fit();
    window.addEventListener('resize', fit);
  }
  // Init
  init();
  return {
    portrait: function () {
      var w = shapeCanvas.width,
          h = shapeCanvas.height,
          scale = Math.min(w * .94 / 900, h * .92 / 820),
          ox = (w - 900 * scale) / 2,
          oy = (h - 820 * scale) / 2;
      shapeContext.clearRect(0, 0, w, h);
      shapeContext.save();
      shapeContext.translate(ox, oy);
      shapeContext.scale(scale, scale);
      shapeContext.lineCap = 'round';
      shapeContext.lineJoin = 'round';

      // 女孩：侧身、长发、长裙，姿态参考照片但完全由矢量形状重新绘制。
      shapeContext.fillStyle = '#39283f';
      shapeContext.beginPath();
      shapeContext.moveTo(520, 75);
      shapeContext.bezierCurveTo(472, 112, 460, 178, 484, 237);
      shapeContext.bezierCurveTo(462, 292, 447, 369, 470, 505);
      shapeContext.bezierCurveTo(454, 570, 440, 657, 468, 754);
      shapeContext.bezierCurveTo(533, 786, 656, 783, 716, 748);
      shapeContext.bezierCurveTo(704, 625, 707, 519, 682, 429);
      shapeContext.bezierCurveTo(729, 296, 704, 118, 628, 78);
      shapeContext.closePath();
      shapeContext.fill();

      shapeContext.fillStyle = '#6c435a';
      shapeContext.beginPath();
      shapeContext.moveTo(495, 103);
      shapeContext.bezierCurveTo(464, 190, 482, 280, 464, 382);
      shapeContext.bezierCurveTo(451, 463, 451, 569, 471, 647);
      shapeContext.bezierCurveTo(493, 547, 510, 436, 526, 326);
      shapeContext.bezierCurveTo(541, 223, 557, 137, 588, 91);
      shapeContext.closePath();
      shapeContext.fill();

      shapeContext.fillStyle = '#edb99e';
      shapeContext.beginPath();
      shapeContext.moveTo(545, 128);
      shapeContext.bezierCurveTo(573, 103, 623, 110, 642, 145);
      shapeContext.lineTo(628, 185);
      shapeContext.lineTo(609, 199);
      shapeContext.lineTo(620, 218);
      shapeContext.bezierCurveTo(596, 243, 557, 225, 539, 196);
      shapeContext.lineTo(520, 176);
      shapeContext.lineTo(541, 168);
      shapeContext.closePath();
      shapeContext.fill();
      shapeContext.fillStyle = '#6f3c51';
      shapeContext.beginPath();
      shapeContext.moveTo(522, 128);
      shapeContext.bezierCurveTo(550, 80, 632, 72, 669, 129);
      shapeContext.bezierCurveTo(678, 172, 664, 238, 638, 274);
      shapeContext.lineTo(615, 225);
      shapeContext.bezierCurveTo(637, 174, 624, 128, 580, 119);
      shapeContext.bezierCurveTo(564, 151, 540, 168, 518, 180);
      shapeContext.closePath();
      shapeContext.fill();
      shapeContext.strokeStyle = '#b56b78';
      shapeContext.lineWidth = 7;
      [[520, 123, 548, 91], [500, 183, 480, 263], [515, 259, 482, 353], [649, 122, 684, 250]].forEach(function (strand) {
        shapeContext.beginPath();
        shapeContext.moveTo(strand[0], strand[1]);
        shapeContext.quadraticCurveTo(strand[0] - 4, (strand[1] + strand[3]) / 2, strand[2], strand[3]);
        shapeContext.stroke();
      });
      shapeContext.fillStyle = '#4b2c3c';
      shapeContext.beginPath();
      shapeContext.ellipse(568, 154, 7, 4, -.12, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.strokeStyle = '#7e4055';
      shapeContext.lineWidth = 4;
      shapeContext.beginPath();
      shapeContext.moveTo(563, 139); shapeContext.quadraticCurveTo(575, 134, 586, 140);
      shapeContext.moveTo(555, 190); shapeContext.quadraticCurveTo(566, 197, 578, 190);
      shapeContext.stroke();

      shapeContext.fillStyle = '#29243b';
      shapeContext.beginPath();
      shapeContext.moveTo(508, 245);
      shapeContext.lineTo(635, 237);
      shapeContext.bezierCurveTo(672, 274, 676, 328, 659, 385);
      shapeContext.lineTo(544, 410);
      shapeContext.bezierCurveTo(519, 354, 493, 303, 508, 245);
      shapeContext.fill();
      shapeContext.strokeStyle = '#f0b399';
      shapeContext.lineWidth = 18;
      shapeContext.beginPath();
      shapeContext.moveTo(625, 269);
      shapeContext.quadraticCurveTo(593, 355, 532, 430);
      shapeContext.stroke();
      shapeContext.fillStyle = '#f0b399';
      shapeContext.beginPath();
      shapeContext.arc(532, 430, 13, 0, Math.PI * 2);
      shapeContext.fill();

      shapeContext.fillStyle = '#4b3150';
      shapeContext.beginPath();
      shapeContext.moveTo(544, 370);
      shapeContext.bezierCurveTo(592, 383, 648, 376, 676, 409);
      shapeContext.lineTo(733, 755);
      shapeContext.bezierCurveTo(657, 786, 534, 783, 457, 752);
      shapeContext.lineTo(514, 409);
      shapeContext.closePath();
      shapeContext.fill();
      shapeContext.fillStyle = '#d9898c';
      [[535, 464], [597, 516], [650, 449], [560, 604], [685, 625], [512, 692], [632, 710]].forEach(function (flower) {
        shapeContext.beginPath();
        shapeContext.arc(flower[0], flower[1], 13, 0, Math.PI * 2);
        shapeContext.fill();
        shapeContext.fillStyle = '#f4d17e';
        shapeContext.arc(flower[0] + 3, flower[1] - 2, 4, 0, Math.PI * 2);
        shapeContext.fill();
        shapeContext.fillStyle = '#d9898c';
      });
      shapeContext.fillStyle = '#e7bf9f';
      shapeContext.fillRect(500, 753, 71, 13);
      shapeContext.fillRect(659, 753, 73, 13);
      shapeContext.strokeStyle = '#8e5b83';
      shapeContext.lineWidth = 6;
      [[534, 426, 518, 738], [596, 420, 590, 748], [655, 428, 680, 744]].forEach(function (fold) {
        shapeContext.beginPath();
        shapeContext.moveTo(fold[0], fold[1]);
        shapeContext.quadraticCurveTo((fold[0] + fold[2]) / 2 + 9, 578, fold[2], fold[3]);
        shapeContext.stroke();
      });

      // 小狗：蓬松身体、尖耳朵和牵引绳，放在女孩左侧。
      shapeContext.fillStyle = '#fff4df';
      shapeContext.beginPath();
      shapeContext.ellipse(214, 682, 116, 73, 0, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.beginPath();
      shapeContext.ellipse(137, 625, 68, 72, 0, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.beginPath();
      shapeContext.moveTo(94, 584); shapeContext.lineTo(103, 526); shapeContext.lineTo(139, 580); shapeContext.closePath(); shapeContext.fill();
      shapeContext.beginPath();
      shapeContext.moveTo(163, 580); shapeContext.lineTo(192, 532); shapeContext.lineTo(201, 609); shapeContext.closePath(); shapeContext.fill();
      shapeContext.fillStyle = '#d3c1c1';
      shapeContext.beginPath();
      shapeContext.ellipse(124, 641, 17, 12, 0, 0, Math.PI * 2);
      shapeContext.ellipse(159, 641, 17, 12, 0, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.fillStyle = '#383044';
      shapeContext.beginPath();
      shapeContext.arc(117, 618, 5, 0, Math.PI * 2);
      shapeContext.arc(163, 618, 5, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.fillStyle = '#e99a9c';
      shapeContext.beginPath();
      shapeContext.ellipse(140, 650, 17, 9, 0, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.fillStyle = '#d3c1c1';
      shapeContext.beginPath();
      shapeContext.ellipse(178, 735, 25, 10, 0, 0, Math.PI * 2);
      shapeContext.ellipse(252, 738, 25, 10, 0, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.strokeStyle = '#fff4df';
      shapeContext.lineWidth = 20;
      shapeContext.beginPath();
      shapeContext.moveTo(125, 716); shapeContext.lineTo(122, 744);
      shapeContext.moveTo(198, 722); shapeContext.lineTo(200, 748);
      shapeContext.stroke();
      shapeContext.strokeStyle = '#d0b6aa';
      shapeContext.lineWidth = 12;
      shapeContext.beginPath();
      shapeContext.moveTo(294, 641); shapeContext.bezierCurveTo(333, 612, 330, 578, 305, 564);
      shapeContext.stroke();
      shapeContext.strokeStyle = '#73a9c9';
      shapeContext.lineWidth = 9;
      shapeContext.beginPath();
      shapeContext.moveTo(92, 658); shapeContext.lineTo(255, 658); shapeContext.stroke();
      shapeContext.strokeStyle = '#dfe7ee';
      shapeContext.lineWidth = 4;
      shapeContext.beginPath();
      shapeContext.moveTo(532, 430); shapeContext.quadraticCurveTo(405, 512, 255, 658); shapeContext.stroke();
      shapeContext.strokeStyle = '#fff4df';
      shapeContext.lineWidth = 15;
      shapeContext.beginPath();
      shapeContext.moveTo(320, 718); shapeContext.quadraticCurveTo(274, 761, 243, 717); shapeContext.stroke();
      // 明亮细轮廓：让人物和小狗在深色背景中更容易辨认。
      shapeContext.strokeStyle = '#ffd4e2';
      shapeContext.lineWidth = 8;
      shapeContext.beginPath();
      shapeContext.moveTo(520, 75);
      shapeContext.bezierCurveTo(472, 112, 460, 178, 484, 237);
      shapeContext.bezierCurveTo(460, 316, 447, 391, 470, 505);
      shapeContext.bezierCurveTo(454, 570, 440, 657, 468, 754);
      shapeContext.bezierCurveTo(533, 786, 656, 783, 716, 748);
      shapeContext.bezierCurveTo(704, 625, 707, 519, 682, 429);
      shapeContext.bezierCurveTo(729, 296, 704, 118, 628, 78);
      shapeContext.bezierCurveTo(589, 58, 550, 59, 520, 75);
      shapeContext.stroke();
      shapeContext.strokeStyle = '#fff0ce';
      shapeContext.lineWidth = 7;
      shapeContext.beginPath();
      shapeContext.ellipse(214, 682, 116, 73, 0, 0, Math.PI * 2);
      shapeContext.moveTo(205, 625);
      shapeContext.ellipse(137, 625, 68, 72, 0, 0, Math.PI * 2);
      shapeContext.moveTo(94, 584); shapeContext.lineTo(103, 526); shapeContext.lineTo(139, 580);
      shapeContext.moveTo(163, 580); shapeContext.lineTo(192, 532); shapeContext.lineTo(201, 609);
      shapeContext.stroke();
      shapeContext.restore();
      return processCanvas(7);
    },
    circle: function (d) {
      var r = Math.max(0, d) / 2;
      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
      shapeContext.beginPath();
      shapeContext.arc(r * gap, r * gap, r * gap, 0, 2 * Math.PI, false);
      shapeContext.fill();
      shapeContext.closePath();
      return processCanvas();
    },
    letter: function (l, sampleGap) {
      var s = 0;
      setFontSize(fontSize);
      s = Math.min(fontSize,
                  (shapeCanvas.width / shapeContext.measureText(l).width) * 0.8 * fontSize,
                  (shapeCanvas.height / fontSize) * (isNumber(l) ? 1 : 0.45) * fontSize);
      setFontSize(s);
      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
      shapeContext.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2);
      return processCanvas(sampleGap);
    },
    cake: function () {
      var cx = shapeCanvas.width / 2,
          cy = shapeCanvas.height / 2,
          cakeWidth = Math.min(shapeCanvas.width * .7, 460),
          tierHeight = Math.min(72, Math.max(42, shapeCanvas.height * .085)),
          top = cy - tierHeight * 2.35;

      function roundedTier(x, y, w, h, radius) {
        shapeContext.beginPath();
        shapeContext.moveTo(x + radius, y);
        shapeContext.lineTo(x + w - radius, y);
        shapeContext.quadraticCurveTo(x + w, y, x + w, y + radius);
        shapeContext.lineTo(x + w, y + h - radius);
        shapeContext.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        shapeContext.lineTo(x + radius, y + h);
        shapeContext.quadraticCurveTo(x, y + h, x, y + h - radius);
        shapeContext.lineTo(x, y + radius);
        shapeContext.quadraticCurveTo(x, y, x + radius, y);
        shapeContext.fill();
      }

      function icingLine(x, y, w) {
        shapeContext.beginPath();
        shapeContext.moveTo(x, y);
        shapeContext.lineTo(x + w, y);
        for (var drop = x + 18; drop < x + w - 12; drop += 38) {
          shapeContext.arc(drop, y + 7, 7, 0, Math.PI);
        }
        shapeContext.lineTo(x + w, y + 12);
        shapeContext.lineTo(x, y + 12);
        shapeContext.closePath();
        shapeContext.fill();
      }

      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
      var tierScales = [1, .86, .72, .58],
          tierColors = ['#b84f75', '#d96f82', '#ed938c', '#f3b09a'];
      for (var tier = 0; tier < tierScales.length; tier++) {
        var tierWidth = cakeWidth * tierScales[tier],
            tierY = top + tierHeight * (3 - tier);
        shapeContext.fillStyle = tierColors[tier];
        roundedTier(cx - tierWidth / 2, tierY, tierWidth, tierHeight, 15 - tier);
      }

      shapeContext.fillStyle = '#fff1df';
      for (var icing = 0; icing < tierScales.length; icing++) {
        var icingWidth = cakeWidth * tierScales[icing];
        icingLine(cx - icingWidth / 2, top + tierHeight * (3 - icing) + 2, icingWidth);
      }

      shapeContext.fillStyle = '#8e3d62';
      for (var stripe = 0; stripe < tierScales.length; stripe++) {
        var stripeWidth = cakeWidth * tierScales[stripe];
        shapeContext.fillRect(cx - stripeWidth / 2 + 10, top + tierHeight * (3 - stripe) + tierHeight * .62, stripeWidth - 20, 5);
      }

      var candleOffsets = [-cakeWidth * .3, -cakeWidth * .15, 0, cakeWidth * .15, cakeWidth * .3];
      candleOffsets.forEach(function (offset, index) {
        var candleHeight = 42 + (index === 2 ? 15 : (index % 2 ? 6 : 0)), candleX = cx + offset;
        shapeContext.fillStyle = index === 2 ? '#7fc9bd' : (index % 2 ? '#e58bad' : '#8c76d8');
        shapeContext.fillRect(candleX - 6, top - candleHeight, 12, candleHeight);
        shapeContext.fillStyle = '#fff0bc';
        for (var band = 0; band < 3; band++) {
          shapeContext.fillRect(candleX - 6, top - candleHeight + 8 + band * 13, 12, 4);
        }
        shapeContext.fillStyle = '#ffca62';
        shapeContext.beginPath();
        shapeContext.moveTo(candleX, top - candleHeight - 24);
        shapeContext.quadraticCurveTo(candleX - 13, top - candleHeight - 8, candleX, top - candleHeight + 1);
        shapeContext.quadraticCurveTo(candleX + 13, top - candleHeight - 8, candleX, top - candleHeight - 24);
        shapeContext.fill();
        shapeContext.fillStyle = '#fff7cf';
        shapeContext.beginPath();
        shapeContext.arc(candleX, top - candleHeight - 9, 4, 0, Math.PI * 2);
        shapeContext.fill();
      });

      shapeContext.fillStyle = '#f8d7bd';
      shapeContext.beginPath();
      shapeContext.ellipse(cx, top + tierHeight * 4 + 19, cakeWidth * .61, 12, 0, 0, Math.PI * 2);
      shapeContext.fill();
      shapeContext.fillStyle = '#b85e83';
      shapeContext.fillRect(cx - cakeWidth * .58, top + tierHeight * 4 + 10, cakeWidth * 1.16, 7);

      shapeContext.fillStyle = '#ffe08c';
      [[-.34, .48], [.05, .22], [.34, .48], [-.18, .86], [.2, .84]].forEach(function (dot) {
        shapeContext.beginPath();
        shapeContext.arc(cx + dot[0] * cakeWidth, top + dot[1] * tierHeight * 4, 6, 0, Math.PI * 2);
        shapeContext.fill();
      });
      shapeContext.fillStyle = '#fff0f2';
      [[-.06, .16], [.17, .58], [-.34, .72]].forEach(function (dot) {
        shapeContext.beginPath();
        shapeContext.arc(cx + dot[0] * cakeWidth, top + dot[1] * tierHeight * 4, 5, 0, Math.PI * 2);
        shapeContext.fill();
      });

      function balloon(x, y, color) {
        shapeContext.fillStyle = color;
        shapeContext.beginPath();
        shapeContext.ellipse(x, y, 23, 30, 0, 0, Math.PI * 2);
        shapeContext.fill();
        shapeContext.beginPath();
        shapeContext.moveTo(x - 5, y + 27);
        shapeContext.lineTo(x, y + 34);
        shapeContext.lineTo(x + 5, y + 27);
        shapeContext.fill();
        shapeContext.strokeStyle = '#e6b2c2';
        shapeContext.lineWidth = 2;
        shapeContext.beginPath();
        shapeContext.moveTo(x, y + 34);
        shapeContext.quadraticCurveTo(x + 16, y + 72, x + 5, top + tierHeight * 4 + 8);
        shapeContext.stroke();
      }
      balloon(cx - cakeWidth * .62, top + tierHeight * 2.15, '#8fb6e8');
      balloon(cx + cakeWidth * .62, top + tierHeight * 1.8, '#f39ab2');

      // 蛋糕周围的流星轨迹，落成粒子后会与蛋糕一起汇聚。
      [[-.78, -.72, -.45, -.5, '#ffd47d'], [.8, -.62, .48, -.38, '#9de4ff'],
       [-.82, .18, -.53, .34, '#f7a6ca'], [.84, .26, .56, .42, '#c9b5ff']].forEach(function (trail) {
        var sx = cx + trail[0] * cakeWidth, sy = cy + trail[1] * tierHeight * 4,
            ex = cx + trail[2] * cakeWidth, ey = cy + trail[3] * tierHeight * 4;
        shapeContext.strokeStyle = trail[4];
        shapeContext.lineWidth = 6;
        shapeContext.beginPath();
        shapeContext.moveTo(sx, sy);
        shapeContext.quadraticCurveTo((sx + ex) / 2, sy - 34, ex, ey);
        shapeContext.stroke();
        shapeContext.lineWidth = 2;
        shapeContext.beginPath();
        shapeContext.moveTo(sx - 24, sy + 10);
        shapeContext.quadraticCurveTo((sx + ex) / 2 - 10, sy - 12, ex - 6, ey + 8);
        shapeContext.stroke();
      });

      shapeContext.fillStyle = '#ffe7a4';
      [[-.78, -.72], [-.5, -.78], [-.26, -.68], [.25, -.72], [.52, -.8], [.8, -.62],
       [-.82, .18], [-.7, .48], [.76, .12], [.84, .42], [-.64, .9], [.64, .92]].forEach(function (sparkle, index) {
        var sx = cx + sparkle[0] * cakeWidth,
            sy = cy + sparkle[1] * tierHeight * 4;
        shapeContext.fillStyle = index % 3 === 0 ? '#fff2b5' : (index % 3 === 1 ? '#ffc4da' : '#b9e9ff');
        shapeContext.beginPath();
        shapeContext.arc(sx, sy, index % 2 ? 5 : 7, 0, Math.PI * 2);
        shapeContext.fill();
        shapeContext.fillRect(sx - 2, sy - 15, 4, 30);
        shapeContext.fillRect(sx - 15, sy - 2, 30, 4);
      });

      // 两朵小型烟花补足节庆感，避免遮住蛋糕主体。
      [[cx - cakeWidth * .58, top - tierHeight * .72, '#ffb4d0'],
       [cx + cakeWidth * .6, top - tierHeight * .58, '#a9dfff']].forEach(function (burst) {
        for (var ray = 0; ray < 10; ray++) {
          var angle = Math.PI * 2 * ray / 10,
              inner = 10,
              outer = 30 + (ray % 2) * 8;
          shapeContext.strokeStyle = burst[2];
          shapeContext.lineWidth = 4;
          shapeContext.beginPath();
          shapeContext.moveTo(burst[0] + Math.cos(angle) * inner, burst[1] + Math.sin(angle) * inner);
          shapeContext.lineTo(burst[0] + Math.cos(angle) * outer, burst[1] + Math.sin(angle) * outer);
          shapeContext.stroke();
        }
      });
      return processCanvas();
    },
    rectangle: function (w, h) {
      var dots = [],
          width = gap * w,
          height = gap * h;
      for (var y = 0; y < height; y += gap) {
        for (var x = 0; x < width; x += gap) {
          dots.push(new S.Point({
            x: x,
            y: y,
          }));
        }
      }
      return { dots: dots, w: width, h: height };
    }
  };
}());
S.Shape = (function () {
  var dots = [],
      width = 0,
      height = 0,
      cx = 0,
      cy = 0,
      themeIndex = -1,
      transitionMode = -1,
      colorThemes = [
        [[255, 145, 184], [255, 205, 224], [255, 246, 250]],
        [[255, 202, 105], [255, 229, 166], [255, 250, 228]],
        [[194, 159, 255], [226, 209, 255], [250, 246, 255]],
        [[125, 203, 255], [190, 230, 255], [244, 251, 255]],
        [[255, 137, 139], [255, 194, 174], [255, 244, 238]],
        [[128, 231, 192], [190, 247, 224], [245, 255, 251]]
      ];
  function compensate() {
    var a = S.Drawing.getArea();
    cx = a.w / 2 - width / 2;
    cy = a.h / 2 - height / 2;
  }
  return {
    shuffleIdle: function () {
      var a = S.Drawing.getArea();
      for (var d = 0; d < dots.length; d++) {
        if (!dots[d].s) {
          dots[d].move({
            x: Math.random() * a.w,
            y: Math.random() * a.h
          });
        }
      }
    },
    switchShape: function (n, fast, crisp) {
      var size,
          a = S.Drawing.getArea();
      width = n.w;
      height = n.h;
      compensate();
      if (n.dots.length > dots.length) {
        size = n.dots.length - dots.length;
        for (var d = 1; d <= size; d++) {
          dots.push(new S.Dot(a.w / 2, a.h / 2));
        }
      }
      themeIndex = (themeIndex + 1) % colorThemes.length;
      transitionMode = (transitionMode + 1) % 4;
      var theme = colorThemes[themeIndex];
      for (var colorDot = 0; colorDot < dots.length; colorDot++) {
        var colorChoice = Math.random();
        dots[colorDot].setTargetColor(theme[colorChoice > 0.92 ? 1 : 0]);
      }
      var d = 0,
          i = 0;
      while (n.dots.length > 0) {
        i = Math.floor(Math.random() * n.dots.length);
        var target = n.dots[i];
        dots[d].q = [];
        dots[d].t = dots[d].clone();
        dots[d].t.a = .08;
        dots[d].p.a = .12;
        dots[d].p.h = 0;
        dots[d].e = crisp ? 0.58 : (fast ? 0.32 : (dots[d].s ? 0.22 : 0.18));
        dots[d].setTargetColor(target.color || (Math.random() > 0.92 ? theme[1] : theme[0]));
        var detour = Math.min(46, a.w * .11),
            jitter = (Math.random() - .5) * 18,
            detourX = transitionMode === 0 ? detour : (transitionMode === 1 ? -detour : jitter),
            detourY = transitionMode === 2 ? -detour : (transitionMode === 3 ? detour : jitter);
        if (dots[d].s) {
          dots[d].move(new S.Point({
            x: target.x + cx + detourX,
            y: target.y + cy + detourY,
            z: 2.1 + Math.random() * .55,
            a: .12,
            h: crisp ? 0 : (fast ? 8 : 14)
          }));
        } else {
          dots[d].move(new S.Point({
            x: target.x + cx + detourX,
            y: target.y + cy + detourY,
            z: 1.9 + Math.random() * .5,
            a: .12,
            h: crisp ? 0 : (fast ? 8 : 14)
          }));
        }
        dots[d].s = true;
        dots[d].move(new S.Point({
          x: target.x + cx,
          y: target.y + cy,
          a: 1,
          z: 2.8 + Math.random() * .35,
          h: 0
        }));
        n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1));
        d++;
      }
      for (var i = d; i < dots.length; i++) {
        if (dots[i].s) {
          dots[i].q = [];
          dots[i].t = dots[i].clone();
          dots[i].p.h = 0;
          dots[i].move(new S.Point({
            z: 1.5 + Math.random() * .6,
            a: Math.random(),
            h: 20
          }));
          dots[i].s = false;
          dots[i].e = 0.04;
          dots[i].move(new S.Point({
            x: Math.random() * a.w,
            y: Math.random() * a.h,
            a: 0.05,
            z: 1 + Math.random() * 0.8,
            h: 0
          }));
        }
      }
    },
    render: function () {
      for (var d = 0; d < dots.length; d++) {
        dots[d].render();
      }
    }
  }
}());
S.init();
