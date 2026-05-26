// KSP太空学习冒险 - 倒计时系统 v1.0
window.KSP = window.KSP || {};
window.KSP.timer = (function() {
  var remaining = 30;
  var intervalId = null;
  var onExpire = null;
  var warningFired = false;
  var expired = false;

  function updateDisplay() {
    var el = document.getElementById('timer');
    if (!el) return;
    el.textContent = remaining;
    el.className = 'timer';
    if (remaining <= 3) el.className += ' timer-critical';
    else if (remaining <= 5) el.className += ' timer-warning';
    if (remaining <= 5 && !warningFired) {
      warningFired = true;
      if (window.KSP && window.KSP.audio) window.KSP.audio.playWarning();
      el.className += ' timer-pulse';
    }
  }

  function tick() {
    remaining--;
    updateDisplay();
    if (remaining <= 0) {
      stop();
      expired = true;
      if (onExpire) onExpire();
    }
  }

  function start(seconds) {
    stop();
    remaining = seconds || 30;
    warningFired = false;
    expired = false;
    updateDisplay();
    intervalId = setInterval(tick, 1000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function getRemaining() { return remaining; }
  function isExpired() { return expired; }
  function setOnExpire(fn) { onExpire = fn; }

  function reset() {
    stop();
    remaining = 30;
    warningFired = false;
    expired = false;
  }

  return {
    start: start,
    stop: stop,
    getRemaining: getRemaining,
    isExpired: isExpired,
    setOnExpire: setOnExpire,
    reset: reset
  };
})();
