// KSP太空学习冒险 - 科目模块列表页通用逻辑 v3 (支持学期分组/续做/重复提醒)
(function(){
  var D = window.SUBJ_DATA;
  if(!D) return;
  var prog = JSON.parse(localStorage.getItem('ksp-progress')||'{}');

  // 辅助函数：检查模块是否完成
  function isDone(p, id){
    if(!p || !p.modules) return false;
    var m = p.modules[id] || p.modules[String(id)];
    if(!m) return false;
    if(m === 'completed') return true;
    if(typeof m === 'object' && m.status === 'completed') return true;
    return false;
  }

  // 辅助函数：获取模块积分
  function getPoints(p, id){
    if(!p || !p.modules) return 0;
    var m = p.modules[id] || p.modules[String(id)];
    if(!m) return 0;
    if(typeof m === 'object') return m.points || 0;
    return 0;
  }

  var html = '<div class="stars"></div><div class="wrap">';
  html += '<a href="../index.html" class="back" style="color:'+D.color+'">← 返回科目选择</a>';
  html += '<header><h1 style="color:'+D.color+'">'+D.icon+' '+D.title+'</h1>';
  html += '<p class="sub">'+D.subtitle+'</p>';
  html += '<div class="pb"><div class="pf" id="pf" style="background:linear-gradient(90deg,'+D.color+','+(D.color2||D.color)+')"></div><div class="pt" id="pt"></div></div>';
  html += '</header>';

  var totalModules = 0;
  var totalCompleted = 0;

  if(D.semesters){
    D.semesters.forEach(function(sem){
      var key = D.gradeId+'-'+D.subjId+'-'+sem.id;
      var p = prog[key]||{completed:0,modules:{}};
      var semCompleted = 0;
      var semTotal = sem.modules.length;
      totalModules += semTotal;

      html += '<div class="semester-header" style="border-color:'+D.color+'">';
      html += '<span class="semester-title" style="color:'+D.color+'">'+sem.name+'</span>';
      html += '<span class="semester-count">'+semCompleted+' / '+semTotal+' 关</span>';
      html += '</div>';
      html += '<div class="mods">';

      sem.modules.forEach(function(m,i){
        var done = isDone(p, m.id);
        var ok = i===0 || isDone(p, sem.modules[i-1].id);
        var lk = i>0 && !done && !ok;
        if(done){ semCompleted++; totalCompleted++; }
        html += '<div class="mc'+(lk?' locked':'')+'" data-href="'+m.href+'" data-title="'+m.title+'" data-sub="'+m.subtitle+'" data-done="'+done+'">';
        if(done) html += '<div class="cb">✓ 已完成</div>';
        html += '<div class="mi" style="background:linear-gradient(135deg,'+D.color+'33,'+D.color+'11)">'+m.icon+'</div>';
        html += '<div class="mif"><div class="mit" style="color:'+D.color+'">'+m.title+'</div>';
        html += '<div class="mid">'+m.subtitle+'</div>';
        html += '<div class="mim">'+(m.tags||[]).map(function(t){return '<span>'+t+'</span>'}).join('')+'</div></div>';
        if(lk) html += '<div class="lk">🔒</div>';
        html += '</div>';
      });
      html += '</div>';

      // Update semester count
      html = html.replace('<span class="semester-count">'+(semCompleted-semCompleted)+' / '+semTotal+' 关</span>','<span class="semester-count">'+semCompleted+' / '+semTotal+' 关</span>');
    });
  } else if(D.modules){
    totalModules = D.modules.length;
    var key = D.gradeId+'-'+D.subjId;
    var p = prog[key]||{completed:0,modules:{}};
    html += '<div class="mods">';
    D.modules.forEach(function(m,i){
      var done = isDone(p, m.id);
      var ok = i===0 || isDone(p, D.modules[i-1].id);
      var lk = i>0 && !done && !ok;
      if(done) totalCompleted++;
      html += '<div class="mc'+(lk?' locked':'')+'" data-href="'+m.href+'" data-title="'+m.title+'" data-sub="'+m.desc+'" data-done="'+done+'">';
      if(done) html += '<div class="cb">✓ 已完成</div>';
      html += '<div class="mi" style="background:linear-gradient(135deg,'+D.color+'33,'+D.color+'11)">'+m.icon+'</div>';
      html += '<div class="mif"><div class="mit" style="color:'+D.color+'">'+m.title+'</div>';
      html += '<div class="mid">'+m.desc+'</div>';
      html += '<div class="mim">'+(m.tags||[]).map(function(t){return '<span>'+t+'</span>'}).join('')+'</div></div>';
      if(lk) html += '<div class="lk">🔒</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '</div>';

  // Modal (增加重复提醒)
  html += '<div class="mo" id="mo"><div class="md"><h2 id="mt"></h2><p id="md2"></p><p id="repeatWarn" style="color:#fb923c;display:none;margin:8px 0;font-size:.9em">⚠️ 您已经做过本单元，再做将不得积分</p><div class="pg">';
  html += '<a class="btn" id="mb" href="#" style="background:linear-gradient(135deg,'+D.color+','+(D.color2||D.color)+')">开始</a>';
  html += '<button class="btn btn-s" onclick="document.getElementById(\'mo\').classList.remove(\'on\')">返回</button>';
  html += '</div></div></div>';

  document.body.innerHTML = html;

  // Update progress bar
  var pct = totalModules > 0 ? Math.round(totalCompleted/totalModules*100) : 0;
  document.getElementById('pf').style.width = pct+'%';
  document.getElementById('pt').textContent = totalCompleted+' / '+totalModules+' 关';

  // Click handlers
  document.querySelectorAll('.mc').forEach(function(el){
    var href = el.getAttribute('data-href');
    if(href && !el.classList.contains('locked')){
      el.onclick = function(){
        var titleEl = el.querySelector('.mit');
        var descEl = el.querySelector('.mid');
        var isDone = el.getAttribute('data-done')==='true';
        document.getElementById('mt').textContent = titleEl ? titleEl.textContent : '';
        document.getElementById('md2').textContent = descEl ? descEl.textContent : '';
        document.getElementById('mb').href = href;
        document.getElementById('repeatWarn').style.display = isDone ? 'block' : 'none';
        document.getElementById('mo').classList.add('on');
      };
    }
  });

  document.getElementById('mo').onclick = function(e){
    if(e.target.id==='mo') this.classList.remove('on');
  };
})();
