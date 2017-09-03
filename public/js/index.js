
$(document).ready(function () {
  var socket = io();
  var catdata ;
  var loadstate = false ; //wheater the data is ready
  var nav_display = 0 ;
  var timer = new Date().getTime();
  var compare = [] ;

  $(document).on('click','#updateCatData',function () {socket.emit('force_update_cat_data');})
  $(document).on('click','#start',function () {
    var myWindow;
    myWindow = window.open("http://battlecats-db.com/unit/status_r_all.html", "myWindow", "width=1,height=1");
    setTimeout(function () {scroll_to_class('page_1',0);},100);
    setTimeout(function () {myWindow.close();},30000);
  });
  $(document).on('click',".button",toggleButton);
  $(document).on('click','#next_sel_pg',function () {turnPage(1);}) ;
  $(document).on('click','#pre_sel_pg',function () {turnPage(-1);}) ;
  $(document).on('click','.card',function () {displayCatData($(this).attr('value'));});
  $(document).on('click','#lv_minus',function () {levelChange(-1)});
  $(document).on('click','#lv_plus',function () {levelChange(1)});
  $(document).on('click',"#clear_all",function () {clearSelected('select');});
  $(document).on('click','#upper_table th',function () {
    let className = $(this).siblings('td').attr('class') ;
    clearSelected(className) ;
  })
  $(document).on('click','#search_ability',search) ;
  $(document).on('click','.glyphicon-refresh',toggleCatStage);
  $(document).on('click','.value_display',function () {
    if(!$(this).siblings('td').children().slider('option','disabled')) {
      let val = $(this).text();
      $(this).html('<input type="text" value="' +val + '"></input>');
      $(this).find('input').select();
    }
  });
  $(document).on('keypress', '.value_display input', function(e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
      $(this).blur();
    }
  });
  $(document).on('blur', '.value_display input', function() {
    let val = $(this).val();
    let slider = $(this).parent().siblings('td').children();
    let step = Number(slider.slider('option','step'));
    let max = Number(slider.slider('option','max')),
        min = Number(slider.slider('option','min'));

    val = Math.round(val/step)*step ;


    if(val<min || val>max) {
      $(this).parent().html(slider.slider('option','value'));
      return ;
    }
    else slider.slider('option','value',val);

  });
  $(document).on('click','.tbody_togger',function () {
    $(this).parent().children('tbody').toggle(300,'easeInOutCubic');
  }) ;
  $(document).on('click','#lower_table th',disableFilter);


  var rarity = ['基本','EX','稀有','激稀有','激稀有狂亂','超激稀有'] ;
  for(let i in rarity) $(".select_rarity").append("<span class='button' name='"+rarity[i]+"' value='0' >"+rarity[i]+"</span>") ;

  var color = ['對紅','對浮','對黒','對鋼鐵','對天使','對外星','對不死'];
  for(let i in color) $(".select_color").append("<span class='button' name='["+color[i]+"]' value='0'>"+color[i]+"</span>") ;

  var ability = ['增攻','降攻','免疫降攻','擅於攻擊','很耐打','超大傷害','爆擊','擊退','免疫擊退','連續攻擊','不死剋星',
                '緩速','免疫緩速','暫停','免疫暫停','遠方攻擊','復活','波動','抵銷波動','免疫波動','2倍金錢','只能攻撃',
                '攻城','鋼鐵'];
  for(let i in ability) $(".select_ability").append("<span class='button' name='["+ability[i]+"]' value='0'>"+ability[i]+"</span>") ;


  function toggleButton() {
  let val = Number($(this).attr('value')) ;
  $(this).attr('value',function () {
    val = (val+1)%2 ;
    return val ;
  });
}
  function turnPage(n) {
    let current = $("#selected").scrollTop();
    $("#selected").animate(
      {scrollTop: current+174*n},
      100,'easeInOutCubic');
  }
  function levelChange(n) {
    original = Number($("#level").slider( "option", "value" ));
    if(original == 1 || original == 100) return ;
    $("#level").slider( "option", "value" ,original+n);
  }
  function clearSelected(className) {
    if(className == 'select'){
      $("#selected").empty();
      $("#pre_sel_pg").hide();
      $("#next_sel_pg").hide();
      $("#level").slider('option','value',30) ;
      $(".dataTable").html('');
      $(".compareTarget").children('p').show().siblings().remove();
    }
    $("."+className).find(".button").each(function () {
      $(this).attr('value','0');
    });
    let This = $("."+className).children().slider('widget');
    let init = This.attr('init-val');
    This.slider('value',init);
  }
  function search() {
    let rarity = $(".select_rarity [value=1]"),
    color = $(".select_color [value=1]"),
    ability = $(".select_ability [value=1]");
    let rFilter = [], cFiliter = [], aFiliter = [] ;
    for(let i = 0;i<rarity.length;i++) rFilter.push(rarity.eq(i).attr('name')) ;
    for(let i = 0;i<color.length;i++) cFiliter.push(color.eq(i).attr('name')) ;
    for(let i = 0;i<ability.length;i++) aFiliter.push(ability.eq(i).attr('name')) ;

    console.log(rFilter);
    console.log(cFiliter);
    console.log(aFiliter);

    let buffer_1 = [],
    buffer_2 = [],
    buffer_3 = [];

    if(color.length != 0){
      for(let id in catdata){
        for(let j in cFiliter){
          if(catdata[id].tag == '[無]') break;
          else if(catdata[id].tag.indexOf(cFiliter[j]) != -1) {buffer_1.push(catdata[id]);break;}
        }
      }
    }
    else buffer_1 = catdata ;
    console.log(buffer_1) ;
    if(ability.length != 0){
      for(let id in buffer_1){
        for(let j in aFiliter){
          if(buffer_1[id].tag.indexOf(aFiliter[j]) != -1) {buffer_2.push(buffer_1[id]);break;}
        }
      }
    }
    else buffer_2 = buffer_1 ;
    console.log(buffer_2) ;
    if(rarity.length != 0) {
      for(let id in buffer_2) if(rFilter.indexOf(buffer_2[id].稀有度) != -1) buffer_3.push(buffer_2[id]) ;
    }
    else buffer_3 = buffer_2 ;

    let tbody = $("#lower_table").children('tbody') ;
    if(tbody.css('display') != 'none'){
      tbody.children().each(function () {
        let disabled = Number($(this).children('th').attr('value'));
        let name = $(this).children('th').attr('name') ;
        let limit = Number($(this).children(".value_display").text()) ;
        let lv_bind = $(this).children('th').attr('lv-bind')=='true' ? true : false ;
        if(!disabled){
          buffer_1 = [] ;
          for(let id in buffer_3){
            let value = lv_bind ? levelToValue(buffer_3[id][name],buffer_3[id].稀有度) : buffer_3[id][name] ;
            if(value > limit) buffer_1.push(buffer_3[id]) ;
          }
          buffer_3 = [] ;
          buffer_3 = buffer_1 ;
        }
      });
    }

    console.log(buffer_3) ;
    scroll_to_div('selected');
    $("#selected").empty();
    $("#selected").scrollTop(0);
    $("#selected").append(condenseCatName(buffer_3));
    $("#pre_sel_pg").show();
    $("#next_sel_pg").show();

  }
  function condenseCatName(data) {
    console.log('condensing....');
    let now = '000' ;
    let image = 'http://imgs-server.com/battlecats/u' ;
    let html = '<span class="card-group" hidden>' ;
    for(let i in data){
      let name = data[i].全名;
      let id = data[i].id ;
      let current = id.substring(0,3) ;
      if(current == now){
        html += '<span class="card" value="'+id+'" '+
                'style="background-image:url('+image+id+'.png);display:none">'+
                name+'</span>' ;
      }
      else{
        html += '</span>' ;
        html += '<span class="card-group" value="'+current+'">'+
                '<span class="glyphicon glyphicon-refresh"></span>'+
                '<span class="card" value="'+id+'" '+
                'style="background-image:url('+image+id+'.png)">'+
                name+'</span>' ;
        now = current ;
      }
    }
    return html ;
  }
  function displayCatData(id) {
    let data = catdata[id] ;
    $(".dataTable").empty();
    $(".dataTable").append(
      "<tr>"+
      "<th style='height:80px;padding:0'><img src=\"http://imgs-server.com/battlecats/u"+id+".png\"style='height:100%'></th>"+
      "<th colspan='5'>"+data.全名+"</th>"+
      "</tr><tr>"+
      "<th>體力</th><td>"+levelToValue(data.lv1體力,data.稀有度).toFixed(0)+"</td>"+
      "<th>KB</th><td>"+data.kb+"</td>"+
      "<th>硬度</th><td>"+(levelToValue(data.lv1體力,data.稀有度)/data.kb).toFixed(0)+"</td>"+
      "</tr><tr>"+
      "<th>攻擊力</th><td>"+levelToValue(data.lv1攻擊,data.稀有度).toFixed(0)+"</td>"+
      "<th>DPS</th><td>"+(levelToValue(data.lv1攻擊,data.稀有度)/data.攻頻).toFixed(0)+"</td>"+
      "<th>射程</th><td>"+data.射程+"</td>"+
      "</tr><tr>"+
      "<th>攻頻</th><td>"+data.攻頻.toFixed(0)+"</td>"+
      "<th>跑速</th><td>"+data.速度+"</td>"+
      "<td colspan='2' rowspan='2'>"+data.範圍+"</td>"+
      "</tr><tr>"+
      "<th>花費</th><td>"+data.花費+"</td>"+
      "<th>再生産</th><td>"+data.再生産.toFixed(0)+"</td>"+
      "</tr><tr>"+
      "<td colspan='6'>"+data.特性+"</td>"+
      "</tr>"
    );
    scroll_to_div('display_1') ;
  }
  function levelToValue(origin,rarity) {
    let lv = Number($("#level").slider( "option", "value" )) ;
    let limit,result ;
    switch (rarity) {
      case '稀有':
      limit = 70 ;
      break;
      case '激稀有狂亂':
      limit = 20 ;
      break;
      default:
      limit = 60 ;
    }
    return lv<limit ? (0.8+0.2*lv)*origin : origin*(0.8+0.2*limit)+origin*0.1*(lv-limit) ;
  }
  function scroll_to_div(div_id){
    $('html,body').animate(
      {scrollTop: $("#"+div_id).offset().top},
      1000,'easeInOutCubic');
  }
  function scroll_to_class(class_name,n) {
    $('html,body').animate(
      {scrollTop: $("."+class_name).eq(n).offset().top},
      1000,'easeInOutCubic');
  }
  function toggleCatStage() {
    let current = $(this).parent().children(".card:visible").next().attr('value');
    if(current != undefined){
      $(this).parent().children(".card:visible").hide().next().show();
    }
    else{
      $(this).parent().children(".card:visible").hide().parent().children().eq(1).show();
    }
  }
  function disableFilter() {
    let val = Number($(this).attr('value'));
    val = (val+1) %2 ;
    $(this).attr('value',val);
    let slider = $(this).parent().children('td').eq(0).children().slider('widget');
    if(slider.slider('option','disabled')) slider.slider('option','disabled',false);
    else slider.slider('option','disabled',true);
  }

  $("#lower_table tbody").sortable({
    scroll:false
  });
  $('#selected').sortable({
    item: '> .card-group',
    connectWith: ".compareTarget",
    scroll:false
  });
  $('.compareTarget').sortable({
    scroll:false
  });
  $('.compareTarget').on('sortover',function (e,ui) {
    let input = ui.item.children('.card:visible') ;
    if(compare.length > 4){
      alert('啊 塞滿了') ;
      $("#selected").sortable('cancel');
    }
    else if(ui.sender.is('#selected') && compare.indexOf(input.attr('value')) == -1 ){
      compare = $('.compareTarget').sortable('toArray','value');
      console.log(compare);
      $(this).children('p').hide();
      input.clone().appendTo(this);
      $("#selected").sortable('cancel');
    }
    else $("#selected").sortable('cancel');
  });

  $("#level").on("slide", function(e,ui) {
  	$("#level_num").text(ui.value);
  });
  $("#level").on("slidechange", function(e,ui) {
  	$("#level_num").text(ui.value);
  });
  $(".slider").slider();
  $("#level").slider('option',{
    animate: 0,
    max: 100,
    min: 1,
    value: 30,
  });
  $("#select_hp").slider('option',{
    'max':200000,
    'min':1000,
    'step':1000,
    'value':30000
  });
  $("#select_kb").slider('option',{
    'max':7,
    'min':1,
    'value':3
  });

  $(".slider").on("slide", function(e,ui) {
    $(this).parent().siblings('td.value_display').text(ui.value);
  });
  $(".slider").on("slidechange", function(e,ui) {
    $(this).parent().siblings('td.value_display').text(ui.value);
  });

  var xmlhttp = new XMLHttpRequest();
  var url = "../data.txt";

  xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);
          console.log(data) ;
          let nowtime =  new Date().getTime();
          console.log(nowtime-timer) ;
          catdata = data ;
      }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();





});
