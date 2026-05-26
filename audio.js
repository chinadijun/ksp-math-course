// KSP太空学习冒险 - 音效系统 v2.0 (儿童友好版)
window.KSP = window.KSP || {};
window.KSP.audio = (function() {
  let ctx = null;
  let bgmGain = null, sfxGain = null, masterGain = null;
  let muted = false;
  let bgmPlaying = false;
  let bgmOscillators = [];
  let bgmInterval = null;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    bgmGain = ctx.createGain();
    bgmGain.connect(masterGain);
    bgmGain.gain.value = 0.12;
    sfxGain = ctx.createGain();
    sfxGain.connect(masterGain);
    sfxGain.gain.value = 0.5;
    muted = localStorage.getItem('ksp-audio-muted') === 'true';
    if (muted) masterGain.gain.value = 0;
  }

  function ensureCtx() {
    if (!ctx) init();
    if (ctx.state === 'suspended') ctx.resume();
  }

  function playTone(freq, duration, type, gain, delay) {
    ensureCtx();
    var osc = ctx.createOscillator();
    var env = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    var t = ctx.currentTime + (delay || 0);
    env.gain.setValueAtTime(0.001, t);
    env.gain.linearRampToValueAtTime(gain || 0.4, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(env);
    env.connect(sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  // 答对音效 - 欢快的上升音阶
  function playCorrect() {
    ensureCtx();
    playTone(523.25, 0.1, 'sine', 0.35, 0);
    playTone(659.25, 0.1, 'sine', 0.35, 0.07);
    playTone(783.99, 0.15, 'sine', 0.4, 0.14);
    playTone(1046.5, 0.2, 'sine', 0.3, 0.22);
  }

  // 答错音效 - 温柔的下降音（不刺耳）
  function playWrong() {
    ensureCtx();
    playTone(440, 0.15, 'sine', 0.2, 0);
    playTone(349.23, 0.2, 'sine', 0.15, 0.1);
  }

  // 倒计时警告 - 轻快的滴答声
  function playWarning() {
    ensureCtx();
    for (var i = 0; i < 3; i++) {
      playTone(880, 0.06, 'sine', 0.25, i * 0.15);
    }
  }

  // 通关音效 - 欢快的旋律
  function playLevelComplete() {
    ensureCtx();
    var melody = [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.5];
    melody.forEach(function(f, i) {
      playTone(f, 0.18, 'sine', 0.35, i * 0.12);
    });
  }

  // BGM - 轻快的音乐盒风格旋律（五声音阶）
  function startBGM() {
    if (bgmPlaying) return;
    ensureCtx();
    bgmPlaying = true;

    // 五声音阶音符（C大调五声音阶）
    var pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    // 欢快的旋律模式
    var melodyPattern = [0, 2, 4, 5, 4, 2, 3, 1, 0, 3, 5, 7, 5, 4, 2, 0];
    var noteIndex = 0;

    // 柔和的低音伴奏
    var bassNotes = [130.81, 164.81, 196.00, 164.81];
    var bassIndex = 0;

    function playBGMNote() {
      if (!bgmPlaying) return;

      // 旋律 - 音乐盒音色
      var noteIdx = melodyPattern[noteIndex % melodyPattern.length];
      var freq = pentatonic[noteIdx];
      var osc = ctx.createOscillator();
      var env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var t = ctx.currentTime;
      env.gain.setValueAtTime(0.001, t);
      env.gain.linearRampToValueAtTime(0.15, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(env);
      env.connect(bgmGain);
      osc.start(t);
      osc.stop(t + 0.4);
      bgmOscillators.push(osc);

      // 低音伴奏 - 每4个音符换一次
      if (noteIndex % 4 === 0) {
        var bassFreq = bassNotes[bassIndex % bassNotes.length];
        var bassOsc = ctx.createOscillator();
        var bassEnv = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.value = bassFreq;
        bassEnv.gain.setValueAtTime(0.001, t);
        bassEnv.gain.linearRampToValueAtTime(0.08, t + 0.05);
        bassEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        bassOsc.connect(bassEnv);
        bassEnv.connect(bgmGain);
        bassOsc.start(t);
        bassOsc.stop(t + 0.85);
        bgmOscillators.push(bassOsc);
        bassIndex++;
      }

      noteIndex++;

      // 清理已停止的振荡器
      bgmOscillators = bgmOscillators.filter(function(o) {
        try { return o.state !== 'stopped'; } catch(e) { return false; }
      });
    }

    // 每300ms播放一个音符
    playBGMNote();
    bgmInterval = setInterval(playBGMNote, 300);
  }

  function stopBGM() {
    bgmPlaying = false;
    if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
    bgmOscillators.forEach(function(osc) {
      try { osc.stop(); } catch(e) {}
    });
    bgmOscillators = [];
  }

  function toggleMute() {
    ensureCtx();
    muted = !muted;
    masterGain.gain.value = muted ? 0 : 1;
    localStorage.setItem('ksp-audio-muted', muted ? 'true' : 'false');
    var btn = document.getElementById('muteBtn');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
  }

  function isMuted() { return muted; }

  function updateMuteButton() {
    var btn = document.getElementById('muteBtn');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
  }

  return {
    init: init,
    playCorrect: playCorrect,
    playWrong: playWrong,
    playWarning: playWarning,
    playLevelComplete: playLevelComplete,
    startBGM: startBGM,
    stopBGM: stopBGM,
    toggleMute: toggleMute,
    isMuted: isMuted,
    updateMuteButton: updateMuteButton
  };
})();
