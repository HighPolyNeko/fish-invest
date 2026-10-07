// Отрисовка интерфейса.
(function () {
  var F = window.Fish, $ = F.$, fmt = F.fmt;

  var toastTimer = null;
  F.toast = function (msg) {
    $('toast').textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $('toast').textContent = ''; }, 5000);
  };

  F.floatText = function (text, x, y) {
    var el = document.createElement('div');
    el.className = 'float';
    el.textContent = text;
    el.style.left = Math.max(0, x - 20) + 'px';
    el.style.top = Math.max(0, y - 30) + 'px';
    $('stage').appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
  };

  var shopEls = {}, upEls = {};

  // Кнопка покупки с подписью под ней: в информативном режиме там написано, как изменится доход.
  F.buyWrap = function (btn) {
    var wrap = document.createElement('div'); wrap.className = 'buywrap';
    var delta = document.createElement('div'); delta.className = 'delta';
    wrap.appendChild(btn); wrap.appendChild(delta);
    return { wrap: wrap, delta: delta };
  };

  function signed(n) { return (n < 0 ? '−' : '+') + fmt(Math.abs(n)); }

  // Подпись про доход: число и проценты. Если дохода ещё не было, процент считать не от чего.
  function incomeText(w) {
    var d = w.c1 - w.c0;
    if (Math.abs(d) < 1e-9) return '';
    var pct = w.c0 > 0 ? ' (' + (d < 0 ? '−' : '+') + Math.abs(d / w.c0 * 100).toFixed(1) + '%)' : ' (доход появится)';
    return signed(d) + ' ' + F.cur() + '/сек' + pct;
  }
  function clickText(w) {
    var d = w.k1 - w.k0;
    if (Math.abs(d) < 1e-9 || w.k0 <= 0) return '';
    return signed(d) + ' ' + F.cur() + ' за клик (' + (d < 0 ? '−' : '+') + Math.abs(d / w.k0 * 100).toFixed(1) + '%)';
  }

  // Показывает подпись под кнопкой, если включён информативный режим.
  F.setDelta = function (el, change, kind) {
    if (!F.settings.info) { el.textContent = ''; return; }
    var w = F.whatIf(change);
    var income = incomeText(w), click = kind === 'click' ? clickText(w) : '';
    el.textContent = [click, income].filter(Boolean).join('\n');
    el.classList.toggle('neg', (w.c1 - w.c0) < -1e-9);
  };

  F.buildShop = function () {
    var shop = $('shop');
    F.BUSINESS.forEach(function (b) {
      var row = document.createElement('div'); row.className = 'row';
      var ico = document.createElement('div'); ico.className = 'ico';
      var glyph = document.createElement('span'); glyph.textContent = b.icon;
      var cnt = document.createElement('div'); cnt.className = 'cnt';   // сколько уже куплено, значок на иконке
      ico.appendChild(glyph); ico.appendChild(cnt);
      var info = document.createElement('div'); info.className = 'info';
      var name = document.createElement('div'); name.className = 'name'; name.textContent = b.name;
      var desc = document.createElement('div'); desc.className = 'desc';
      var btn = document.createElement('button'); btn.className = 'buy two';
      var price = document.createElement('span'); price.className = 'price';
      var act = document.createElement('span'); act.className = 'act';
      btn.appendChild(price); btn.appendChild(act);
      info.appendChild(name); info.appendChild(desc);
      var bw = F.buyWrap(btn);
      row.appendChild(ico); row.appendChild(info); row.appendChild(bw.wrap);
      shop.appendChild(row);
      btn.addEventListener('click', function () { F.buyBusiness(b); });
      shopEls[b.id] = { row: row, desc: desc, cnt: cnt, btn: btn, price: price, act: act, delta: bw.delta };
    });
  };

  F.buildUps = function () {
    var ups = $('ups');
    F.UPGRADES.forEach(function (u) {
      var row = document.createElement('div'); row.className = 'row';
      var info = document.createElement('div'); info.className = 'info';
      var name = document.createElement('div'); name.className = 'name'; name.textContent = u.name;
      var desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = u.desc;
      var btn = document.createElement('button'); btn.className = 'buy';
      info.appendChild(name); info.appendChild(desc);
      var bw = F.buyWrap(btn);
      row.appendChild(info); row.appendChild(bw.wrap);
      ups.appendChild(row);
      btn.addEventListener('click', function () { F.buyUpgrade(u); });
      upEls[u.id] = { row: row, btn: btn, delta: bw.delta };
    });
  };

  function breakdownText() {
    var S = F.S, raw = 0;
    F.BUSINESS.forEach(function (b) { raw += S.owned[b.id] * b.cps * F.milestoneMult(b); });
    var lines = [];
    lines.push('ДОХОД В СЕКУНДУ: ' + fmt(F.cps()) + ' ' + F.cur());
    lines.push('= бизнесы ' + fmt(raw) + ' × множитель ' + F.mult().toFixed(2));
    if (F.autoRate() > 0) {
      lines.push('+ автоклики дядей ' + fmt(F.autoCps()) + ' (' + F.autoRate().toFixed(2) + ' клика в секунду)');
    }
    lines.push('');
    lines.push('МНОЖИТЕЛЬ = (1 + дяди) × (1 + доверие) × улучшения × события × достижения × разгон');
    lines.push('• дяди: +' + F.uncles() + '% (дядей и брокеров: ' + F.uncles() + ', каждый даёт +1% ко всему)');
    lines.push('• доверие дядей: +' + (F.trustFree() * 10) + '% (свободных очков: ' + F.trustFree() + ', по +10% за очко)');
    if (F.hasPerk('combo')) lines.push('• разгон от кликов: ×' + F.comboMult().toFixed(2));
    lines.push('• улучшения на доход: ×' + fmt(F.prodUpMult()));
    lines.push('• временные события: ×' + F.buffMult('prod').toFixed(2));
    lines.push('• достижения: ×' + F.achMult('prod').toFixed(2));
    lines.push('');
    lines.push('ДОХОД ЗА КЛИК: ' + fmt(F.clickPower()) + ' ' + F.cur());
    lines.push('= ' + fmt(F.clickUpMult() * F.prestigeMult()) + ' (клик × улучшения клика × доверие)');
    lines.push('+ ' + fmt(F.baseCps() * 0.02) + ' (2% от дохода бизнесов в секунду, поэтому цифра за клик растёт вместе с бизнесом)');
    lines.push('× ' + F.buffMult('click').toFixed(2) + ' (временные события)');
    lines.push('× ' + F.achMult('click').toFixed(2) + ' (достижения)');
    var any = false;
    F.BUSINESS.forEach(function (b) {
      if (S.owned[b.id] > 0) {
        if (!any) { lines.push(''); lines.push('ПО БИЗНЕСАМ:'); any = true; }
        lines.push('• ' + b.name + ' ×' + S.owned[b.id] + ': ' + fmt(S.owned[b.id] * b.cps * F.milestoneMult(b) * F.mult()) + ' ' + F.cur() + '/сек' + (F.milestonesDone(b) ? ' (вехи ×' + F.milestoneMult(b) + ')' : ''));
      }
    });
    return lines.join('\n');
  }

  var buffsKey = '';
  function renderBuffs() {
    var now = Date.now(), list = [];
    Object.keys(F.buffs).forEach(function (k) {
      if (F.buffs[k].until <= now) { delete F.buffs[k]; return; }
      list.push(F.buffs[k]);
    });
    var key = list.map(function (b) { return b.label + Math.ceil((b.until - now) / 1000); }).join('|');
    if (key === buffsKey) return;
    buffsKey = key;
    var box = $('buffs');
    box.textContent = '';
    list.forEach(function (b) {
      var chip = document.createElement('span');
      chip.className = 'buff' + (b.mult < 1 ? ' bad' : '');
      chip.textContent = b.label + ' · ' + Math.ceil((b.until - now) / 1000) + ' с';
      box.appendChild(chip);
    });
  }

  // Индикатор разгона: всегда на одном месте, при нуле пишет 0, а пока идёт разгон, мигает.
  var comboShown = '';
  function renderCombo() {
    var box = $('combo');
    var has = F.hasPerk('combo');
    box.classList.toggle('hidden', !has);
    if (!has) return;
    var v = Math.round(F.runtime.combo);
    var text = String(v) + '|' + Math.round(F.comboMult() * 100);
    if (text === comboShown) return;
    comboShown = text;
    $('combo-val').textContent = v + ' / 50 · ×' + F.comboMult().toFixed(2);
    $('combo-bar').style.width = (F.runtime.combo / 50 * 100) + '%';
    box.classList.toggle('blink', v > 0);
  }

  F.render = function () {
    var S = F.S;
    if ($('why').open) $('why-body').textContent = breakdownText();
    $('money').textContent = fmt(S.money) + ' ' + F.cur();
    $('cps').textContent = fmt(F.cps()) + ' ' + F.cur() + ' в секунду · ' + fmt(F.clickPower()) + ' ' + F.cur() + ' за клик';
    renderBuffs();
    renderCombo();

    F.BUSINESS.forEach(function (b) {
      var e = shopEls[b.id];
      var visible = b.id === F.BUSINESS[0].id || S.owned[b.id] > 0 || S.total >= b.base * 0.4;
      e.row.classList.toggle('hidden', !visible);
      if (!visible) return;
      var nextM = F.nextMilestone(b);
      e.desc.textContent = b.desc + ' (' + fmt(b.cps * F.milestoneMult(b) * F.mult()) + ' ' + F.cur() + '/сек каждый)'
        + (nextM ? ' До вехи ×2: ещё ' + (nextM - S.owned[b.id]) + ' шт.' : '');
      e.cnt.textContent = S.owned[b.id];
      var n = F.amountFor(b);
      var c = F.costN(b, n);
      e.price.textContent = fmt(c) + ' ' + F.cur();
      e.act.textContent = 'Купить ×' + n;
      e.btn.disabled = S.money < c;
      F.setDelta(e.delta, function (s) { s.owned[b.id] += n; });
    });

    var anyUp = false;
    F.UPGRADES.forEach(function (u) {
      var e = upEls[u.id];
      var visible = !S.bought[u.id] && S.total >= u.cost * 0.5;
      e.row.classList.toggle('hidden', !visible);
      if (!visible) return;
      anyUp = true;
      e.btn.textContent = fmt(u.cost) + ' ' + F.cur();
      e.btn.disabled = S.money < u.cost;
      F.setDelta(e.delta, function (s) { s.bought[u.id] = true; }, 'click');
    });
    $('ups-wrap').classList.toggle('hidden', !anyUp);

    var gain = F.prestigeGain();
    $('p-count').textContent = F.trustFree();
    var claim = $('p-claim');
    claim.textContent = '+' + gain + ' к получению';
    claim.classList.toggle('hidden', gain < 1);
    $('p-desc').textContent = (gain >= 1
      ? 'Очки копятся: можно забрать сейчас +' + gain + ' или подождать, пока их станет больше. Бизнес и улучшения при выходе сгорят.'
      : 'Нужно заработать за всё время ' + fmt(F.trustThreshold(S.prestige + 1)) + ' ' + F.cur() + ', тогда дяди дадут следующее очко. Цена очков не сбрасывается.')
      + ' Свободное доверие даёт +' + (F.trustFree() * 10) + '% к доходу (всего заработано очков: ' + S.prestige + ').';
    // Очков всего n = уже забрано + ждёт получения. n-е очко открывается при n³ · 1 млн заработанного за всё время,
    // значит каждое следующее дороже предыдущего, а выход в плюс цену не сбрасывает.
    var have = S.prestige + gain;   // очков уже заслужено
    var from = F.trustThreshold(have), to = F.trustThreshold(have + 1);
    var left = to - S.allTime, rate = F.cps();
    $('p-bar').style.width = Math.min(100, Math.max(0, (S.allTime - from) / (to - from) * 100)) + '%';
    $('p-bar-text').textContent = 'Следующее очко (всего ' + (have + 1) + ') через ' + fmt(left) + ' ' + F.cur() + ' · '
      + (rate > 0 ? 'примерно ' + F.fmtTime(left / rate) + ' при текущем доходе' : 'без дохода не накопить');
    $('p-cost').textContent = 'Это очко стоит ещё ' + fmt(to - from) + ' ' + F.cur() + ', следующее после него дороже на '
      + fmt(F.trustThreshold(have + 2) - to - (to - from)) + ' ' + F.cur() + '.';
    F.renderPerks();
    var pb = $('p-btn');
    pb.disabled = gain < 1;
    if (!pb.dataset.armed) pb.textContent = gain >= 1 ? 'Выйти в плюс' : 'Пока нельзя';
  };
})();
