// Запуск: офлайн-доход, игровой цикл, автосохранение.
(function () {
  var F = window.Fish;

  function offlineText(gain) {
    return 'Пока тебя не было, дяди заработали ' + F.fmt(gain) + ' € (' + Math.round(F.offlineEff() * 100) + '% от обычного).';
  }

  var lastTick = Date.now();
  function tick() {
    var now = Date.now();
    var dt = (now - lastTick) / 1000;
    lastTick = now;
    if (dt <= 0) return;
    if (dt > 5) {
      var gain = F.cps() * Math.min(dt, F.offlineCap()) * F.offlineEff();
      if (gain > 0) {
        F.earn(gain);
        F.toast(offlineText(gain));
      }
    } else {
      F.earn(F.cps() * dt);
      F.tickPerks(dt);
    }
    F.checkAch();
    F.render();
  }

  F.buildShop();
  F.buildUps();
  F.buildPerks();

  var away = (Date.now() - F.S.last) / 1000;
  if (away > 5) {
    var offGain = F.cps() * Math.min(away, F.offlineCap()) * F.offlineEff();
    if (offGain > 0) {
      F.earn(offGain);
      F.toast(offlineText(offGain));
    }
  }
  F.S.last = Date.now();

  F.render();
  setInterval(tick, 100);
  setInterval(F.save, 5000);
  F.scheduleEvent();
  document.addEventListener('visibilitychange', function () { if (document.hidden) F.save(); });
  window.addEventListener('pagehide', F.save);
})();
