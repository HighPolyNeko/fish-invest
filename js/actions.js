// Действия игрока: покупки, клик по рыбе, выход в плюс, сброс.
(function () {
  var F = window.Fish, $ = F.$;

  function touch() { F.runtime.lastActivity = Date.now(); }
  document.addEventListener('pointerdown', touch);
  document.addEventListener('keydown', touch);

  F.buyBusiness = function (b) {
    var c = F.costN(b, F.amount);
    if (F.S.money < c) return;
    F.S.money -= c;
    F.S.owned[b.id] += F.amount;
    F.haptic('light');
    F.render(); F.save();
  };

  F.buyUpgrade = function (u) {
    if (F.S.bought[u.id] || F.S.money < u.cost) return;
    F.S.money -= u.cost;
    F.S.bought[u.id] = true;
    F.haptic('medium');
    F.render(); F.save();
  };

  $('fish').addEventListener('click', function (ev) {
    var p = F.clickPower();
    F.earn(p);
    F.S.clicks += 1;
    F.S.stats.clicks += 1;
    F.runtime.clickTimes.push(Date.now());
    F.comboHit();
    var r = $('stage').getBoundingClientRect();
    var x = (ev.clientX || r.left + r.width / 2) - r.left;
    var y = (ev.clientY || r.top + r.height / 2) - r.top;
    F.floatText('+' + F.fmt(p), x, y);
    F.playBubble();
    F.haptic('light');
    F.render();
  });

  document.querySelectorAll('#amounts button').forEach(function (b) {
    b.addEventListener('click', function () {
      F.amount = parseInt(b.dataset.n, 10);
      document.querySelectorAll('#amounts button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      F.render();
    });
  });

  // кнопка с подтверждением вторым нажатием
  function armed(btn, armedText, action) {
    var timer = null;
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      if (btn.dataset.armed) {
        clearTimeout(timer);
        delete btn.dataset.armed;
        action();
        return;
      }
      var original = btn.textContent;
      btn.dataset.armed = '1';
      btn.textContent = armedText;
      timer = setTimeout(function () {
        delete btn.dataset.armed;
        btn.textContent = original;
        F.render();
      }, 3000);
    });
  }

  F.armed = armed;   // нужна и для покупок знакомых

  armed($('p-btn'), 'Точно? Нажми ещё раз', function () {
    var gain = F.prestigeGain();
    if (gain < 1) return;
    var next = F.fresh(F.S.prestige + gain, F.S.allTime);
    next.ach = F.S.ach;
    next.stats = F.S.stats;
    next.spent = F.S.spent;
    next.perks = F.S.perks;
    F.S = next;
    F.toast('Ты вышел в плюс на бумаге. Дяди довольны, доверие +' + gain + '.');
    F.render(); F.save();
  });

  armed($('reset'), 'Точно сбросить? Нажми ещё раз', function () {
    F.S = F.fresh();
    F.buffs = {};
    F.runtime.clickTimes = [];
    F.runtime.combo = 0;
    F.applyCosmetics();
    try { localStorage.removeItem(F.CONFIG.KEY); } catch (e) {}
    F.toast('Прогресс сброшен.');
    $('reset').textContent = 'Сбросить весь прогресс';
    F.render();
  });
})();
