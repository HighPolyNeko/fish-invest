// Пользовательские настройки (тема, громкость). Подключается в <head>, чтобы тема
// применялась до первой отрисовки и страница не мигала. Прогресс игры не затрагивает.
(function () {
  var F = window.Fish = window.Fish || {};
  var KEY = 'rare-fish-settings-v1';
  var DEFAULTS = { theme: 'dark', volume: 0.5 };

  function load() {
    var s = {};
    try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    return {
      theme: s.theme === 'light' ? 'light' : DEFAULTS.theme,
      volume: typeof s.volume === 'number' && s.volume >= 0 && s.volume <= 1 ? s.volume : DEFAULTS.volume
    };
  }

  F.settings = load();

  F.saveSettings = function () {
    try { localStorage.setItem(KEY, JSON.stringify(F.settings)); } catch (e) {}
  };

  F.applyTheme = function () {
    document.documentElement.setAttribute('data-theme', F.settings.theme);
  };

  F.applyTheme();
})();
