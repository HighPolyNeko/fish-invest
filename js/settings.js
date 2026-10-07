// Пользовательские настройки (тема, громкость). Подключается в <head>, чтобы тема
// применялась до первой отрисовки и страница не мигала. Прогресс игры не затрагивает.
(function () {
  var F = window.Fish = window.Fish || {};
  var KEY = 'rare-fish-settings-v1';
  // fish / button / scene: выбранная косметика (id). Доступность проверяется в cosmetics.js.
  F.CURRENCIES = [
    { sym: '€', name: 'Евро' },
    { sym: '$', name: 'Доллар' },
    { sym: '₽', name: 'Рубль' },
    { sym: '£', name: 'Фунт' },
    { sym: '¥', name: 'Иена' },
    { sym: '🐟', name: 'Рыбки' }
  ];
  var DEFAULTS = { theme: 'dark', volume: 0.5, numfmt: 'words', currency: '€', fish: 'fish', button: 'sand', scene: 'sea' };

  function load() {
    var s = {};
    try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    function str(v, def) { return typeof v === 'string' && /^[a-z]+$/.test(v) ? v : def; }
    return {
      theme: s.theme === 'light' ? 'light' : DEFAULTS.theme,
      volume: typeof s.volume === 'number' && s.volume >= 0 && s.volume <= 1 ? s.volume : DEFAULTS.volume,
      numfmt: s.numfmt === 'sci' ? 'sci' : DEFAULTS.numfmt,   // 'words': 6 тыс, 'sci': 6e3
      currency: F.CURRENCIES.some(function (c) { return c.sym === s.currency; }) ? s.currency : DEFAULTS.currency,
      fish: str(s.fish, DEFAULTS.fish),
      button: str(s.button, DEFAULTS.button),
      scene: str(s.scene, DEFAULTS.scene)
    };
  }

  F.settings = load();

  F.saveSettings = function () {
    try { localStorage.setItem(KEY, JSON.stringify(F.settings)); } catch (e) {}
  };

  // Знак валюты. Только подпись: числа в игре выдуманные и никуда не пересчитываются.
  F.cur = function () { return F.settings.currency; };
  // Подставляет выбранную валюту вместо € в готовой строке (для подсказок, записанных в данных).
  F.cx = function (text) { return text.replace(/€/g, F.cur()); };

  F.applyTheme = function () {
    document.documentElement.setAttribute('data-theme', F.settings.theme);
  };

  F.applyTheme();
})();
