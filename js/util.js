// Мелкие помощники: поиск элементов, форматирование чисел и времени.
(function () {
  var F = window.Fish;

  F.$ = function (id) { return document.getElementById(id); };

  F.pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };

  // секунды в короткую запись: «45 с», «12 мин», «3 ч 20 мин», «2 д 5 ч»
  F.fmtTime = function (sec) {
    if (!isFinite(sec)) return 'очень долго';
    sec = Math.max(0, Math.ceil(sec));
    if (sec < 60) return sec + ' с';
    var min = Math.floor(sec / 60);
    if (min < 60) return min + ' мин';
    var h = Math.floor(min / 60);
    if (h < 24) return h + ' ч' + (min % 60 ? ' ' + (min % 60) + ' мин' : '');
    var d = Math.floor(h / 24);
    if (d > 999) return 'очень долго';
    return d + ' д' + (h % 24 ? ' ' + (h % 24) + ' ч' : '');
  };

  var UNITS = ['', ' тыс', ' млн', ' млрд', ' трлн', ' квдр', ' квнт', ' скст'];
  F.fmt = function (n) {
    if (!isFinite(n)) return '∞';
    if (n < 10) return n.toFixed(2).replace(/\.?0+$/, '');
    if (n < 1000) return String(Math.floor(n));
    if (F.settings.numfmt === 'sci') {
      // научная запись: 6000 → 6e3, 1234567 → 1.23e6
      var e = Math.floor(Math.log10(n));
      var m = (n / Math.pow(10, e)).toFixed(2).replace(/\.?0+$/, '');
      if (m === '10') { m = '1'; e += 1; }
      return m + 'e' + e;
    }
    var idx = Math.floor(Math.log10(n) / 3);
    if (idx >= UNITS.length) return n.toExponential(2);
    var v = n / Math.pow(10, idx * 3);
    var s = v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : String(Math.floor(v));
    return s + UNITS[idx];
  };
})();
