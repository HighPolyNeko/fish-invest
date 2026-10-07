// Звуки. Всё синтезируется на лету через Web Audio, файлов нет.
(function () {
  var F = window.Fish, ctx = null;

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // «Бульк»: короткий синус, тон быстро идёт вверх, как у лопающегося пузыря.
  F.playBubble = function () {
    var v = F.settings.volume;
    if (!v) return;
    var c = audio();
    if (!c) return;
    var t = c.currentTime;
    var osc = c.createOscillator(), gain = c.createGain();
    var f0 = 230 + Math.random() * 120;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f0 * 3, t + 0.09);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4 * v, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  };
})();
