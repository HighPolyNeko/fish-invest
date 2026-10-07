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

  // Вехи: когда у бизнеса набирается столько штук, доход этого бизнеса удваивается (вехи накапливаются).
  // После последней из списка новая веха каждые MILESTONE_STEP штук, без конца.
  F.MILESTONES = [25, 50, 100, 150, 200, 250, 300];
  F.MILESTONE_STEP = 100;

  F.UPGRADES = [
    { id: 'card',   name: 'Визитка дяди',           desc: 'Доход с клика ×2', cost: 200,    type: 'click', val: 2 },
    { id: 'voice',  name: 'Уверенный тон',          desc: 'Доход с клика ×2', cost: 2500,   type: 'click', val: 2 },
    { id: 'today',  name: 'Скидка только сегодня',  desc: 'Весь доход ×1.5',  cost: 15000,  type: 'prod',  val: 1.5 },
    { id: 'chat',   name: 'Закрытый чат дядей',     desc: 'Доход с клика ×3', cost: 90000,  type: 'click', val: 3 },
    { id: 'screen', name: 'Скриншот чужой выписки', desc: 'Весь доход ×2',    cost: 400000, type: 'prod',  val: 2 }
  ];

  // Косметика, открываемая за достижения. Первый вариант в каждом слоте открыт с самого начала.
  // button.light / button.dark: два цвета градиента круга с рыбой.
  // scene.dark / scene.light: два цвета фона колонки с рыбой для соответствующей темы.
  F.COSMETICS = {
    fish: [
      { id: 'fish',    name: 'Рыба',     glyph: '🐟' },
      { id: 'puffer',  name: 'Фугу',     glyph: '🐡' },
      { id: 'shrimp',  name: 'Креветка', glyph: '🦐' },
      { id: 'shark',   name: 'Акула',    glyph: '🦈' },
      { id: 'octopus', name: 'Осьминог', glyph: '🐙' },
      { id: 'sushi',   name: 'Суши',     glyph: '🍣' },
      { id: 'tin',     name: 'Шпроты',   glyph: '🥫' }
    ],
    button: [
      { id: 'sand',  name: 'Песок' },
      { id: 'ocean', name: 'Океан',  light: '#3b83b8', dark: '#174463' },
      { id: 'coral', name: 'Коралл', light: '#ffb3a1', dark: '#e0604a' },
      { id: 'mint',  name: 'Мята',   light: '#c9f5e0', dark: '#4cc79a' },
      { id: 'night', name: 'Ночь',   light: '#4a5a78', dark: '#10182b' }
    ],
    scene: [
      { id: 'sea',      name: 'Море' },
      { id: 'sunset',   name: 'Закат',        dark: ['#7a3b4f', '#3a1f3d'], light: ['#ffd9b8', '#ffeedd'] },
      { id: 'fryazino', name: 'Фрязино',      dark: ['#5b6470', '#2c3139'], light: ['#e1e5ea', '#f1f3f5'] },
      { id: 'swamp',    name: 'Поле в Литве', dark: ['#46602f', '#233318'], light: ['#d6e8b8', '#ecf5da'] },
      { id: 'deep',     name: 'Глубина',      dark: ['#10315a', '#050f22'], light: ['#b8cdee', '#dce7f8'] }
    ]
  };
  F.COSMETIC_SLOTS = [
    { key: 'fish',   label: 'Рыба' },
    { key: 'button', label: 'Кнопка' },
    { key: 'scene',  label: 'Фон' }
  ];
})();
