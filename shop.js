// KSP太空学习冒险 - 积分商城 v1.0
(function(){
  var GIFTS = [
    // 100分以下 - 小奖励
    {id:'pencil',name:'太空铅笔',icon:'✏️',points:50,desc:'太空图案铅笔1支'},
    {id:'eraser',name:'星球橡皮',icon:'🔵',points:60,desc:'行星造型橡皮擦1个'},
    {id:'sticker1',name:'太空贴纸10张',icon:'🏷️',points:80,desc:'太空主题贴纸10张'},
    {id:'bookmark',name:'太空书签',icon:'🔖',points:90,desc:'银河系金属书签1枚'},

    // 100-200分
    {id:'sticker',name:'太空贴纸套装',icon:'🏷️',points:100,desc:'太空主题贴纸50张，装点你的笔记本！'},
    {id:'ruler',name:'星空直尺',icon:'📏',points:120,desc:'星空图案直尺1把'},
    {id:'crayon',name:'太空蜡笔套装',icon:'🖍️',points:150,desc:'12色太空主题蜡笔'},
    {id:'notebook',name:'太空笔记本',icon:'📓',points:180,desc:'太空封面精美笔记本1本'},

    // 200-400分
    {id:'pencilcase',name:'火箭笔袋',icon:'🚀',points:200,desc:'火箭造型文具笔袋'},
    {id:'watercolor',name:'水彩颜料套装',icon:'🎨',points:250,desc:'24色水彩颜料套装'},
    {id:'stationery',name:'文具礼盒',icon:'✏️',points:300,desc:'太空主题铅笔、橡皮、尺子套装'},
    {id:'storybook',name:'太空故事书',icon:'📖',points:350,desc:'《太空探险记》故事书1本'},

    // 400-600分
    {id:'puzzle30',name:'太空拼图30片',icon:'🧩',points:400,desc:'太阳系30片入门拼图'},
    {id:'telescope',name:'迷你望远镜',icon:'🔭',points:450,desc:'儿童入门天文望远镜'},
    {id:'puzzle',name:'太空拼图100片',icon:'🧩',points:500,desc:'太阳系探索100片拼图'},
    {id:'boardgame',name:'太空棋',icon:'♟️',points:550,desc:'太空主题飞行棋'},

    // 600-1000分
    {id:'globe',name:'地球仪',icon:'🌍',points:600,desc:'发光地球仪'},
    {id:'model',name:'行星模型',icon:'🪐',points:800,desc:'八大行星立体模型套装'},
    {id:'lego',name:'太空积木',icon:'🧱',points:900,desc:'太空飞船积木套装'},
    {id:'science',name:'科学实验套装',icon:'🔬',points:1000,desc:'儿童科学实验工具箱'},

    // 1000-1500分
    {id:'mp3',name:'故事机',icon:'📻',points:1100,desc:'儿童太空故事机'},
    {id:'watch',name:'儿童手表',icon:'⌚',points:1200,desc:'太空主题儿童手表'},
    {id:'rccar',name:'遥控赛车',icon:'🏎️',points:1500,desc:'太空赛车遥控汽车'},

    // 1500-2000分
    {id:'drone',name:'迷你无人机',icon:'🛸',points:1800,desc:'儿童迷你遥控无人机'},
    {id:'vr',name:'VR眼镜',icon:'🥽',points:2000,desc:'太空探索VR眼镜'},

    // 2000-3000分
    {id:'telescope2',name:'天文望远镜',icon:'🔭',points:2500,desc:'专业入门天文望远镜'},
    {id:'robot',name:'编程机器人',icon:'🤖',points:3000,desc:'儿童编程教育机器人'},

    // 3000-5000分
    {id:'tablet',name:'学习平板',icon:'📱',points:4000,desc:'儿童学习平板电脑'},
    {id:'spacesuit',name:'宇航服套装',icon:'👨‍🚀',points:5000,desc:'儿童太空服cosplay套装'},

    // 5000分以上 - 终极大奖
    {id:'switch',name:'游戏机',icon:'🎮',points:8000,desc:'便携式游戏机'},
    {id:'trip',name:'天文馆门票',icon:'🏛️',points:10000,desc:'天文馆亲子门票2张'}
  ];

  var _points = window.KSP && window.KSP.points;
  var totalPts = _points ? _points.getTotal() : 0;
  var history = JSON.parse(localStorage.getItem('ksp-gift-history')||'[]');

  function updateBalance(){
    totalPts = _points ? _points.getTotal() : 0;
    var el = document.getElementById('balanceDisplay');
    if(el) el.textContent = '⭐ '+totalPts+' 积分';
  }

  function renderGifts(){
    var grid = document.getElementById('giftGrid');
    var html = '';
    GIFTS.forEach(function(g){
      var canAfford = totalPts >= g.points;
      html += '<div class="gift-card'+(canAfford?'':' insufficient')+'" onclick="'+(canAfford?'window._exchange(\''+g.id+'\')':'')+'">';
      html += '<div class="gift-icon">'+g.icon+'</div>';
      html += '<div class="gift-name">'+g.name+'</div>';
      html += '<div class="gift-desc">'+g.desc+'</div>';
      html += '<div class="gift-price">⭐ '+g.points+' 积分</div>';
      if(!canAfford) html += '<div style="color:#64748b;font-size:.75em;margin-top:6px">积分不足</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  function renderHistory(){
    var section = document.getElementById('historySection');
    if(history.length === 0){ section.innerHTML = ''; return; }
    var html = '<div class="history-title">📋 兑换记录</div>';
    history.slice().reverse().forEach(function(h){
      html += '<div class="history-item">';
      html += '<div><span class="hi-name">'+h.gift+'</span><br><span style="color:#64748b;font-size:.8em">'+h.name+' · '+h.address+'</span></div>';
      html += '<div style="text-align:right"><span class="hi-pts">-'+h.points+'</span><br><span class="hi-date">'+h.date+'</span></div>';
      html += '</div>';
    });
    section.innerHTML = html;
  }

  window._exchange = function(giftId){
    var gift = null;
    GIFTS.forEach(function(g){ if(g.id===giftId) gift=g; });
    if(!gift || totalPts < gift.points) return;

    var modal = document.getElementById('modal');
    var content = document.getElementById('modalContent');
    content.innerHTML = '<h2>'+gift.icon+' '+gift.name+'</h2>'
      + '<p>'+gift.desc+'<br>需要 <b style="color:#fbbf24">'+gift.points+'</b> 积分</p>'
      + '<div class="form-group"><label>收件人姓名</label><input type="text" id="giftName" placeholder="请输入姓名"></div>'
      + '<div class="form-group"><label>联系电话</label><input type="tel" id="giftPhone" placeholder="请输入手机号"></div>'
      + '<div class="form-group"><label>收货地址</label><textarea id="giftAddr" placeholder="请输入详细地址"></textarea></div>'
      + '<div class="pg" style="margin-top:16px"><button class="btn" onclick="window._confirmExchange(\''+giftId+'\')" style="background:linear-gradient(135deg,#f59e0b,#f97316)">确认兑换</button>'
      + '<button class="btn btn-s" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">取消</button></div>';
    modal.classList.add('on');
  };

  window._confirmExchange = function(giftId){
    var name = document.getElementById('giftName').value.trim();
    var phone = document.getElementById('giftPhone').value.trim();
    var addr = document.getElementById('giftAddr').value.trim();
    if(!name){alert('请输入姓名');return;}
    if(!phone){alert('请输入联系电话');return;}
    if(!addr){alert('请输入收货地址');return;}

    var gift = null;
    GIFTS.forEach(function(g){ if(g.id===giftId) gift=g; });
    if(!gift || totalPts < gift.points) return;

    if(_points) _points.deduct(gift.points);
    var record = {gift:gift.name,points:gift.points,name:name,phone:phone,address:addr,date:new Date().toLocaleDateString('zh-CN')};
    history.push(record);
    localStorage.setItem('ksp-gift-history',JSON.stringify(history));

    var content = document.getElementById('modalContent');
    content.innerHTML = '<div class="success-msg"><div class="big">🎉</div><h2>兑换成功！</h2>'
      + '<p>'+gift.icon+' '+gift.name+'<br>已记录您的收货信息</p>'
      + '<p style="color:#94a3b8;font-size:.85em">收件人：'+name+'<br>地址：'+addr+'</p>'
      + '<p style="color:#fbbf24">剩余积分：'+(_points?_points.getTotal():0)+'</p>'
      + '<button class="btn" onclick="window._closeModal()" style="background:linear-gradient(135deg,#10b981,#059669);margin-top:12px">好的</button></div>';
    updateBalance();
    renderGifts();
    renderHistory();
  };

  window._closeModal = function(){
    document.getElementById('modal').classList.remove('on');
  };

  document.getElementById('modal').addEventListener('click',function(e){
    if(e.target.id==='modal') this.classList.remove('on');
  });

  updateBalance();
  renderGifts();
  renderHistory();
})();
