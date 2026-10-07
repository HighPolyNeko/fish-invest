// Рыба на кнопке и иконка вкладки. Эмодзи у разных шрифтов лежит в строке по-разному,
// поэтому рисуем его на canvas, находим реальные границы рисунка и ставим их ровно в центр.
(function () {
  var F = window.Fish, $ = F.$;
  var FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  // Рисует эмодзи на холсте px×px и возвращает холст с границами рисунка {canvas, x, y, w, h}.
  function inkBox(glyph, px, fontPx) {
    var cv = document.createElement('canvas');
    cv.width = cv.height = px;
    var c = cv.getContext('2d');
    c.font = Math.round(fontPx) + 'px ' + FONT;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(glyph, px / 2, px / 2);

    var data = c.getImageData(0, 0, px, px).data;
    var minX = px, minY = px, maxX = -1, maxY = -1;
    for (var y = 0; y < px; y++) {
      for (var x = 0; x < px; x++) {
        if (data[(y * px + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) throw new Error('empty glyph');
    return { canvas: cv, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  F.drawFish = function () {
    var btn = $('fish'), cv = $('fish-canvas');
    var size = btn.clientWidth;
    if (!size) return;
    var px = Math.round(size * (window.devicePixelRatio || 1));
    try {
      var b = inkBox(F.fishGlyph ? F.fishGlyph() : '🐟', px, px * 0.56);
      cv.width = cv.height = px;
      cv.style.width = cv.style.height = size + 'px';
      cv.getContext('2d').drawImage(b.canvas, b.x, b.y, b.w, b.h,
        Math.round((px - b.w) / 2), Math.round((px - b.h) / 2), b.w, b.h);
      btn.classList.add('ready');
    } catch (e) {
      btn.classList.remove('ready');   // останется обычный текст-эмодзи
    }
  };

  // Иконка вкладки: рыба на весь квадрат 64×64, по центру рисунка.
  F.drawFavicon = function () {
    try {
      var b = inkBox('🐠', 128, 100);
      var out = document.createElement('canvas');
      out.width = out.height = 64;
      var k = Math.min(60 / b.w, 60 / b.h);
      var w = b.w * k, h = b.h * k;
      out.getContext('2d').drawImage(b.canvas, b.x, b.y, b.w, b.h, (64 - w) / 2, (64 - h) / 2, w, h);
      var link = document.querySelector('link[rel="icon"]');
      link.type = 'image/png';
      link.href = out.toDataURL('image/png');
    } catch (e) {}   // останется SVG-иконка из index.html
  };

  var timer = null;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(F.drawFish, 120);
  });
  function redraw() { F.drawFish(); F.drawFavicon(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  window.addEventListener('load', redraw);
  redraw();
})();
