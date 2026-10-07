// Состояние игры и сохранение в localStorage.
(function () {
  var F = window.Fish;

  F.fresh = function (prestige, allTime) {
    var owned = {}, bought = {};
    F.BUSINESS.forEach(function (b) { owned[b.id] = 0; });
    return {
      money: 0, total: 0, allTime: allTime || 0, clicks: 0,
      owned: owned, bought: bought, prestige: prestige || 0, last: Date.now(),
      // ach и stats переживают «выход в плюс», сбрасываются только полным сбросом прогресса
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
  F.amount = 1;                  // сколько покупаем за раз (×1, ×10, ×100)
  F.buffs = {};                  // временные эффекты от событий, в сохранение не попадают
  F.runtime = { lastActivity: Date.now(), clickTimes: [] };   // для достижений, не сохраняется
})();
