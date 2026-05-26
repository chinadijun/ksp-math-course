// KSP太空学习冒险 - 通用题目引擎 v4 (集成计时器/音效/积分/错题本/跳过/随机)
(function(){
  var D = window.QUIZ_DATA;
  if(!D) return;
  var qi=0, score=0, answered=false, sel=-1, skipped={}, started=false;

  // 检查续做 (Task 15)
  try{
    var resume=JSON.parse(localStorage.getItem('ksp-resume')||'null');
    if(resume && resume.url===window.location.href && resume.qi>0 && resume.qi<D.questions.length){
      qi=resume.qi;
      score=resume.score||0;
      skipped=resume.skipped||{};
    }
  }catch(e){}
  localStorage.removeItem('ksp-resume');

  var _timer = window.KSP && window.KSP.timer;
  var _audio = window.KSP && window.KSP.audio;
  var _points = window.KSP && window.KSP.points;
  var _wrongbook = window.KSP && window.KSP.wrongbook;

  // 随机打乱题目顺序，且不重复已答对的题
  if(D.questions && D.questions.length>1){
    // 从localStorage读取已答对的题目标识
    var seenKey = 'ksp-seen-' + (D.progressKey||'') + '-' + (D.moduleId||'');
    var seen = {};
    try{ var arr = JSON.parse(localStorage.getItem(seenKey)||'[]'); arr.forEach(function(id){seen[id]=true}); }catch(e){}
    // 按题目标识去重
    function qid(q){ return (q.q||'').substring(0,60); }
    var fresh = D.questions.filter(function(q){ return !seen[qid(q)]; });
    if(fresh.length < 3) { seen = {}; fresh = D.questions.slice(); }
    // 打乱
    var a = fresh;
    for(var i=a.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=a[i];a[i]=a[j];a[j]=t;
    }
    D.questions = a;
    // 保存答对的题
    window._saveSeen = function(){
      try{
        var arr = JSON.parse(localStorage.getItem(seenKey)||'[]');
        D.questions.forEach(function(q){ var id=qid(q); if(arr.indexOf(id)<0) arr.push(id); });
        localStorage.setItem(seenKey, JSON.stringify(arr));
      }catch(e){}
    };
  }

  if(_audio) _audio.init();
  if(_audio) _audio.startBGM();
  if(_points) _points.resetModule();

  document.body.innerHTML = `
<div class="stars"></div><div class="wrap" style="position:relative">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <a href="${D.backUrl||'index.html'}" class="back" id="backLink" style="color:${D.color||'#60a5fa'}">← ${D.backText||'返回'}</a>
    <div style="display:flex;align-items:center;gap:12px">
      <span id="pointsDisplay" class="points-display"></span>
      <button id="muteBtn" class="mute-btn" onclick="if(window.KSP&&window.KSP.audio)window.KSP.audio.toggleMute()">🔊</button>
    </div>
  </div>
  <header style="position:relative">
    <div id="timer" class="timer">30</div>
    <h1 style="color:${D.color||'#60a5fa'}">${D.icon||''} ${D.title}</h1>
    <p class="sub">${D.subtitle||''}</p>
    <div class="pb"><div class="pf" style="background:linear-gradient(90deg,${D.color||'#3b82f6'},${D.color2||'#8b5cf6'})" id="pf"></div><div class="pt" id="pt">0 / ${D.questions.length}</div></div>
  </header>
  <div id="stage"></div>
</div>`;

  if(_audio) _audio.updateMuteButton();
  if(_points) _points.display();

  var stage = document.getElementById('stage');

  // 退出提醒 (Task 7)
  var backLink = document.getElementById('backLink');
  if(backLink){
    backLink.addEventListener('click', function(e){
      if(started && qi>0 && qi<D.questions.length){
        e.preventDefault();
        if(confirm('如果退出本关，本次积分将清零！确定要退出吗？')){
          // 保存续做位置 (Task 15)
          try{localStorage.setItem('ksp-resume',JSON.stringify({url:window.location.href,qi:qi,score:score,skipped:skipped}));}catch(e){}
          if(_points){_points.resetModule();_points.display();}
          window.location.href = D.backUrl||'index.html';
        }
      }
    });
  }

  // 自动生成题目配图
  function autoVisual(text){
    var v = '';
    // 几何体配图
    if(/长方体|正方体|圆柱|球/.test(text)){
      var shapes = '';
      if(text.indexOf('长方体')>=0) shapes += '<div style="display:inline-block;width:60px;height:40px;background:linear-gradient(135deg,#3b82f6,#60a5fa);border:2px solid #93c5fd;border-radius:4px;margin:4px;transform:perspective(200px) rotateY(-15deg)"></div>';
      if(text.indexOf('正方体')>=0) shapes += '<div style="display:inline-block;width:44px;height:44px;background:linear-gradient(135deg,#8b5cf6,#a78bfa);border:2px solid #c4b5fd;border-radius:4px;margin:4px;transform:perspective(200px) rotateY(-15deg)"></div>';
      if(text.indexOf('圆柱')>=0) shapes += '<div style="display:inline-block;width:40px;height:50px;background:linear-gradient(135deg,#10b981,#34d399);border:2px solid #6ee7b7;border-radius:8px/4px;margin:4px"></div>';
      if(text.indexOf('球')>=0) shapes += '<div style="display:inline-block;width:44px;height:44px;background:radial-gradient(circle at 35% 35%,#f59e0b,#d97706);border:2px solid #fbbf24;border-radius:50%;margin:4px"></div>';
      if(shapes) v = '<div style="text-align:center;margin:8px 0">'+shapes+'</div>';
    }
    // 平面图形配图
    if(/长方形|正方形|三角形|圆形|平行四边形/.test(text) && !(/长方体|正方体/.test(text))){
      var shapes2 = '';
      if(text.indexOf('长方形')>=0) shapes2 += '<div style="display:inline-block;width:64px;height:40px;border:3px solid #3b82f6;border-radius:2px;margin:6px"></div>';
      if(text.indexOf('正方形')>=0) shapes2 += '<div style="display:inline-block;width:44px;height:44px;border:3px solid #8b5cf6;border-radius:2px;margin:6px"></div>';
      if(text.indexOf('三角形')>=0) shapes2 += '<div style="display:inline-block;width:0;height:0;border-left:24px solid transparent;border-right:24px solid transparent;border-bottom:44px solid #10b981;margin:6px"></div>';
      if(text.indexOf('圆形')>=0) shapes2 += '<div style="display:inline-block;width:44px;height:44px;border:3px solid #f59e0b;border-radius:50%;margin:6px"></div>';
      if(shapes2) v = '<div style="text-align:center;margin:8px 0">'+shapes2+'</div>';
    }
    // 钟表配图
    if(/钟表|几点|小时|整时|半时|短针|长针/.test(text)){
      var hMatch = text.match(/指向(\d+)/);
      var hour = hMatch ? parseInt(hMatch[1]) : 3;
      var hDeg = hour * 30;
      v = '<div style="text-align:center;margin:8px 0"><div style="display:inline-block;width:80px;height:80px;border:3px solid #60a5fa;border-radius:50%;position:relative;background:radial-gradient(circle,#1a1f35,#0d1220)"><div style="position:absolute;bottom:50%;left:50%;width:3px;height:22px;background:#e0e6f0;transform-origin:bottom center;transform:translateX(-50%) rotate('+hDeg+'deg);border-radius:2px"></div><div style="position:absolute;bottom:50%;left:50%;width:2px;height:28px;background:#60a5fa;transform-origin:bottom center;transform:translateX(-50%) rotate(0deg);border-radius:2px"></div><div style="position:absolute;top:50%;left:50%;width:6px;height:6px;background:#f59e0b;border-radius:50%;transform:translate(-50%,-50%)"></div></div></div>';
    }
    // 人民币配图
    if(/元|角|分|人民币|付|找回/.test(text)){
      var moneyEmoji = '🪙';
      if(text.indexOf('元')>=0 && parseInt(text)>=5) moneyEmoji = '💵';
      v = '<div style="text-align:center;margin:8px 0;font-size:2em">'+moneyEmoji+'</div>';
    }
    // 位置关系配图
    if(/上下前后左右/.test(text) && /面|边|排/.test(text)){
      v = '<div style="text-align:center;margin:8px 0;font-size:1.5em">⬆️⬇️⬅️➡️</div>';
    }
    // 千克/克配图
    if(/千克|克|重量|轻|重/.test(text)){
      v = '<div style="text-align:center;margin:8px 0;font-size:2em">⚖️</div>';
    }
    return v;
  }

  function render(){
    answered = false;
    started = true;
    if(qi >= D.questions.length){ showResult(); return; }
    var q = D.questions[qi];
    var pct = Math.round(qi/D.questions.length*100);
    document.getElementById('pf').style.width = pct+'%';
    document.getElementById('pt').textContent = qi+' / '+D.questions.length;

    var html = '<div class="card"><div class="qn">第 '+(qi+1)+' 题 / '+D.questions.length+'</div><h2>'+q.q+'</h2>';
    if(q.story) html += '<div class="story">'+q.story+'</div>';
    if(q.html) html += q.html;
    // 自动生成题目配图
    html += autoVisual(q.q);

    if(q.type==='mc'){
      html += '<div class="choices">';
      q.choices.forEach(function(c,i){ html += '<div class="choice" onclick="window._pick('+i+')">'+c+'</div>'; });
      html += '</div>';
    } else if(q.type==='input'){
      html += '<div class="inp"><input type="'+(q.inputType||'number')+'" id="ans" placeholder="'+(q.placeholder||'?')+'" onkeydown="if(event.key===\'Enter\')window._check()"><span>'+(q.unit||'')+'</span></div>';
    } else if(q.type==='tf'){
      html += '<div class="choices"><div class="choice" onclick="window._pick(0)">✅ 对</div><div class="choice" onclick="window._pick(1)">❌ 错</div></div>';
    } else if(q.type==='multi-input'){
      q.fields.forEach(function(f,i){
        html += '<div class="inp"><span>'+f.label+'</span><input type="number" id="ans'+i+'" placeholder="?" onkeydown="if(event.key===\'Enter\'){var n=document.getElementById(\'ans'+(i+1)+'\');if(n)n.focus();else window._check()}"><span>'+(f.unit||'')+'</span></div>';
      });
    }

    html += '<div class="fb" id="fb"></div>';
    if(q.hint) html += '<div class="hint" id="hint" style="display:none">'+q.hint+'</div>';
    html += '<div class="pg"><button class="btn" id="checkBtn" onclick="window._check()" style="background:linear-gradient(135deg,'+((D.color||'#3b82f6'))+','+((D.color2||'#8b5cf6'))+')">跳过</button>';
    if(q.hint) html += '<button class="btn btn-s" id="hintBtn" onclick="window._showHint()">💡 提示 (-1分)</button>';
    if(qi>0) html += '<button class="btn btn-s" onclick="window._prev()">上一题</button>';
    html += '</div></div>';
    stage.innerHTML = html;
    stage.querySelector('.card').style.animation='fadeIn .3s ease';
    if(q.type==='input'){setTimeout(function(){var e=document.getElementById('ans');if(e)e.focus()},100);}
    if(q.onRender) q.onRender();

    if(_timer) _timer.start(30);
    if(_points) _points.startQuestion();
  }

  window._showHint = function(){
    if(answered) return;
    var h = document.getElementById('hint');
    var hb = document.getElementById('hintBtn');
    if(h){ h.style.display='block'; }
    if(hb){ hb.style.display='none'; }
    if(_points) _points.useHint();
    // 使用提示也记录到错题本 (Task 21)
    var q = D.questions[qi];
    if(_wrongbook && D.grade && D.subject) _wrongbook.addWrong(D.grade, D.subject, D.gradeName||'', D.subjName||'', D.moduleName||'', q);
  };

  window._pick = function(i){
    if(answered) return; sel = i;
    document.querySelectorAll('.choice').forEach(function(c,idx){c.classList.toggle('selected',idx===i)});
    window._check();
  };

  // 跳过功能 (Task 8) - 跳过=不得分，不扣分，加入错题本
  window._skip = function(){
    if(answered) return;
    answered = true;
    skipped[qi] = true;
    if(_timer) _timer.stop();
    var fb=document.getElementById('fb');
    fb.className='fb no';fb.textContent='⏭️ 已跳过，本题不得分。';fb.style.display='block';
    // 显示正确答案
    var q = D.questions[qi];
    if(q.type==='mc'||q.type==='tf'){
      document.querySelectorAll('.choice').forEach(function(c,idx){
        if(idx===q.answer) c.classList.add('correct');
      });
    }
    // 跳过的题也加入错题本
    if(_wrongbook && D.grade && D.subject) _wrongbook.addWrong(D.grade, D.subject, D.gradeName||'', D.subjName||'', D.moduleName||'', q);
    var btn=document.getElementById('checkBtn');
    var hbtn=document.getElementById('hintBtn');
    if(hbtn) hbtn.style.display='none';
    if(btn){btn.textContent='下一题 →';btn.onclick=function(){qi++;sel=-1;render()}}
  };

  window._check = function(){
    if(answered) return;
    var q = D.questions[qi]; var ok = false;
    if(q.type==='mc'||q.type==='tf'){
      if(sel<0){
        // 没选答案就当跳过
        window._skip();
        return;
      }
      answered = true; ok = sel===q.answer;
      document.querySelectorAll('.choice').forEach(function(c,idx){
        if(idx===q.answer) c.classList.add('correct');
        else if(idx===sel&&!ok) c.classList.add('wrong');
      });
    } else if(q.type==='input'){
      var el=document.getElementById('ans'); if(!el)return; var v=el.value.trim(); if(v===''){window._skip();return;}
      answered=true;
      ok = Array.isArray(q.answer) ? q.answer.some(function(a){return Math.abs(parseFloat(v)-a)<0.01}) : parseFloat(v)===q.answer;
      el.style.borderColor=ok?'#10b981':'#ef4444';
    } else if(q.type==='multi-input'){
      answered=true; ok=true;
      q.fields.forEach(function(f,i){
        var v=parseFloat(document.getElementById('ans'+i).value);
        var r=Array.isArray(f.answer)?f.answer.some(function(a){return Math.abs(v-a)<0.01}):v===f.answer;
        document.getElementById('ans'+i).style.borderColor=r?'#10b981':'#ef4444';
        if(!r) ok=false;
      });
    }
    if(!answered) return;

    if(_timer) _timer.stop();
    var timerExpired = _timer && _timer.isExpired();

    if(timerExpired){
      if(_audio) _audio.playWrong();
      if(_points) _points.awardTimerPenalty();
    } else if(ok){
      if(_audio) _audio.playCorrect();
      if(_points) _points.award(true);
      if(_wrongbook && D.grade && D.subject) _wrongbook.removeByQuestion(q, D.grade, D.subject);
    } else {
      if(_audio) _audio.playWrong();
      if(_points) _points.award(false);
      if(_wrongbook && D.grade && D.subject) _wrongbook.addWrong(D.grade, D.subject, D.gradeName||'', D.subjName||'', D.moduleName||'', q);
    }

    var fb=document.getElementById('fb');
    if(timerExpired){
      fb.className='fb no';fb.textContent='⏰ 时间到！正确答案已显示。';fb.style.display='block';
    } else if(ok){
      fb.className='fb ok';fb.textContent='🎉 '+q.correctMsg;fb.style.display='block';score+=q.score||10;
    } else {
      fb.className='fb no';fb.textContent='❌ '+q.wrongMsg;fb.style.display='block';var h=document.getElementById('hint');if(h)h.style.display='block';
      if(!q.hint && q.type==='mc'||q.type==='tf'){
        document.querySelectorAll('.choice').forEach(function(c,idx){
          if(idx===q.answer) c.classList.add('correct');
        });
      }
    }
    var btn=document.getElementById('checkBtn');
    var hbtn=document.getElementById('hintBtn');
    if(hbtn) hbtn.style.display='none';
    if(btn){btn.textContent='下一题 →';btn.onclick=function(){qi++;sel=-1;render()}}
  };

  window._prev = function(){if(qi>0){qi--;sel=-1;render()}};

  function showResult(){
    // 计算实际答对的题数（排除跳过的）
    var total=D.questions.reduce(function(s,q){return s+(q.score||10)},0);
    var answeredCount=0;
    for(var k=0;k<D.questions.length;k++){if(!skipped[k])answeredCount++;}
    var pct=Math.round(score/total*100);
    document.getElementById('pf').style.width='100%';
    document.getElementById('pt').textContent='完成！';
    var msg='';
    if(pct>=90)msg='🌟 太厉害了！';else if(pct>=70)msg='👍 做得很好！';else if(pct>=50)msg='💪 继续加油！';else msg='📖 再复习一下吧！';

    if(_timer) _timer.stop();
    if(_audio) _audio.stopBGM();
    if(_audio) _audio.playLevelComplete();

    var earned = _points ? _points.completeModule() : 0;
    if(window._saveSeen) window._saveSeen();

    // 修复积分显示不一致 (Task 11) - 完成后刷新显示
    if(_points) _points.display();

    var bonusText = '';
    if(_points){
      bonusText = '<p style="color:#fbbf24;margin:8px 0">本次获得 <b>'+earned+'</b> 积分</p>';
      if(_points.isAllCorrect() && _points.getHintsUsed()===0)
        bonusText += '<p style="color:#10b981;margin:4px 0">🏆 完美通关！额外+5分！</p>';
    }

    stage.innerHTML='<div class="card" style="text-align:center"><h2>🎉 '+D.title+' · 完成！</h2><div class="score-num">'+score+'</div><p style="color:#94a3b8;margin:8px 0">/ '+total+' 分</p><p>'+msg+'</p>'+bonusText+(D.resultHtml||'')+'<div class="pg"><a href="'+(D.nextUrl||D.backUrl||'index.html')+'" class="btn" style="background:linear-gradient(135deg,'+(D.color||'#3b82f6')+','+(D.color2||'#8b5cf6')+')">'+(D.nextText||'返回')+'</a><button class="btn btn-s" onclick="location.reload()">再做一次</button></div></div>';
    if(D.progressKey){
      var p=JSON.parse(localStorage.getItem('ksp-progress')||'{}');
      if(!p[D.progressKey]) p[D.progressKey]={completed:0,modules:{}};
      p[D.progressKey].modules[D.moduleId]={status:'completed',points:earned,perfect:(_points&&_points.isAllCorrect()&&_points.getHintsUsed()===0)};
      p[D.progressKey].completed=Object.keys(p[D.progressKey].modules).length;
      localStorage.setItem('ksp-progress',JSON.stringify(p));
    }
  }

  if(_timer){
    _timer.setOnExpire(function(){
      if(!answered){
        window._check();
      }
    });
  }

  // 保存续做位置 (页面关闭/刷新时)
  window.addEventListener('beforeunload', function(){
    if(started && qi>0 && qi<D.questions.length){
      try{localStorage.setItem('ksp-resume',JSON.stringify({url:window.location.href,qi:qi,score:score,skipped:skipped}));}catch(e){}
    }
  });

  render();
})();
