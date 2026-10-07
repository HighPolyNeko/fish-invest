// Мелкие помощники: поиск элементов, форматирование чисел, Telegram.
(function () {
  var F = window.Fish;

  F.tg = window.Telegram && window.Telegram.WebApp;
  if (F.tg) { try { F.tg.ready(); F.tg.expand(); } catch (e) {} }

  F.$ = function (id) { return document.getElementById(id); };

  F.pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };

  F.haptic = function (kind) {
    try { if (F.tg && F.tg.HapticFeedback) F.tg.HapticFeedback.impactOccurred(kind || 'light'); } catch (e) {}
  };

  var UNITS = ['', ' тыс', ' млн', ' млрд', ' трлн', ' квдр', ' квнт', ' скст'];
  F.fmt = function (n) {
    if (!isFinite(n)) return '∞';
    if (n < 10) return n.toFixed(2).replace(/\.?0+$/, '');
    if (n < 1000) return String(Math.floor(n));
    var idx = Math.floor(Math.log10(n) / 3);
    if (idx >= UNITS.length) return n.toExponential(2);
    var v = n / Math.pow(10, idx * 3);
    var s = v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : String(Math.floor(v));
    return s + UNITS[idx];
  };
})();
