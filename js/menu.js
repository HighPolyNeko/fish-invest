// Меню настроек: тема, громкость, косметика.
(function () {
  var F = window.Fish, $ = F.$;
  var dlg = $('settings'), vol = $('volume'), volText = $('volume-text');

  function syncTheme() {
    document.querySelectorAll('#themes button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.theme === F.settings.theme);
    });
  }
  function syncVolume() {
    vol.value = Math.round(F.settings.volume * 100);
    volText.textContent = vol.value + '%';
  }

  // Варианты косметики: показываем только открытые, закрытые просто считаем,
  // чтобы не раскрывать награды заранее.
  function syncCosmetics() {
    var box = $('cosmetics');
    box.textContent = '';
    var locked = 0;
    F.COSMETIC_SLOTS.forEach(function (slot) {
      var label = document.createElement('div'); label.className = 'set-label'; label.textContent = slot.label;
      var opts = document.createElement('div'); opts.className = 'opts';
      F.COSMETICS[slot.key].forEach(function (item) {
        if (!F.cosmeticUnlocked(slot.key, item.id)) { locked += 1; return; }
        var b = document.createElement('button');
        b.textContent = (item.glyph ? item.glyph + ' ' : '') + item.name;
        b.classList.toggle('on', F.chosen(slot.key).id === item.id);
        b.addEventListener('click', function () {
          F.settings[slot.key] = item.id;
          F.saveSettings(); F.applyCosmetics(); syncCosmetics();
        });
        opts.appendChild(b);
      });
      box.appendChild(label); box.appendChild(opts);
    });
    $('cosm-locked').textContent = locked ? 'Ещё закрыто: ' + locked + '. Открываются за достижения.' : 'Всё открыто.';
  }

  // вызывается, когда открылись новые варианты
  F.refreshMenus = function () { if (dlg.open) syncCosmetics(); };

  $('settings-btn').addEventListener('click', function () {
    syncTheme(); syncVolume(); syncCosmetics();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  $('settings-close').addEventListener('click', function () { dlg.close(); });
  // клик по тёмному фону вокруг окна закрывает его
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  document.querySelectorAll('#themes button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (F.settings.theme !== b.dataset.theme) F.S.stats.themes += 1;
      F.settings.theme = b.dataset.theme;
      F.applyTheme(); F.saveSettings(); syncTheme();
      F.applyCosmetics();   // фон зависит от темы
      F.save();
    });
  });

  vol.addEventListener('input', function () {
    F.settings.volume = vol.value / 100;
    volText.textContent = vol.value + '%';
    F.saveSettings();
  });
  // после отпускания ползунка играем бульк, чтобы было слышно уровень
  vol.addEventListener('change', function () { F.playBubble(); });
})();
