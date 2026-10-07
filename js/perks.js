// «Знакомые дяди»: очки доверия можно оставить как есть (+10% к доходу за очко)
// или потратить на знакомых с особыми способностями. Потраченное очко бонус +10% не даёт.
// Знакомые остаются навсегда и переживают «выход в плюс».
(function () {
  var F = window.Fish, $ = F.$, fmt = F.fmt;

  F.PERKS = [
    { id: 'auto', icon: '👆', cost: 2, name: 'Дядя «я сам нажму»',
      desc: 'Дяди сами кликают по рыбе: 0.5 клика в секунду и ещё 0.1 за каждого дядю и дядю-брокера.' },
    { id: 'combo', icon: '☕', cost: 3, name: 'Кофе без сахара',
      desc: 'Чем чаще жмёшь на рыбу, тем быстрее работают дяди: до +50% к доходу. Разгон спадает за 10 секунд без кликов.' },
    { id: 'discount', icon: '🤝', cost: 3, name: 'Скидка по знакомству',
      desc: 'Весь бизнес дешевле на 10%. «Свои люди, берите, не торгуйтесь».' },
    { id: 'ichth', icon: '🎣', cost: 4, name: 'Знакомый ихтиолог',
      desc: 'Рыбки-сюрпризы прилетают на 40% чаще, а удачными оказываются в 85% случаев вместо 70%.' },
    { id: 'offshore', icon: '🌙', cost: 4, name: 'Поле в Литве работает по ночам',
      desc: 'Пока тебя нет, дяди зарабатывают 75% вместо 50% и до 24 часов вместо 8.' },
    { id: 'bonus', icon: '🧾', cost: 5, name: 'Дядя-бухгалтер',
      desc: 'Раз в минуту приносит премию: доход за 15 секунд.' }
  ];

  F.hasPerk = function (id) { return !!(F.S.perks && F.S.perks[id]); };

  // ---------- эффекты ----------
  F.comboMult = function () { return F.hasPerk('combo') ? 1 + 0.01 * F.runtime.combo : 1; };
  F.autoRate = function () { return F.hasPerk('auto') ? 0.5 + 0.1 * F.uncles() : 0; };
  F.autoCps = function () { return F.autoRate() * F.clickPower(); };
  F.goodChance = function () { return F.hasPerk('ichth') ? 0.85 : 0.7; };
  F.eventDelayMult = function () { return F.hasPerk('ichth') ? 0.6 : 1; };
  F.offlineEff = function () { return F.hasPerk('offshore') ? 0.75 : F.CONFIG.OFFLINE_EFF; };
  F.offlineCap = function () { return F.hasPerk('offshore') ? 24 * 3600 : F.CONFIG.OFFLINE_CAP; };

  F.comboHit = function () {
    if (F.hasPerk('combo')) F.runtime.combo = Math.min(50, F.runtime.combo + 1);
  };

  // Вызывается из игрового цикла каждый тик, dt в секундах.
  F.tickPerks = function (dt) {
    var rt = F.runtime;
    rt.combo = Math.max(0, rt.combo - dt * 5);

    var rate = F.autoRate();
    if (rate > 0) {
      // доход автокликов уже учтён в cps(), здесь только показываем, что дяди кликают
      rt.autoAcc += dt * rate;
      var now = Date.now();
      if (rt.autoAcc >= 1) {
        rt.autoAcc = 0;
        if (now - rt.lastAutoFloat > 700) {
          rt.lastAutoFloat = now;
          var st = $('stage');
          F.floatText('🧍 +' + fmt(F.clickPower()),
            st.clientWidth * (0.2 + 0.6 * Math.random()), st.clientHeight * (0.25 + 0.5 * Math.random()));
        }
      }
    }

    if (F.hasPerk('bonus')) {
      rt.bonusTimer += dt;
      if (rt.bonusTimer >= 60) {
        rt.bonusTimer -= 60;
        var prize = F.cps() * 15;
        if (prize > 0) {
          F.earn(prize);
          F.toast('Дядя-бухгалтер принёс премию: +' + fmt(prize) + ' €');
        }
      }
    }
  };

  // ---------- интерфейс ----------
  var els = {};

  F.buildPerks = function () {
    var box = $('perks');
    F.PERKS.forEach(function (p) {
      var row = document.createElement('div'); row.className = 'row perk';
      var ico = document.createElement('div'); ico.className = 'ico'; ico.textContent = p.icon;
      var info = document.createElement('div'); info.className = 'info';
      var name = document.createElement('div'); name.className = 'name'; name.textContent = p.name;
      var desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = p.desc;
      var btn = document.createElement('button'); btn.className = 'buy';
      info.appendChild(name); info.appendChild(desc);
      row.appendChild(ico); row.appendChild(info); row.appendChild(btn);
      box.appendChild(row);
      F.armed(btn, 'Точно? −' + p.cost + ' доверия', function () { buyPerk(p); });
      els[p.id] = { row: row, btn: btn };
    });
  };

  function buyPerk(p) {
    if (F.hasPerk(p.id) || F.trustFree() < p.cost) return;
    F.S.spent += p.cost;
    F.S.perks[p.id] = true;
    F.toast('Знакомый «' + p.name + '» теперь с тобой. Потрачено доверия: ' + p.cost + '.');
    F.haptic('medium');
    F.render(); F.save();
  }

  F.renderPerks = function () {
    var free = F.trustFree();
    $('perks-info').textContent = 'Свободно очков доверия: ' + free + ' (каждое даёт +10% к доходу). '
      + 'Потратишь очко на знакомого, и этот бонус пропадёт, зато знакомый останется навсегда, в том числе после выхода в плюс.';
    F.PERKS.forEach(function (p) {
      var e = els[p.id], have = F.hasPerk(p.id);
      e.row.classList.toggle('owned', have);
      e.btn.disabled = have || free < p.cost;
      if (e.btn.dataset.armed) return;   // пока ждём подтверждения, текст кнопки не трогаем
      e.btn.textContent = have ? 'Есть' : p.cost + ' доверия';
    });
  };
})();
