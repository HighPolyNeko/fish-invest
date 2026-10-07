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
      row.appendChild(ico); row.appendChild(info); row.appendChild(btn);
      shop.appendChild(row);
      btn.addEventListener('click', function () { F.buyBusiness(b); });
      shopEls[b.id] = { row: row, desc: desc, cnt: cnt, btn: btn, price: price, act: act };
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
      row.appendChild(info); row.appendChild(btn);
      ups.appendChild(row);
      btn.addEventListener('click', function () { F.buyUpgrade(u); });
      upEls[u.id] = { row: row, btn: btn };
    });
  };

  function breakdownText() {
    var S = F.S, raw = 0;
    F.BUSINESS.forEach(function (b) { raw += S.owned[b.id] * b.cps; });
    var lines = [];
    lines.push('ДОХОД В СЕКУНДУ: ' + fmt(F.cps()) + ' €');
    lines.push('= бизнесы ' + fmt(raw) + ' × множитель ' + F.mult().toFixed(2));
    lines.push('');
    lines.push('МНОЖИТЕЛЬ = (1 + дяди) × (1 + доверие) × улучшения × события × достижения');
    lines.push('• дяди: +' + F.uncles() + '% (дядей и брокеров: ' + F.uncles() + ', каждый даёт +1% ко всему)');
    lines.push('• доверие дядей: +' + (S.prestige * 10) + '% (за выходы в плюс, по +10% за единицу)');
    lines.push('• улучшения на доход: ×' + fmt(F.prodUpMult()));
    lines.push('• временные события: ×' + F.buffMult('prod').toFixed(2));
    lines.push('• достижения: ×' + F.achMult('prod').toFixed(2));
    lines.push('');
    lines.push('ДОХОД ЗА КЛИК: ' + fmt(F.clickPower()) + ' €');
    lines.push('= ' + fmt(F.clickUpMult() * F.prestigeMult()) + ' (клик × улучшения клика × доверие)');
    lines.push('+ ' + fmt(F.cps() * 0.02) + ' (2% от дохода в секунду, поэтому цифра за клик растёт вместе с бизнесом)');
    lines.push('× ' + F.buffMult('click').toFixed(2) + ' (временные события)');
    lines.push('× ' + F.achMult('click').toFixed(2) + ' (достижения)');
    var any = false;
    F.BUSINESS.forEach(function (b) {
      if (S.owned[b.id] > 0) {
        if (!any) { lines.push(''); lines.push('ПО БИЗНЕСАМ:'); any = true; }
        lines.push('• ' + b.name + ' ×' + S.owned[b.id] + ': ' + fmt(S.owned[b.id] * b.cps * F.mult()) + ' €/сек');
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

  F.render = function () {
    var S = F.S;
    if ($('why').open) $('why-body').textContent = breakdownText();
    $('money').textContent = fmt(S.money) + ' €';
    $('cps').textContent = fmt(F.cps()) + ' € в секунду · ' + fmt(F.clickPower()) + ' € за клик';
    renderBuffs();

    F.BUSINESS.forEach(function (b) {
      var e = shopEls[b.id];
      var visible = b.id === F.BUSINESS[0].id || S.owned[b.id] > 0 || S.total >= b.base * 0.4;
      e.row.classList.toggle('hidden', !visible);
      if (!visible) return;
      e.desc.textContent = b.desc + ' (' + fmt(b.cps * F.mult()) + ' €/сек каждый)';
      e.cnt.textContent = S.owned[b.id];
      var c = F.costN(b, F.amount);
      e.price.textContent = fmt(c) + ' €';
      e.act.textContent = 'Купить ×' + F.amount;
      e.btn.disabled = S.money < c;
    });

    var anyUp = false;
    F.UPGRADES.forEach(function (u) {
      var e = upEls[u.id];
      var visible = !S.bought[u.id] && S.total >= u.cost * 0.5;
      e.row.classList.toggle('hidden', !visible);
      if (!visible) return;
      anyUp = true;
      e.btn.textContent = fmt(u.cost) + ' €';
      e.btn.disabled = S.money < u.cost;
    });
    $('ups-wrap').classList.toggle('hidden', !anyUp);

    var gain = F.prestigeGain();
    $('p-count').textContent = S.prestige;
    var claim = $('p-claim');
    claim.textContent = '+' + gain + ' к получению';
    claim.classList.toggle('hidden', gain < 1);
    $('p-desc').textContent = (gain >= 1
      ? 'Очки копятся: можно забрать сейчас +' + gain + ' или подождать, пока их станет больше. Бизнес и улучшения при выходе сгорят.'
      : 'Нужно заработать за этот заход минимум 1 млн €, тогда дяди начнут доверять.')
      + ' Сейчас +' + (S.prestige * 10) + '% к доходу.';
    // доверие = floor(sqrt(заработано за заход / 1 млн)): n-е очко открывается на n² млн €,
    // значит каждое следующее дороже предыдущего
    var from = gain * gain * 1e6, to = (gain + 1) * (gain + 1) * 1e6;
    var left = to - S.total, rate = F.cps();
    $('p-bar').style.width = Math.min(100, Math.max(0, (S.total - from) / (to - from) * 100)) + '%';
    $('p-bar-text').textContent = 'Следующее очко (всего +' + (gain + 1) + ') через ' + fmt(left) + ' € · '
      + (rate > 0 ? 'примерно ' + F.fmtTime(left / rate) + ' при текущем доходе' : 'без дохода не накопить');
    $('p-cost').textContent = 'Это очко стоит ещё ' + fmt(to - from) + ' €, следующее после него дороже на 2 млн €.';
    var pb = $('p-btn');
    pb.disabled = gain < 1;
    if (!pb.dataset.armed) pb.textContent = gain >= 1 ? 'Выйти в плюс' : 'Пока нельзя';
  };
})();
