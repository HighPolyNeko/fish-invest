// Состояние игры и сохранение в localStorage.
(function () {
  var F = window.Fish;

  F.fresh = function (prestige, allTime) {
    var owned = {}, bought = {};
    F.BUSINESS.forEach(function (b) { owned[b.id] = 0; });
    return {
      money: 0, total: 0, allTime: allTime || 0, clicks: 0,
      owned: owned, bought: bought, prestige: prestige || 0, last: Date.now(),
      // ach, stats, spent и perks переживают «выход в плюс», сбрасываются только полным сбросом прогресса
      spent: 0,      // сколько очков доверия потрачено на знакомых
      perks: {},     // купленные знакомые
      ach: {},
      stats: { clicks: 0, events: 0, good: 0, bad: 0, themes: 0, why: 0 }
    };
  };

  F.load = function () {
    try {
      var raw = localStorage.getItem(F.CONFIG.KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      var base = F.fresh();
      base.money = +s.money || 0;
      base.total = +s.total || 0;
      base.allTime = +s.allTime || 0;
      base.clicks = +s.clicks || 0;
      base.prestige = +s.prestige || 0;
      base.last = +s.last || Date.now();
      F.BUSINESS.forEach(function (b) { base.owned[b.id] = +(s.owned && s.owned[b.id]) || 0; });
      F.UPGRADES.forEach(function (u) { if (s.bought && s.bought[u.id]) base.bought[u.id] = true; });
      base.spent = Math.min(+s.spent || 0, base.prestige);
      if (s.perks && typeof s.perks === 'object') {
        Object.keys(s.perks).forEach(function (k) { if (s.perks[k]) base.perks[k] = true; });
      }
      if (s.ach && typeof s.ach === 'object') {
        Object.keys(s.ach).forEach(function (k) { if (s.ach[k]) base.ach[k] = +s.ach[k] || 1; });
      }
      Object.keys(base.stats).forEach(function (k) { base.stats[k] = +(s.stats && s.stats[k]) || 0; });
      return base;
    } catch (e) { return null; }
  };

  F.save = function () {
    F.S.last = Date.now();
    try { localStorage.setItem(F.CONFIG.KEY, JSON.stringify(F.S)); } catch (e) {}
  };

  F.S = F.load() || F.fresh();   // сохраняемое состояние
  F.amount = 1;                  // сколько покупаем за раз: 1, 10 или 'max' (на все деньги)
  F.buffs = {};                  // временные эффекты от событий, в сохранение не попадают
  // Служебное, в сохранение не попадает: для достижений, разгона, автокликов и премии.
  F.runtime = { lastActivity: Date.now(), clickTimes: [], combo: 0, lastComboClick: 0, streakStart: 0, autoAcc: 0, lastAutoFloat: 0, bonusTimer: 0 };
})();
