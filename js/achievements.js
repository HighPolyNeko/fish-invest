// Достижения: список, проверка, окно со списком.
// Награда скрыта, пока достижение не получено, а подсказка (hint) говорит, как его выполнить.
// reward: { kind: 'fish' | 'button' | 'scene', id } — косметика,
//         { kind: 'bonus', prod?: множитель дохода, click?: множитель клика } — постоянный бонус.
(function () {
  var F = window.Fish, $ = F.$;

  function owned(id) { return F.S.owned[id] || 0; }
  function count(obj) { return Object.keys(obj).length; }

  F.ACH = [
    { id: 'first', name: 'Первый плюс', hint: 'Нажми на рыбу.',
      test: function () { return F.S.stats.clicks >= 1; },
      reward: { kind: 'button', id: 'ocean' } },
    { id: 'c100', name: 'Разминка', hint: 'Нажми на рыбу 100 раз.',
      test: function () { return F.S.stats.clicks >= 100; },
      reward: { kind: 'fish', id: 'puffer' } },
    { id: 'c1000', name: 'Тысяча касаний', hint: 'Нажми на рыбу 1000 раз. Палец это переживёт.',
      test: function () { return F.S.stats.clicks >= 1000; },
      reward: { kind: 'bonus', click: 1.1, text: 'Доход с клика ×1.1' } },
    { id: 'fast50', name: 'Скоростной дядя', hint: 'Нажми на рыбу 50 раз за одну минуту.',
      test: function () { return F.runtime.clickTimes.length >= 50; },
      reward: { kind: 'fish', id: 'octopus' } },
    { id: 'uncle1', name: 'Свой человек на рынке', hint: 'Найми первого дядю.',
      test: function () { return owned('uncle') >= 1; },
      reward: { kind: 'scene', id: 'sunset' } },
    { id: 'uncles3', name: 'Свидетель из Фрязино', hint: 'Стоят угрюмо, руки в карманах. Найми трёх дядей.',
      test: function () { return owned('uncle') >= 3; },
      reward: { kind: 'scene', id: 'fryazino' } },
    { id: 'uncles25', name: 'Множество дядей', hint: 'Собери 25 дядей и дядей-брокеров вместе.',
      test: function () { return F.uncles() >= 25; },
      reward: { kind: 'bonus', prod: 1.05, text: 'Весь доход ×1.05' } },
    { id: 'tank5', name: 'Аквариум на кухне', hint: 'Заведи 5 аквариумов.',
      test: function () { return owned('tank') >= 5; },
      reward: { kind: 'fish', id: 'shrimp' } },
    { id: 'allbiz', name: 'Полный набор', hint: 'Купи каждый вид бизнеса хотя бы по разу.',
      test: function () { return F.BUSINESS.every(function (b) { return owned(b.id) >= 1; }); },
      reward: { kind: 'scene', id: 'deep' } },
    { id: 'm1e6', name: 'Миллион на бумаге', hint: 'Заработай за всё время 1 млн €.',
      test: function () { return F.S.allTime >= 1e6; },
      reward: { kind: 'button', id: 'coral' } },
    { id: 'm1e9', name: 'Миллиард на бумаге', hint: 'Заработай за всё время 1 млрд €. Дяди уже не удивляются.',
      test: function () { return F.S.allTime >= 1e9; },
      reward: { kind: 'bonus', prod: 1.15, text: 'Весь доход ×1.15' } },
    { id: 'pres1', name: 'Вышел в плюс', hint: 'Выйди в плюс на бумаге в первый раз.',
      test: function () { return F.S.prestige >= 1; },
      reward: { kind: 'bonus', prod: 1.05, text: 'Весь доход ×1.05' } },
    { id: 'pres3', name: 'Дяди довольны', hint: 'Доведи доверие дядей до 3.',
      test: function () { return F.S.prestige >= 3; },
      reward: { kind: 'bonus', prod: 1.1, text: 'Весь доход ×1.1' } },
    { id: 'ev5', name: 'Рыбак', hint: 'Поймай 5 рыбок-сюрпризов.',
      test: function () { return F.S.stats.events >= 5; },
      reward: { kind: 'fish', id: 'shark' } },
    { id: 'good10', name: 'Везунчик', hint: 'Пусть рыбки-сюрпризы принесут удачу 10 раз.',
      test: function () { return F.S.stats.good >= 10; },
      reward: { kind: 'bonus', prod: 1.05, text: 'Весь доход ×1.05' } },
    { id: 'bad3', name: 'Дядя перезвонит', hint: 'Доверься совету дяди три раза. Что может пойти не так?',
      test: function () { return F.S.stats.bad >= 3; },
      reward: { kind: 'fish', id: 'tin' } },
    { id: 'idle', name: 'Дядя велел ждать', hint: 'Просто подожди две минуты, не трогая игру.',
      test: function () {
        return !document.hidden && F.cps() > 0 && Date.now() - F.runtime.lastActivity >= 120000;
      },
      reward: { kind: 'fish', id: 'sushi' } },
    { id: 'why', name: 'Любопытный', hint: 'Загляни, откуда берутся деньги.',
      test: function () { return F.S.stats.why >= 1; },
      reward: { kind: 'scene', id: 'swamp' } },
    { id: 'themes5', name: 'Модник', hint: 'Смени тему оформления пять раз.',
      test: function () { return F.S.stats.themes >= 5; },
      reward: { kind: 'button', id: 'mint' } },
    { id: 'night', name: 'Ночной инвестор', hint: 'Поиграй ночью, между полуночью и пятью утра.',
      test: function () { return F.S.stats.clicks >= 1 && new Date().getHours() < 5; },
      reward: { kind: 'button', id: 'night' } },
    { id: 'coll10', name: 'Коллекционер', hint: 'Открой 10 других достижений.',
      test: function () { return count(F.S.ach) >= 10; },
      reward: { kind: 'bonus', prod: 1.1, text: 'Весь доход ×1.1' } }
  ];

  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }

  F.rewardText = function (r) {
    if (r.kind === 'bonus') return r.text;
    var slot = F.COSMETIC_SLOTS.filter(function (s) { return s.key === r.kind; })[0];
    var item = find(F.COSMETICS[r.kind], r.id);
    return slot.label + ': ' + (item.glyph ? item.glyph + ' ' : '') + item.name;
  };

  // Открыт ли вариант косметики: первый в слоте открыт всегда, остальные только за достижение.
  F.cosmeticUnlocked = function (kind, id) {
    if (F.COSMETICS[kind][0].id === id) return true;
    return F.ACH.some(function (a) {
      return a.reward.kind === kind && a.reward.id === id && F.S.ach[a.id];
    });
  };

  // Постоянные бонусы от достижений: ключ 'prod' или 'click'.
  F.achMult = function (key) {
    var m = 1;
    F.ACH.forEach(function (a) {
      if (a.reward.kind === 'bonus' && a.reward[key] && F.S.ach[a.id]) m *= a.reward[key];
    });
    return m;
  };

  // Проверка всех ещё не полученных достижений. Вызывается из игрового цикла.
  F.checkAch = function () {
    var now = Date.now(), won = [];
    F.runtime.clickTimes = F.runtime.clickTimes.filter(function (t) { return now - t < 60000; });
    F.ACH.forEach(function (a) {
      if (!F.S.ach[a.id] && a.test()) {
        F.S.ach[a.id] = now;
        won.push(a);
      }
    });
    if (!won.length) return;
    F.toast('🏆 ' + won.map(function (a) { return a.name + ' (' + F.rewardText(a.reward) + ')'; }).join(' · '));
    F.haptic('medium');
    F.applyCosmetics();
    F.refreshMenus();
    F.save();
  };

  // ---------- окно со списком ----------
  var dlg = $('achievements');

  function renderList() {
    var list = $('ach-list');
    list.textContent = '';
    var done = F.ACH.filter(function (a) { return F.S.ach[a.id]; }).length;
    $('ach-count').textContent = done + ' из ' + F.ACH.length;
    var sorted = F.ACH.slice().sort(function (a, b) { return (F.S.ach[b.id] ? 1 : 0) - (F.S.ach[a.id] ? 1 : 0); });
    sorted.forEach(function (a) {
      var got = !!F.S.ach[a.id];
      var row = document.createElement('div'); row.className = 'row ach' + (got ? '' : ' locked');
      var ico = document.createElement('div'); ico.className = 'ico'; ico.textContent = got ? '🏆' : '🔒';
      var info = document.createElement('div'); info.className = 'info';
      var name = document.createElement('div'); name.className = 'name'; name.textContent = a.name;
      var hint = document.createElement('div'); hint.className = 'desc'; hint.textContent = F.cx(a.hint);
      var rew = document.createElement('div'); rew.className = 'desc reward';
      rew.textContent = 'Награда: ' + (got ? F.rewardText(a.reward) : '???');
      info.appendChild(name); info.appendChild(hint); info.appendChild(rew);
      row.appendChild(ico); row.appendChild(info);
      list.appendChild(row);
    });
  }

  $('ach-btn').addEventListener('click', function () {
    renderList();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  $('ach-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  // «Любопытный»: раскрыли блок «Откуда доход и бонусы»
  $('why').addEventListener('toggle', function () {
    if ($('why').open) F.S.stats.why += 1;
  });
})();
