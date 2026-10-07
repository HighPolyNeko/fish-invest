// Данные игры: настройки, бизнесы, улучшения.
(function () {
  var F = window.Fish = window.Fish || {};

  F.CONFIG = {
    KEY: 'rare-fish-idle-v1',
    GROWTH: 1.15,
    OFFLINE_EFF: 0.5,
    OFFLINE_CAP: 8 * 3600
  };

  F.BUSINESS = [
    { id: 'uncle', icon: '🧍‍♂️',   name: 'Дядя',                 desc: 'Знает человека на рынке. Какого, не говорит.', base: 15,      cps: 0.1 },
    { id: 'tank', icon: '🐡',    name: 'Аквариум',             desc: 'Рыба в нём не редкая, но дядя уверяет, что редкая.', base: 100,     cps: 1 },
    { id: 'broker', icon: '🕴️',  name: 'Дядя-брокер',          desc: 'Гарантирует доходность. Чью именно, не уточняет.', base: 1100,    cps: 8 },
    { id: 'field', icon: '🌾',   name: 'Поле в Литве',         desc: 'Как оно связано с рыбой, спрашивать не принято.', base: 12000,   cps: 47 },
    { id: 'cluster', icon: '🏭', name: 'Рыбный кластер',       desc: 'Слово «кластер» добавляет к цене ещё ноль.', base: 130000,  cps: 260 },
    { id: 'fund', icon: '🏦',    name: 'Фонд множества дядей', desc: 'Дядя дяди тоже дядя. Все в доле.', base: 1.4e6,   cps: 1400 },
    { id: 'rare', icon: '🐋',    name: 'Реально редкая рыба',  desc: 'Единственная в мире. Дядя говорит, таких уже три.', base: 2e7,     cps: 7800 }
  ];

  F.UPGRADES = [
    { id: 'card',   name: 'Визитка дяди',           desc: 'Доход с клика ×2', cost: 200,    type: 'click', val: 2 },
    { id: 'voice',  name: 'Уверенный тон',          desc: 'Доход с клика ×2', cost: 2500,   type: 'click', val: 2 },
    { id: 'today',  name: 'Скидка только сегодня',  desc: 'Весь доход ×1.5',  cost: 15000,  type: 'prod',  val: 1.5 },
    { id: 'chat',   name: 'Закрытый чат дядей',     desc: 'Доход с клика ×3', cost: 90000,  type: 'click', val: 3 },
    { id: 'screen', name: 'Скриншот чужой выписки', desc: 'Весь доход ×2',    cost: 400000, type: 'prod',  val: 2 }
  ];
})();
