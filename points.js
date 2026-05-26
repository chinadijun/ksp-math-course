// KSP太空学习冒险 - 积分系统 v2.0 (100题≈100积分)
window.KSP = window.KSP || {};
window.KSP.points = (function() {
  var currentPoints = 0;
  var totalPoints = 0;
  var streak = 0;
  var hintsUsed = 0;
  var allCorrect = true;
  var questionStartTime = 0;

  function load() {
    var data = JSON.parse(localStorage.getItem('ksp-points') || '{}');
    totalPoints = data.total || 0;
  }

  function save() {
    localStorage.setItem('ksp-points', JSON.stringify({ total: totalPoints }));
  }

  function startQuestion() {
    questionStartTime = Date.now();
  }

  function useHint() {
    hintsUsed++;
    currentPoints -= 1;
    display();
  }

  function award(correct) {
    if (correct) {
      streak++;
      var pts = 1; // 基础1分
      var elapsed = (Date.now() - questionStartTime) / 1000;
      if (elapsed <= 10) pts += 1; // 快速答题+1
      if (streak >= 3) pts += 1; // 连续答对3题+1
      if (streak >= 5) pts += 1; // 连续答对5题再+1
      currentPoints += pts;
    } else {
      streak = 0;
      allCorrect = false;
      // 答错不扣分
    }
    display();
  }

  function awardTimerPenalty() {
    streak = 0;
    allCorrect = false;
    // 超时不扣分
    display();
  }

  function completeModule() {
    currentPoints += 3; // 通关基础+3
    if (allCorrect && hintsUsed === 0) currentPoints += 5; // 完美通关+5
    var earned = Math.max(0, currentPoints);
    totalPoints += earned;
    save();
    return earned;
  }

  function deduct(amount) {
    totalPoints -= amount;
    if (totalPoints < 0) totalPoints = 0;
    save();
  }

  function getTotal() { return totalPoints; }
  function getCurrent() { return currentPoints; }
  function getStreak() { return streak; }
  function isAllCorrect() { return allCorrect; }
  function getHintsUsed() { return hintsUsed; }

  function display() {
    var el = document.getElementById('pointsDisplay');
    if (el) el.textContent = '⭐ ' + (totalPoints + Math.max(0, currentPoints));
  }

  function resetModule() {
    currentPoints = 0;
    streak = 0;
    hintsUsed = 0;
    allCorrect = true;
  }

  load();

  return {
    load: load,
    save: save,
    startQuestion: startQuestion,
    useHint: useHint,
    award: award,
    awardTimerPenalty: awardTimerPenalty,
    completeModule: completeModule,
    deduct: deduct,
    getTotal: getTotal,
    getCurrent: getCurrent,
    getStreak: getStreak,
    isAllCorrect: isAllCorrect,
    getHintsUsed: getHintsUsed,
    display: display,
    resetModule: resetModule
  };
})();
