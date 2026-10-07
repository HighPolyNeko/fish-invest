// Случайные события. Иконка у всех одна, поэтому заранее не видно, бонус это или штраф.
(function () {
  var F = window.Fish, $ = F.$, fmt = F.fmt;

  var EVENT_ICON = '🐠';

  var GOOD_EVENTS = [
    function () {
      var bonus = Math.max(F.cps() * 45, F.clickPower() * 30);
      F.earn(bonus);
      return 'Редкая рыба! +' + fmt(bonus) + ' ' + F.cur();
    },
    function () {
      F.addBuff('rush', 'prod', 7, 30, 'Час пик: доход ×7');
      return 'Час пик дядей: доход ×7 на 30 секунд.';
    },
    function () {
      F.addBuff('cards', 'click', 10, 15, 'Визитки: клики ×10');
      return 'Дядя раздал визитки: клики ×10 на 15 секунд.';
    },
    function () {
      var bonus = Math.max(F.S.money * 0.1, F.cps() * 20);
      F.earn(bonus);
      return 'Дядя вернул долг. +' + fmt(bonus) + ' ' + F.cur();
    }
  ];

  var BAD_EVENTS = [
    function () {
      var loss = F.S.money * 0.1;
      F.S.money -= loss;
      return 'Ты вложился по совету дяди. Дядя теперь недоступен. −' + fmt(loss) + ' ' + F.cur();
    },
    function () {
      F.addBuff('leak', 'prod', 0.5, 30, 'Течь: доход ×0.5');
      return 'Аквариум дал течь: доход ×0.5 на 30 секунд.';
    },
    function () {
      F.addBuff('silent', 'click', 0.1, 20, 'Молчит: клики ×0.1');
      return 'Дядя перестал отвечать: клики дают в 10 раз меньше на 20 секунд.';
    }
  ];

  function spawnEvent() {
    var stage = $('stage');
    var el = document.createElement('button');
    el.className = 'evt';
    el.textContent = EVENT_ICON;
    var w = stage.clientWidth || 300, h = stage.clientHeight || 230;
    el.style.left = Math.floor(Math.random() * Math.max(10, w - 80)) + 'px';
    el.style.top = Math.floor(Math.random() * Math.max(10, h - 80)) + 'px';
    stage.appendChild(el);
    var gone = false;
    function remove() {
      if (gone) return; gone = true;
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    el.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var good = Math.random() < F.goodChance();
      F.S.stats.events += 1;
      F.S.stats[good ? 'good' : 'bad'] += 1;
      F.toast(F.pick(good ? GOOD_EVENTS : BAD_EVENTS)());
      remove(); F.render(); F.save();
    });
    setTimeout(remove, 9000);
  }

  F.scheduleEvent = function () {
    var delay = (45000 + Math.random() * 45000) * F.eventDelayMult();
    setTimeout(function () { spawnEvent(); F.scheduleEvent(); }, delay);
  };
})();
