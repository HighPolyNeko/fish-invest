// Бегущая строка новостей сверху. Новости лежат в data/news.js, порядок случайный,
// одна и та же новость два раза подряд не показывается.
(function () {
  var F = window.Fish, $ = F.$;
  var list = F.NEWS || [];
  var box = $('news'), track = $('news-track'), text = $('news-text');
  var SPEED = 80;       // пикселей в секунду
  var last = -1;        // номер новости, показанной последней

  if (list.length === 0) return;   // новостей нет: строка так и остаётся скрытой
  box.classList.remove('hidden');
  document.body.classList.add('has-news');

  function nextIndex() {
    if (list.length === 1) return 0;
    var i;
    do { i = Math.floor(Math.random() * list.length); } while (i === last);
    return i;
  }

  function show() {
    last = nextIndex();
    text.textContent = list[last];
    var from = box.clientWidth, to = -text.offsetWidth;
    track.style.setProperty('--from', from + 'px');
    track.style.setProperty('--to', to + 'px');
    track.style.animationDuration = Math.max(6, (from - to) / SPEED) + 's';
    // перезапуск анимации с нуля
    track.classList.remove('run');
    void track.offsetWidth;
    track.classList.add('run');
  }

  track.addEventListener('animationend', show);
  show();
})();
