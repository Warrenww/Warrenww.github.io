
$(document).ready(function () {
  var socket = io();
  var catdata ;
  var bufferId = 0 ; //if data is not ready storge the search id
  var loadstate = false ; //wheater the data is ready
  var nav_display = 0 ;

  socket.on('push cat data',function (data) {
    loadstate = true ;
    console.log(data) ;
    catdata = data ;
    $("#search_ability").prop('disabled',false);
    if(bufferId) displayCatData(bufferId);
  });

  $(document).on('click','#start',function () {
    // $(this).fadeOut(500,"easeInOutCubic");
    setTimeout(function () {scroll_to_div('searchCat');},100);
  });

  //load 1st select
  var rarity = ['基本','EX','稀有','激稀有','激稀有狂亂','超激稀有'] ;
  $(".rare").append("<option class='option' value='-1'>請選擇</option>") ;
  for(let i in rarity) {
    $(".rare").append("<option class='option' value='"+rarity[i]+"'>"+rarity[i]+"</option>") ;
    $(".select_rarity").append("<span class='button' name='"+rarity[i]+"' value='0' >"+rarity[i]+"</span>") ;
  }

  var color = ['對紅','對浮','對黒','對鋼鐵','對天使','對外星','對不死'];
  for(let i in color) $(".select_color").append("<span class='button' name='["+color[i]+"]' value='0'>"+color[i]+"</span>") ;

  var ability = ['增攻','降攻','免疫降攻','擅於攻擊','很耐打','超大傷害','爆擊','擊退','免疫擊退','連續攻擊','不死剋星',
                '緩速','免疫緩速','暫停','免疫暫停','遠方攻擊','復活','波動','抵銷波動','免疫波動','2倍金錢','只能攻撃',
                '攻城','鋼鐵'];
  let count = 0 ;
  for(let i in ability) {
    $(".select_ability").append("<span class='button' name='["+ability[i]+"]' value='0'>"+ability[i]+"</span>") ;
  }

  $(".button").click(function () {
    let val = Number($(this).attr('value')) ;
    $(this).attr('value',function () {
      val = (val+1)%2 ;
      return val ;
    });
  });

  //when user change rarity load 2nd select
  $(".rare").change(function () {
    $(".cat").prop('disabled',true); //disable select when catname is not ready
    $(".rare").prop('disabled',true);
    //ask for cat name
    socket.emit('load cat name', {
      cat:$(".rare").val()
    });
  });
  //show the slider value
  $("#level").mousemove(function () {
    $("#level_num").text($(this).val());
  });
  //change slider value by 1
  $("#lv_minus").click(function () {
    m = $("#level").val() ;
    if(m == 1) return ;
    $("#level").val(m-1) ;
    $("#level_num").text(m-1);
  });
  $("#lv_plus").click(function () {
    p = Number($("#level").val()) ;
    if(p == 100 ) return ;
    $("#level").val(p+1) ;
    $("#level_num").text(p+1);
  });
  $("#next_sel_pg").click(function () {
    let current = $("#selected").scrollTop();
    $("#selected").animate(
    {scrollTop: current+120},
    200,'easeInOutCubic');
  });
  $("#pre_sel_pg").click(function () {
    let current = $("#selected").scrollTop();
    $("#selected").animate(
    {scrollTop: current-120},
    200,'easeInOutCubic');
  });
  $(document).on('click','.card',function () {
    displayCatData( $(this).attr('value') );
  });

  socket.on('push cat name',function (data) {
    console.log('get cat name');
    $(".cat").prop('disabled',false); //restore 2nd select
    $(".rare").prop('disabled',false);
    $(".cat").empty() ; //clear select
    $(".cat").append("<option value='-1' class='option'>請選擇</option>"); //add default option
    //add cat name of current rarity
    let exist = '000' ; //initial the exist id
    for(let i in data){
      let current = data[i].id.substring(0,3) ;
      if(current == exist) continue ; //prevent repeat same cat with different stage
      $(".cat").append("<option class='option' value='"+data[i].id+"'>"+data[i].name+"</option>");
      exist = current ;
    }

  });


  $("#search").click(function () {
    //user didn't choose a cat
    if($(".cat").val() == -1){alert('please choose a cat');return ;}
    //get cat id with consider it's stage
    let id = $(".cat").val().substring(0,3)+'-'+$(".state").val();
    //if data not yet ready storge the searching id
    if(!loadstate){bufferId = id;return ;}

    $(".dataTable").empty() ; //clear data table
    //this cat doesn't have stage 3 (xxx-3 is not exist)
    if(catdata[id] == null){
      $(".dataTable").append("<th>"+$(".cat").find(":selected").text()+"還沒有三階進化歐><</th>");
      scroll_to_div('display_1') ;
      return ;
    }
    displayCatData(id) ;

  }) ;
  $("#clear").click(function () {
    $(".button").each(function () {
      $(this).attr('value','0');
    });
    $("#selected").empty();
    $("#pre_sel_pg").hide();
    $("#next_sel_pg").hide();

  });
  $("#search_ability").click(function () {
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

    if(ability.length != 0){
      for(let id in catdata){
        for(let j in aFiliter){
          if(catdata[id].tag == '[無]') break;
          else if(catdata[id].tag.indexOf(aFiliter[j]) != -1) {buffer_1.push(catdata[id]);break;}
        }
      }
    }
    else buffer_1 = catdata ;
    console.log(buffer_1) ;
    if(color.length != 0){
      for(let id in buffer_1){
        for(let j in cFiliter){
          if(buffer_1[id].tag.indexOf(cFiliter[j]) != -1) {buffer_2.push(buffer_1[id]);break;}
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

    $("#selected").empty();
    $("#selected").scrollTop(0);
    for(let i in buffer_3) $("#selected").append(
      "<span class='card' value='"+buffer_3[i].id+
      "' style='background-image:url(\"http://imgs-server.com/battlecats/u"+buffer_3[i].id+".png\")'>"+
      buffer_3[i].全名+"</span>"
    );
    $("#pre_sel_pg").show();
    $("#next_sel_pg").show();

  });

  // $("#nav-buttom").click(function () {
  //   nav_display = (nav_display+1)%2 ;
  //   if(nav_display){
  //     $('#mobile-nav-container').animate({right:0});
  //     $("#nav-buttom").children().each(function () {
  //       $(this).css('top','25px')
  //     });
  //     $('#icon1').css('transform','rotate(45deg)');
  //     $('#icon2').css('opacity','0');
  //     $('#icon3').css('transform','rotate(-45deg)');
  //   }
  //   else{
  //     $('#mobile-nav-container').animate({right: -200});
  //     $("#nav-buttom").children().each(function () {
  //       $(this).css('transform','rotate(0deg)')
  //     });
  //     $('#icon1').css('top','15px');
  //     $('#icon2').css({'top':'23.75px','opacity':'1'});
  //     $('#icon3').css('top','32.5px');
  //   }
  //
  // });

  function displayCatData(id) {
    bufferId = 0 ; //recover bufferId
    $(".dataTable").empty();
    $(".dataTable").append(
      "<tr>"+
      "<th style='height:80px'><img src=\"http://imgs-server.com/battlecats/u"+id+".png\"style='height:100%'></th>"+
      "<th colspan='5'>"+catdata[id].全名+"</th>"+
      "</tr><tr>"+
      "<th>體力</th><td>"+levelToValue(catdata[id].lv1體力).toFixed(0)+"</td>"+
      "<th>KB</th><td>"+catdata[id].kb+"</td>"+
      "<th>硬度</th><td>"+(levelToValue(catdata[id].lv1體力)/catdata[id].kb).toFixed(0)+"</td>"+
      "</tr><tr>"+
      "<th>攻擊力</th><td>"+levelToValue(catdata[id].lv1攻擊).toFixed(0)+"</td>"+
      "<th>DPS</th><td>"+(levelToValue(catdata[id].lv1攻擊)/catdata[id].攻頻).toFixed(0)+"</td>"+
      "<th>射程</th><td>"+catdata[id].射程+"</td>"+
      "</tr><tr>"+
      "<th>攻頻</th><td>"+catdata[id].攻頻.toFixed(0)+"</td>"+
      "<th>跑速</th><td>"+catdata[id].速度+"</td>"+
      "<td colspan='2' rowspan='2'>"+catdata[id].範圍+"</td>"+
      "</tr><tr>"+
      "<th>花費</th><td>"+catdata[id].花費+"</td>"+
      "<th>再生産</th><td>"+catdata[id].再生産.toFixed(0)+"</td>"+
      "</tr><tr>"+
      "<td colspan='6'>"+catdata[id].特性+"</td>"+
      "</tr>"
    );
    scroll_to_div('display_1') ;
  }
  function levelToValue(origin) {
    let lv = Number($("#level").val()) ;//get current value
    let rarity = $(".rare").val();
    let limit,result ;
    console.log(origin+":"+lv+":"+rarity+":"+(0.8+0.2*lv)*origin);
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
    if(lv<limit) return (0.8+0.2*lv)*origin ;
    else return origin*(0.8+0.2*limit)+origin*0.1*(lv-limit) ;
  }

  function scroll_to_div(div_id){
   $('html,body').animate(
   {scrollTop: $("#"+div_id).offset().top},
   1000,'easeInOutCubic');
  }
  function  scroll_to_class(class_name,n) {
    $('html,body').animate(
    {scrollTop: $("."+class_name).eq(n).offset().top},
    1000,'easeInOutCubic');
  }



});
