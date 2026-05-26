// KSP太空学习冒险 - 错题库管理模块
(function(){
  var KEY = 'ksp-wrongbook';

  function _load(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch(e) { return []; }
  }
  function _save(list){
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  function _makeId(q, grade, subject){
    return grade + '|' + subject + '|' + (q.q || '').substring(0,80);
  }

  var api = {
    addWrong: function(grade, subject, gradeName, subjName, moduleName, question){
      var list = _load();
      var id = _makeId(question, grade, subject);
      for(var i=0;i<list.length;i++){
        if(list[i].id === id) return;
      }
      list.push({
        id: id,
        question: JSON.parse(JSON.stringify(question)),
        grade: grade,
        subject: subject,
        gradeName: gradeName,
        subjName: subjName,
        moduleName: moduleName,
        timestamp: Date.now()
      });
      _save(list);
    },
    removeWrong: function(id){
      var list = _load();
      var filtered = list.filter(function(item){ return item.id !== id; });
      if(filtered.length < list.length) _save(filtered);
    },
    removeByQuestion: function(q, grade, subject){
      var id = _makeId(q, grade, subject);
      api.removeWrong(id);
    },
    getAll: function(){
      return _load();
    },
    getCount: function(){
      return _load().length;
    }
  };

  window.KSP = window.KSP || {};
  window.KSP.wrongbook = api;
})();
