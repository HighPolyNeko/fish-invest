// «Знакомые дяди»: очки доверия можно оставить как есть (+10% к доходу за очко)
// или потратить на знакомых с особыми способностями. Потраченное очко бонус +10% не даёт.
// Знакомые остаются навсегда и переживают «выход в плюс».
(function () {
  var F = window.Fish, $ = F.$, fmt = F.fmt;

  F.PERKS = [
    { id: 'auto', icon: '👆', cost: 2, name: 'Дядя «я сам нажму»',
      desc: 'Дяди сами кликают по рыбе: 0.5 клика в секунду и ещё 0.1 за каждого дядю и дядю-брокера.' },
    { id: 'combo', icon: '☕', cost: 3, name: 'Кофе без сахара',
      desc: 'Жми на рыбу без остановки пару секунд, и дяди начнут разгоняться: до +50% к доходу. Копится быстро, а после 3 секунд без кликов так же быстро спадает.' },
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

  // Разгон. Параметры: пауза между кликами, после которой серия считается оборванной (мс),
  // сколько надо кликать без остановки, чтобы разгон начался (мс), прибавка за клик, максимум,
  // сколько ждать без кликов до спада (мс), скорость спада (очков в секунду).
  var STREAK_GAP = 700, START_AFTER = 2000, PER_CLICK = 2, MAX_COMBO = 50, DECAY_AFTER = 3000, DECAY_RATE = 10;

  F.comboHit = function () {
    if (!F.hasPerk('combo')) return;
    var rt = F.runtime, now = Date.now();
    // пока разгона нет, пауза дольше STREAK_GAP обрывает серию и счёт 2 секунд начинается заново
    if (rt.combo <= 0 && now - rt.lastComboClick > STREAK_GAP) rt.streakStart = now;
    rt.lastComboClick = now;
    if (rt.combo > 0 || now - rt.streakStart >= START_AFTER) {
      rt.combo = Math.min(MAX_COMBO, rt.combo + PER_CLICK);
    }
  };

  // Вызывается из игрового цикла каждый тик, dt в секундах.
  F.tickPerks = function (dt) {
    var rt = F.runtime;
    // разгон спадает только после паузы в кликах, зато быстро
    if (rt.combo > 0 && Date.now() - rt.lastComboClick > DECAY_AFTER) {
      rt.combo = Math.max(0, rt.combo - dt * DECAY_RATE);
    }

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
          F.toast('Дядя-бухгалтер принёс премию: +' + fmt(prize) + ' ' + F.cur());
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
