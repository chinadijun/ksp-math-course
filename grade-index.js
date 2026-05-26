// KSP太空学习冒险 - 年级科目选择页通用逻辑 v2 (动态模块计数)
(function(){
  var G = window.GRADE_DATA;
  if(!G) return;

  var subjects = G.subjects || [
    {id:'chinese',icon:'📖',title:'语文',desc:'识字写字、拼音、课文理解、看图说话',color:'#ef4444',tags:['识字','拼音','课文','说话'],total:6},
    {id:'math',icon:'🔢',title:'数学',desc:'图形、计算、分类、人民币、应用题',color:'#3b82f6',tags:['图形','计算','分类','应用'],total:6},
    {id:'english',icon:'🔤',title:'英语',desc:'字母、单词、简单对话、歌曲童谣',color:'#10b981',tags:['字母','单词','对话','歌谣'],total:6},
    {id:'astro',icon:'🌌',title:'天文',desc:'太阳系、月球、星星、火箭、太空生活',color:'#f59e0b',tags:['太阳系','月球','星星','火箭'],total:6}
  ];

  var prog = JSON.parse(localStorage.getItem('ksp-progress')||'{}');

  var html = '<div class="stars"></div><div class="wrap">';
  html += '<a href="../index.html" class="back">← 返回选择年级</a>';
  html += '<header><h1>'+G.icon+' '+G.name+'</h1>';
  html += '<p class="sub">'+G.subtitle+'</p></header>';
  html += '<div class="grid">';

  subjects.forEach(function(s){
    // Aggregate progress across semesters
    var completed = 0;
    var total = s.total || 6;
    ['s1','s2','extra'].forEach(function(sem){
      var key = G.id+'-'+s.id+'-'+sem;
      var p = prog[key];
      if(p && p.modules){
        Object.keys(p.modules).forEach(function(k){
          if(p.modules[k]==='completed' || (p.modules[k] && p.modules[k].status==='completed')) completed++;
        });
      }
    });
    // Also check legacy key
    var legacyKey = G.id+'-'+s.id;
    var lp = prog[legacyKey];
    if(lp && lp.modules && completed===0){
      Object.keys(lp.modules).forEach(function(k){
        if(lp.modules[k]==='completed') completed++;
      });
    }

    var pct = Math.round(completed/total*100);
    html += '<div class="sc" style="border-color:'+s.color+'33" onclick="location.href=\''+s.id+'/index.html\'">';
    html += '<div class="si" style="background:'+s.color+'22;border-color:'+s.color+'">'+s.icon+'</div>';
    html += '<div class="st" style="color:'+s.color+'">'+s.title+'</div>';
    html += '<div class="sd">'+s.desc+'</div>';
    html += '<div class="stag">'+s.tags.map(function(t){return '<span>'+t+'</span>'}).join('')+'</div>';
    html += '<div class="spb"><div class="spf" style="width:'+pct+'%;background:'+s.color+'"></div></div>';
    html += '<div class="spt">'+completed+' / '+total+' 关</div>';
    html += '</div>';
  });

  html += '</div></div>';
  document.body.innerHTML = html;
})();
