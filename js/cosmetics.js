// Применение выбранной косметики: рыба на кнопке, цвет кнопки, фон колонки с рыбой.
// Если выбранный вариант ещё не открыт (например, после полного сброса прогресса),
// берётся вариант по умолчанию, а сам выбор в настройках не стирается.
(function () {
  var F = window.Fish;

  F.chosen = function (kind) {
    var id = F.settings[kind];
    var list = F.COSMETICS[kind];
    var item = list.filter(function (x) { return x.id === id; })[0];
    return item && F.cosmeticUnlocked(kind, item.id) ? item : list[0];
  };

  F.fishGlyph = function () { return F.chosen('fish').glyph; };

  F.applyCosmetics = function () {
    var root = document.documentElement.style;

    var btn = F.chosen('button');
    if (btn.light) {
      root.setProperty('--fish-light', btn.light);
      root.setProperty('--fish-dark', btn.dark);
    } else {
      root.removeProperty('--fish-light');
      root.removeProperty('--fish-dark');
    }

    var scene = F.chosen('scene');
    var colors = scene[F.settings.theme];
    if (colors) {
      root.setProperty('--sea-light', colors[0]);
      root.setProperty('--sea-mid', colors[1]);
    } else {
      root.removeProperty('--sea-light');
      root.removeProperty('--sea-mid');
    }

    var span = F.$('fish').querySelector('span');
    span.textContent = F.fishGlyph();
    F.drawFish();
  };

  F.applyCosmetics();
})();
