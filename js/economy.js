// Экономика: множители, доход, цены.
(function () {
  var F = window.Fish;

  F.buffMult = function (type) {
    var m = 1, now = Date.now();
    Object.keys(F.buffs).forEach(function (k) {
      if (F.buffs[k].until > now && F.buffs[k].type === type) m *= F.buffs[k].mult;
    });
    return m;
  };

  F.addBuff = function (id, type, mult, seconds, label) {
    F.buffs[id] = { type: type, mult: mult, until: Date.now() + seconds * 1000, label: label };
  };

  F.uncles = function () { return F.S.owned.uncle + F.S.owned.broker; };

  F.prodUpMult = function () {
    var m = 1;
    F.UPGRADES.forEach(function (u) { if (u.type === 'prod' && F.S.bought[u.id]) m *= u.val; });
    return m;
  };

  F.clickUpMult = function () {
    var m = 1;
    F.UPGRADES.forEach(function (u) { if (u.type === 'click' && F.S.bought[u.id]) m *= u.val; });
    return m;
  };

  // Очки доверия, которые не потрачены на знакомых: каждое даёт +10% ко всему.
  F.trustFree = function () { return Math.max(0, F.S.prestige - F.S.spent); };

  F.prestigeMult = function () { return 1 + 0.1 * F.trustFree(); };

  F.mult = function () {
    return (1 + 0.01 * F.uncles()) * F.prestigeMult() * F.prodUpMult() * F.buffMult('prod') *
      F.achMult('prod') * F.comboMult();
  };

  // Доход от бизнесов в секунду (без автокликов).
  F.baseCps = function () {
    var sum = 0;
    F.BUSINESS.forEach(function (b) { sum += F.S.owned[b.id] * b.cps; });
    return sum * F.mult();
  };

  // Полный доход в секунду: бизнесы плюс автоклики дядей (если куплен знакомый).
  F.cps = function () { return F.baseCps() + F.autoCps(); };

  F.clickPower = function () {
    return (F.clickUpMult() * F.prestigeMult() + F.baseCps() * 0.02) * F.buffMult('click') * F.achMult('click');
  };

  F.costN = function (b, n) {
    var g = F.CONFIG.GROWTH;
    var discount = F.hasPerk('discount') ? 0.9 : 1;
    return Math.ceil(b.base * Math.pow(g, F.S.owned[b.id]) * (Math.pow(g, n) - 1) / (g - 1) * discount);
  };

  // Сколько штук бизнеса b купится на все деньги (формула суммы геометрической прогрессии, затем сверка).
  F.maxAffordable = function (b) {
    var g = F.CONFIG.GROWTH, discount = F.hasPerk('discount') ? 0.9 : 1;
    var first = b.base * Math.pow(g, F.S.owned[b.id]) * discount;
    var n = Math.floor(Math.log(1 + F.S.money * (g - 1) / first) / Math.log(g));
    n = Math.max(0, Math.min(n, 100000));
    while (n > 0 && F.costN(b, n) > F.S.money) n -= 1;
    while (n < 100000 && F.costN(b, n + 1) <= F.S.money) n += 1;
    return n;
  };

  // Сколько штук покупает кнопка сейчас: выбранное число или «макс» (минимум 1, чтобы показать цену).
  F.amountFor = function (b) {
    return F.amount === 'max' ? Math.max(1, F.maxAffordable(b)) : F.amount;
  };

  F.earn = function (x) { F.S.money += x; F.S.total += x; F.S.allTime += x; };

  F.prestigeGain = function () { return Math.floor(Math.sqrt(F.S.total / 1e6)); };
})();
