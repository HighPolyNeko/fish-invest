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

  F.prestigeMult = function () { return 1 + 0.1 * F.S.prestige; };

  F.mult = function () {
    return (1 + 0.01 * F.uncles()) * F.prestigeMult() * F.prodUpMult() * F.buffMult('prod');
  };

  F.cps = function () {
    var sum = 0;
    F.BUSINESS.forEach(function (b) { sum += F.S.owned[b.id] * b.cps; });
    return sum * F.mult();
  };

  F.clickPower = function () {
    return (F.clickUpMult() * F.prestigeMult() + F.cps() * 0.02) * F.buffMult('click');
  };

  F.costN = function (b, n) {
    var g = F.CONFIG.GROWTH;
    return Math.ceil(b.base * Math.pow(g, F.S.owned[b.id]) * (Math.pow(g, n) - 1) / (g - 1));
  };

  F.earn = function (x) { F.S.money += x; F.S.total += x; F.S.allTime += x; };

  F.prestigeGain = function () { return Math.floor(Math.sqrt(F.S.total / 1e6)); };
})();
