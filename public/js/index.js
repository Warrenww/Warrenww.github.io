
$(document).ready(function () {
  var catdata ;
  var timer = new Date().getTime();
  var compare = [] ;
  var filter_name = '' ;
  console.log(window)
  if(screen.width < 768){
    $("#lower_table .value_display").attr("colspan",7);
  }

  $(document).on('click','#updateCatData',function () {io().emit('force_update_cat_data');});
  $(document).on('keypress', 'input', function(e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
      $(this).blur();
    }
  });
  $(document).on('click', 'input',function (e) {
    e.stopPropagation();
  });
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
  $(document).on('click',"#clear_all",function () {clearSelected('select');});
  $(document).on('click','#upper_table th',function () {
    let className = $(this).siblings('td').attr('class') ;
    clearSelected(className) ;
  })
  $(document).on('click','#search_ability',search) ;
  $(document).on('click','.glyphicon-refresh',toggleCatStage);
  $(document).on('click','#compare',compareCat);
  $(document).on('click','.compareTable .comparedatahead th',sortCompareCat);
  $(document).on('click','#searchBut',TextSearch);
  var lv_input_org ;
  $(document).on('click','.comparedata #level',function () {
      lv_input_org = $(this).text();
      $(this).html('<input type="text" value="' +lv_input_org+ '"></input>');
      $(this).find('input').select();
  });
  $(document).on('blur', '.comparedata #level input', changeCompareLevel);
  $(document).on('click','.filter_option',filterSlider);
  var filter_org ;
  $(document).on('click','.value_display,#level_num',function () {
      filter_org = Number($(this).text());
      $(this).html('<input type="text" value="' +filter_org+ '"></input>');
      $(this).find('input').select();
  });
  $(document).on('blur','.value_display input',changeSlider) ;
  $(document).on('blur','#level_num input',function () {
    let val = Number($(this).val()) ;
    val = val && val>0 && val<101 ? val : filter_org ;
    $('#level').slider('option','value',val);
  });

  var rarity = ['基本','EX','稀有','激稀有','激稀有狂亂','超激稀有'] ;
  for(let i in rarity) $(".select_rarity").append("<span class='button' name='"+rarity[i]+"' value='0' >"+rarity[i]+"</span>") ;

  var color = ['對紅','對浮','對黒','對鋼鐵','對天使','對外星','對不死'];
  for(let i in color) $(".select_color").append("<span class='button' name='["+color[i]+"]' value='0'>"+color[i]+"</span>") ;

  var ability = ['增攻','降攻','免疫降攻','擅於攻擊','很耐打','超大傷害','爆擊','擊退','免疫擊退','連續攻擊','不死剋星',
                '緩速','免疫緩速','暫停','免疫暫停','遠方攻擊','復活','波動','抵銷波動','免疫波動','2倍金錢','只能攻撃',
                '攻城','鋼鐵'];
  for(let i in ability) $(".select_ability").append("<span class='button' name='["+ability[i]+"]' value='0'>"+ability[i]+"</span>") ;

  function clearSelected(className) {
    if(className == 'select'){
      $("#selected").empty();
      $("#level").slider('option','value',30) ;
      $(".dataTable").html('');
      $(".compareTarget").children().remove();
      $(".button_group").hide();
      $("#lower_table tbody").hide();
      $("#searchBox").val('');
    }
    $("."+className).find(".button").each(function () {
      $(this).attr('value','0');
    });
    let This = $("."+className).children().slider('widget');
    let init = This.attr('init-val');
    This.slider('value',init);
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
    let html = "" ;

    html += screen.width > 400 ? "<tr>"+
    "<th style='height:80px;padding:0'><img src=\"http://imgs-server.com/battlecats/u"+id+".png\"style='height:100%'></th>"+
    "<th colspan='5' rarity='"+data.稀有度+"' id='全名'>"+data.全名+"</th>"+
    "</tr>" : "<tr>"+
    "<th colspan='6' style='height:80px;padding:0;background-color:transparent'><img src=\"http://imgs-server.com/battlecats/u"+id+".png\"style='height:100%'></th>"+
    "</tr><tr>"+
    "<th colspan='6' rarity='"+data.稀有度+"' id='全名'>"+data.全名+"</th>"+
    "</tr>" ;


    $(".dataTable").empty();
    $('.compareTable').empty();
    $(".dataTable").append(
      html+
      "<tr>"+
      "<th colspan='1'>等級</th>"+
      "<td colspan='4' class='level'>"+
      "<div id='level' class='slider'></div>"+
      "</td>"+
      "<td colspan='"+(screen.width < 768 ? 5 : 1)+"' >"+
      "<span id='level_num'>30</span>"+
      "</td >"+
      "<tr>"+
      "<th>體力</th><td id='體力' original='"+data.lv1體力+"'>"+
      levelToValue(data.lv1體力,data.稀有度,30).toFixed(0)+"</td>"+
      "<th>KB</th><td id='KB'>"+data.kb+"</td>"+
      "<th>硬度</th><td id='硬度' original='"+data.lv1硬度+"'>"+
      levelToValue(data.lv1硬度,data.稀有度,30).toFixed(0)+"</td>"+
      "</tr><tr>"+
      "<th>攻擊力</th><td id='攻擊力' original='"+data.lv1攻擊+"'>"+
      levelToValue(data.lv1攻擊,data.稀有度,30).toFixed(0)+"</td>"+
      "<th>DPS</th><td id='DPS' original='"+data.lv1dps+"'>"+
      levelToValue(data.lv1dps,data.稀有度,30).toFixed(0)+"</td>"+
      "<th>射程</th><td id='射程'>"+data.射程+"</td>"+
      "</tr><tr>"+
      "<th>攻頻</th><td id='攻頻'>"+data.攻頻.toFixed(1)+" s</td>"+
      "<th>跑速</th><td id='跑速'>"+data.速度+"</td>"+
      "<td colspan='2' rowspan='2' id='範圍'>"+data.範圍+"</td>"+
      "</tr><tr>"+
      "<th>花費</th><td id='花費'>"+data.花費+"</td>"+
      "<th>再生産</th><td id='再生産'>"+data.再生産.toFixed(1)+" s</td>"+
      "</tr><tr>"+
      "<td colspan='6' id='特性' "+(
      data.特性.indexOf("連續攻擊") != -1 ?
      "original='"+data.特性+"'>"+
      serialATK(data.特性,levelToValue(data.lv1攻擊,data.稀有度,30)) :
      ">"+data.特性)+
      "</td>"+
      "</tr>"
    );
    initialSlider(data);
    scroll_to_class('display',0) ;
  }
  function initialSlider(data) {
    $("#level").slider({
      max: 100,
      min: 1,
      value: 30,
    });
    $("#level").on("slide", function(e,ui) {
      $("#level_num").html(ui.value);
      updateState(ui.value);
    });
    $("#level").on("slidechange", function(e,ui) {
      $("#level_num").html(ui.value);
      updateState(ui.value);
    });
    function updateState(level) {
      let rarity = data.稀有度;
      let change = ['體力','硬度','攻擊力','DPS'] ;
      for(let i in change){
        let target = $('.dataTable').find('#'+change[i]) ;
        let original = target.attr('original');
        target.html(levelToValue(original,rarity,level).toFixed(0))
              .css('background-color',' rgba(242, 213, 167, 0.93)');
        setTimeout(function () {
          target.css('background-color','rgba(255, 255, 255, .9)');
        },500);
      }
      let target = $('.dataTable').find('#特性');
      target.html(serialATK(data.特性,levelToValue(data.lv1攻擊,data.稀有度,level)));
    }
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
    console.log(buffer_3) ;

    $(".filter_option[active='true']").each(function () {
      let name = $(this).attr('id'),
          reverse = $(this).attr('reverse') == 'true' ? true : false ,
          limit = $(this).attr('value') ,
          level_bind = $(this).attr('lv-bind') == 'true' ? true : false ,
          lv = Number($("#level").slider( "option", "value" )) ;
      buffer_1 = [];
      buffer_1 = buffer_3;
      buffer_3 = [];
      for(let id in buffer_1){
        let value = level_bind ? levelToValue(buffer_1[id][name],buffer_1[id].稀有度,30) : buffer_1[id][name];
        if(value > limit && !reverse) buffer_3.push(buffer_1[id]);
        else if (value < limit && reverse) buffer_3.push(buffer_1[id]);
      }
    });

    console.log(buffer_3) ;
    scroll_to_div('selected');
    // alert(buffer_3.length);
    // generatePage(buffer_3.length);
    $("#selected").empty();
    $("#selected").scrollTop(0);
    $("#selected").append(condenseCatName(buffer_3));
    $(".button_group").css('display','flex');

  }
  function compareCat() {
    compare = $('.compareTarget').sortable('toArray',{attribute:'value'});
    console.log(compare);
    scroll_to_class("display",0);
    $(".compareTable").empty();
    $(".dataTable").empty();
    if(compare.length == 1) displayCatData(compare[0]);
    else{
      $(".compareTable").append(
        "<div style='flex:1' class='comparedatahead'>"+
        "<table>"+
        "<tr>"+
        "<th>Level</th>"+
        "</tr><tr>"+
        "<th style='height:80px;'>Picture</th>"+
        "</tr><tr>"+
        "<th>全名</th>"+
        "</tr><tr>"+
        "<th>體力</th>"+
        "</tr><tr>"+
        "<th>KB</th>"+
        "</tr><tr>"+
        "<th>硬度</th>"+
        "</tr><tr>"+
        "<th>攻擊力</th>"+
        "</tr><tr>"+
        "<th>DPS</th>"+
        "</tr><tr>"+
        "<th>射程</th"+
        "</tr><tr>"+
        "<th>攻頻</th>"+
        "</tr><tr>"+
        "<th>跑速</th>"+
        "</tr><tr>"+
        "<th>範圍</th>"+
        "</tr><tr>"+
        "<th>花費</th>"+
        "</tr><tr>"+
        "<th>再生産</th>"+
        "</tr><tr>"+
        "<th>特性</th>"+
        "</tr>"+
        "</table>"+
        "</div>"
      );
      for(let i in compare){
        let data = catdata[compare[i]];
        console.log(data);
        $(".compareTable").append(
          "<div style='flex:1' class='comparedata' id='"+data.id+"'>"+
          "<table>"+
          "<tr>"+
          "<th id='level' rarity='"+data.稀有度+"'>30</th>"+
          "</tr><tr>"+
          "<th style='height:80px;padding:0'><img src=\"http://imgs-server.com/battlecats/u"+compare[i]+".png\"style='height:100%'></th>"+
          "</tr><tr>"+
          "<th id='全名'>"+data.全名+"</th>"+
          "</tr><tr>"+
          "<td id='體力' original='"+data.lv1體力+"'>"+levelToValue(data.lv1體力,data.稀有度,30).toFixed(0)+"</td>"+
          "</tr><tr>"+
          "<td id='KB'>"+data.kb+"</td>"+
          "</tr><tr>"+
          "<td id='硬度' original='"+data.lv1硬度+"'>"+levelToValue(data.lv1硬度,data.稀有度,30).toFixed(0)+"</td>"+
          "</tr><tr>"+
          "<td id='攻擊力' original='"+data.lv1攻擊+"'>"+levelToValue(data.lv1攻擊,data.稀有度,30).toFixed(0)+"</td>"+
          "</tr><tr>"+
          "<td id='DPS' original='"+data.lv1dps+"'>"+levelToValue(data.lv1dps,data.稀有度,30).toFixed(0)+"</td>"+
          "</tr><tr>"+
          "<td id='射程'>"+data.射程+"</td>"+
          "</tr><tr>"+
          "<td id='攻頻'>"+data.攻頻.toFixed(1)+"</td>"+
          "</tr><tr>"+
          "<td id='跑速'>"+data.速度+"</td>"+
          "</tr><tr>"+
          "<td id='範圍'>"+data.範圍+"</td>"+
          "</tr><tr>"+
          "<td id='花費'>"+data.花費+"</td>"+
          "</tr><tr>"+
          "<td id='再生産'>"+data.再生産.toFixed(1)+"</td>"+
          "</tr><tr>"+
          "<td id='特性' "+
          (data.特性.indexOf("連續攻擊") != -1 ?
          "original='"+data.特性+"' atk='"+data.lv1攻擊+"'>"+
          serialATK(data.特性,levelToValue(data.lv1攻擊,data.稀有度,30)) :
          ">"+data.特性
          )+
          "</td>"+
          "</tr>"+
          "</table>"+
          "</div>"
        );
      }
    }
    highlightTheBest();
  }
  function highlightTheBest() {
    $('.comparedata').find('td').removeClass('best');
    $('.comparedatahead tbody').children().each(function () {
      let name = $(this).text();
      if(name == 'Picture' || name == '全名' ||name == '特性' || name == 'KB' || name == 'Level') return ;
      // console.log(name);
      if(name == '範圍'){
        $(".comparedata").each(function () {
          if($(this).find("#"+name).text() == '範圍') $(this).find("#"+name).attr('class','best') ;
        });
        return ;
      }
      let arr = [];
      let max = [],
          min = [];
      let max_val = -1,
          min_val = 1e10 ;

      $(".comparedata").each(function () {
        let obj = {};
        obj = {
          id:$(this).attr('id'),
          item:Number($(this).find("#"+name).text())
        }
        arr.push(obj);
      });
      // console.log(arr);
      for(let i in arr) {
        if(arr[i].item > max_val) {
          max_val = arr[i].item ;
          max = [arr[i]];
        }
        if(arr[i].item < min_val) {
          min_val = arr[i].item ;
          min = [arr[i]];
        }
        if(arr[i].item == max_val) max.push(arr[i]) ;
        if(arr[i].item == min_val) min.push(arr[i]) ;
      }
      // console.log(max);
      // console.log(min);
      if(name == '再生産' || name == '攻頻' || name == '花費') {
        for(let i in min) $(".compareTable").children("#"+min[i].id).find("#"+name).attr('class','best');
      }
      else for(let i in max) $(".compareTable").children("#"+max[i].id).find("#"+name).attr('class','best');
      // $(".compareTable").children("#"+min.id).find("#"+name).css('color','rgb(82, 174, 219)');
    });
  }
  function sortCompareCat() {
    let name = $(this).text();
    var arr = [] ;
    let flag = true ;
    if(name == 'Picture' || name == '全名' ||name == '特性' || name =='範圍' || name == 'KB') return ;
    $(this).css('border-left','5px solid rgb(246, 132, 59)')
            .parent().siblings().children().css('border-left','0px solid');

    $(".comparedata").each(function () {
      let obj = {};
      obj = {
        id:$(this).attr('id'),
        item:Number($(this).find("#"+name).text())
      }
      arr.push(obj);
    });
    // console.log(name);
    console.log(arr);
    for(let i=0;i<arr.length;i++){
      for(let j=i+1;j<arr.length;j++){
        if(arr[j].item>arr[i].item){
          $(".compareTable").children('#'+arr[i].id).before( $(".compareTable").children('#'+arr[j].id));
          flag = false ;
        }
        arr = [] ;
        $(".comparedata").each(function () {
          let obj = {};
          obj = {
            id:$(this).attr('id'),
            item:Number($(this).find("#"+name).text())
          }
          arr.push(obj);
        });
      }
    }
    if(flag){
      $(this).css('border-left','5px solid rgb(59, 184, 246)')
              .parent().siblings().children().css('border-left','0px solid');

      for(let i=0;i<arr.length;i++){
        for(let j=i+1;j<arr.length;j++){
          if(arr[j].item<arr[i].item){
            $(".compareTable").children('#'+arr[i].id).before( $(".compareTable").children('#'+arr[j].id));
          }
          arr = [] ;
          $(".comparedata").each(function () {
            let obj = {};
            obj = {
              id:$(this).attr('id'),
              item:Number($(this).find("#"+name).text())
            }
            arr.push(obj);
          });
        }
      }
    }
  }
  function TextSearch() {
    let keyword = $("#searchBox").val();
    let buffer = [] ;
    for(let id in catdata){
      if(catdata[id].全名.indexOf(keyword) != -1) {
        let simple = id.substring(0,3);
        for(let j=1;j<4;j++){
          let x = simple + '-' + j  ;
          console.log(x);
          if(catdata[x]) buffer.push(catdata[x]) ;
        }

      }
    }

    console.log(buffer);
    scroll_to_div('selected');
    $("#selected").empty();
    $("#selected").scrollTop(0);
    $("#selected").append(condenseCatName(buffer));
    $(".button_group").css('display','flex');
  }
  function changeCompareLevel() {
      let level = Number($(this).val());
      let rarity = $(this).parent().attr('rarity');
      let id = $(this).parents('.comparedata').attr('id');

      if (level && level < 101 && level > 0) {
        $(this).parent().html(level);
        let change = ['體力','硬度','攻擊力','DPS'] ;
        for(let i in change){
          let target = $('.compareTable #'+id).find('#'+change[i]) ;
          let original = target.attr('original');
          target.html(levelToValue(original,rarity,level).toFixed(0))
                .css('background-color',' rgba(242, 213, 167, 0.93)');
          setTimeout(function () {
            target.css('background-color','rgba(255, 255, 255, .9)');
          },500);
        }
        let target = $('.compareTable #'+id).find('#特性'),
            original = target.attr('original'),
            atk = target.attr('atk');
        target.html(serialATK(original,levelToValue(atk,rarity,level)))
        highlightTheBest();
        $('.comparedatahead').find('th').css('border-left','0px solid');
      }
      else $(this).parent().html(lv_input_org);
  }
  function filterSlider() {
    $("#slider_holder").show();
    $(this).css('border-bottom','5px solid rgb(241, 166, 67)').siblings().css('border-bottom','0px solid');
    filter_name = $(this).attr('id') ;
    let value = Number($(this).attr('value')) ;
    let reverse = $(this).attr('reverse') ;
    let range = JSON.parse($(this).attr('range'));
    let step = Number($(this).attr('step')) ;
    let active = $(this).attr('active') ;

    $("#slider_holder").find('.slider').slider('option',{
      'min': range[0],
      'max': range[1],
      'step': step,
      'value': value
    }).parent().siblings('.active').html(active=='true'?'<i class="material-icons">&#xe837;</i>':'<i class="material-icons">&#xe836;</i>')
    .siblings('.reverse').html(reverse=='true'?'以下':'以上');
  }
  $('#slider_holder').children('.active').click(function () {
    let target = $("#"+filter_name+".filter_option");
    target.attr('active',target.attr('active')=='true'?'false':'true');
    $(this).html(target.attr('active')=='true'?'<i class="material-icons">&#xe837;</i>':'<i class="material-icons">&#xe836;</i>');
  });
  $('#slider_holder').children('.reverse').click(function () {
    let target = $("#"+filter_name+".filter_option");
    target.attr('reverse',target.attr('reverse')=='true'?'false':'true');
    $(this).html(target.attr('reverse')=='true'?'以下':'以上');
  });
  $('#slider_holder').find('.slider').on("slidechange",function (e,ui) {
    $("#lower_table").find("#"+filter_name).attr('value',ui.value);
  });
  $("#lower_table").find("#selectAll").click(function () {
    if($(this).text().trim() == '全選') {
      $(".filter_option").attr('active','true');
      $(this).text('全部清除');
      $('.active').html('<i class="material-icons">&#xe837;</i>');
    }
    else{
      filter_name = "" ;
      $(".filter_option").attr('active','false');
      $(this).text('全選');
      $('.active').html('<i class="material-icons">&#xe836;</i>');
      $("#slider_holder").hide().siblings().children('.filter_option').css('border-bottom','0px solid');
    }
  });
  $(".filter_option").hover(
    function () {
      let position = $(this).offset(),
          value = $(this).attr('value'),
          width = $(this).outerWidth()-10,
          active = $(this).attr('active') == 'true' ? true : false ,
          reverse = $(this).attr('reverse') == 'true' ? '以下' : '以上';

      // alert(JSON.stringify(position));
      position.top -= 30 ;
        if(active && screen.width > 768){
          $("#TOOLTIP").finish().fadeIn();
          $("#TOOLTIP").offset(position).width(width).text(value+reverse) ;
        }

    },function () {
      $("#TOOLTIP").fadeOut();
  });


  $('#test').click(function () {
    html2canvas($('.display').get(), {
      onrendered: function(canvas) {
        // document.body.appendChild(canvas);
        var link=document.createElement("a");
        link.href=canvas.toDataURL('image/jpg');   //function blocks CORS
        link.download = 'screenshot.jpg';
        link.click();
      },
    });
    // let width = $('.compareTable').width(),
    //     height = $('.compareTable').height() ;
    // html2canvas($('.compareTable').get(), {
    //     onrendered: function (canvas) {
    //         var tempcanvas=document.createElement('canvas');
    //         console.log(width+":"+height)
    //         tempcanvas.width = width;
    //         tempcanvas.height = height ;
    //         var context=tempcanvas.getContext('2d');
    //         context.drawImage(canvas,0,0);
    //         var link=document.createElement("a");
    //         link.href=tempcanvas.toDataURL('image/jpg');   //function blocks CORS
    //         link.download = 'screenshot.jpg';
    //         link.click();
    //     }
    // });
  });

  $(".sortable").sortable({
    scroll:false,
    delay:150
  });
  $(".slider").slider();

  $('#selected').sortable('option',{
    item: '> .card-group',
    connectWith: ".compareTarget"
  });
  $('.compareTarget').sortable('option',{
    item: '> comparedata'
  });
  $(".slider").on("slide", function(e,ui) {
    $(this).parent().siblings('td.value_display').html(ui.value);
  });
  $(".slider").on("slidechange", function(e,ui) {
    $(this).parent().siblings('td.value_display').html(ui.value);
  });
  $('.compareTarget').on('sortover',function (e,ui) {
    $("#compare").show();
    scroll_to_class('compareTarget',0);
    let input = ui.item.children('.card:visible') ;
    compare = $('.compareTarget').sortable('toArray',{attribute:'value'});
    if(compare.indexOf(input.attr('value')) != -1){
      let repeat = $(this).find('[value='+input.attr('value')+']') ;
      repeat.css('border-color','rgb(237, 179, 66)');
      setTimeout(function () {
        repeat.css('border-color','white');
      },1000);
      $("#selected").sortable('cancel');
    }
    else if(compare.length > 3){
      alert('啊 塞滿了') ;
      $("#selected").sortable('cancel');
    }
    else if(ui.sender.is('#selected')){
      input.clone().appendTo(this);
      $("#selected").sortable('cancel');
    }
    else $("#selected").sortable('cancel');
  });
  $('.compareTarget').on('sortout',function (e,ui) {
    let x1 = $(this).position().left,
        x2 = x1 + $(this).width(),
        y1 = $(this).position().top,
        y2 = y1 + $(this).height(),
        x = ui.position.left,
        y = ui.position.top ;
    if(x<x1||x>x2||y<y1||y>y2) if(ui.sender.is('.compareTarget')) ui.item.remove();

  });
  $('.compareTable').on('sort',function (e,ui) {
    $('.comparedatahead').find('th').css('border-left','0px solid');
  });

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
  function toggleButton() {
    let val = Number($(this).attr('value')) ;
    $(this).attr('value',function () {
      val = (val+1)%2 ;
      return val ;
    });
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
  function turnPage(n) {
    let current = $("#selected").scrollTop();
    $("#selected").animate(
      {scrollTop: current+348*n},
      100,'easeInOutCubic');
  }
  function levelToValue(origin,rarity,lv) {
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
  function generatePage(n) {
    $(".page_group").append("<p>Total: "+n+"</p>");
    n = Math.ceil(n/8) ;
    for(let i=1;i<=n;i++){
      $(".page_group").append("<span class='glyphicon'>&#xe201;</span>")
    }

  }
  function changeSlider() {
    let target = $("#"+filter_name+".filter_option");
    let range = JSON.parse(target.attr('range')),
        step = Number(target.attr('step')),
        value = Number($(this).val()) ;

    value = Math.round(value/step)*step ;

    if(value && value<range[1] && value>range[0]) $("#slider_holder").find('.slider').slider('option','value',value);
    else $("#slider_holder").find('.slider').slider('option','value',filter_org);
  }
  function serialATK(prop,atk) {
      let b = prop.split("（")[0];
      let arr = prop.split("（")[1].split("）")[0].split(",") ;
      // console.log(b+"("+d.join()+")")
      for(let i in arr) arr[i] = (atk*Number(arr[i])).toFixed(0) ;
      return b+"（"+arr.join(' ')+"）" ;

  }
  function sleep(milliseconds) {
    var start = new Date().getTime();
    while (true) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  var xmlhttp = new XMLHttpRequest();
  var url = "public/js/Catdata.txt";

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
