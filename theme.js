// KSP太空学习冒险 - 主题切换
(function(){
  try{
    var th=localStorage.getItem('ksp-theme');
    if(th==='light') document.body.classList.add('light');
  }catch(e){}
})();
