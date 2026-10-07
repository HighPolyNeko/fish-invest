// Меню настроек: тема и громкость.
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

  $('settings-btn').addEventListener('click', function () {
    syncTheme(); syncVolume();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  $('settings-close').addEventListener('click', function () { dlg.close(); });
  // клик по тёмному фону вокруг окна закрывает его
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  document.querySelectorAll('#themes button').forEach(function (b) {
    b.addEventListener('click', function () {
      F.settings.theme = b.dataset.theme;
      F.applyTheme(); F.saveSettings(); syncTheme();
      F.drawFish();
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
