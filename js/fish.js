// Рыба на кнопке. Эмодзи у разных шрифтов лежит в строке по-разному, поэтому
// рисуем его на canvas, находим реальные границы рисунка и ставим их ровно в центр круга.
(function () {
  var F = window.Fish, $ = F.$;
  var GLYPH = '🐟';
  var FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  F.drawFish = function () {
    var btn = $('fish'), cv = $('fish-canvas');
    var size = btn.clientWidth;
    if (!size) return;
    var dpr = window.devicePixelRatio || 1;
    var px = Math.round(size * dpr);
    try {
      var off = document.createElement('canvas');
      off.width = off.height = px;
      var o = off.getContext('2d');
      o.font = Math.round(px * 0.56) + 'px ' + FONT;
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillText(GLYPH, px / 2, px / 2);

      var data = o.getImageData(0, 0, px, px).data;
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

      var w = maxX - minX + 1, h = maxY - minY + 1;
      cv.width = cv.height = px;
      cv.style.width = cv.style.height = size + 'px';
      cv.getContext('2d').drawImage(off, minX, minY, w, h,
        Math.round((px - w) / 2), Math.round((px - h) / 2), w, h);
      btn.classList.add('ready');
    } catch (e) {
      btn.classList.remove('ready');   // останется обычный текст-эмодзи
    }
  };

  var timer = null;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(F.drawFish, 120);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(F.drawFish);
  window.addEventListener('load', F.drawFish);
  F.drawFish();
})();
