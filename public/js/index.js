// $(window).scroll(function () {
//   if($('body').scrollTop()>200){
//     $('#start').fadeOut(500,"easeInOutCubic");
//   }
//   else{
//     $('#start').fadeIn(500,"easeInOutCubic");
//   }
// });
$(document).ready(function () {
  var socket = io();
  var catdata ;
  var bufferId = 0 ; //if data is not ready storge the search id
  var loadstate = false ; //wheater the data is ready

  socket.emit('preload cat data');//ask for cat data
  socket.on('push cat data',function (data) {
    loadstate = true ;
    console.log(data) ;
    catdata = data ;
    if(bufferId) displayCatData(bufferId);
  });

  $(document).on('click','#start',function () {
    // $(this).fadeOut(500,"easeInOutCubic");
    setTimeout(function () {scroll_to_div('searchCat');},100);
  });

  //load 1st select
  var rarity = ['基本','EX','稀有','激稀有','激稀有狂亂','超激稀有'] ;
  $(".rare").append("<option value='-1'>請選擇</option>") ;
  for(let i in rarity) $(".rare").append("<option value='"+rarity[i]+"'>"+rarity[i]+"</option>") ;

  var color = ['對紅','對浮','對黒','對鋼鐵','對天使','對外星','對不死'];
  for(let i in color) $(".select_color").append("<input type='checkbox' value='["+color[i]+"]'>"+color[i]+"\t") ;

  var ability = ['增攻','降攻','免疫降攻','擅於攻擊','很耐打','超大傷害','爆擊','擊退','免疫擊退','連續攻擊','不死剋星',
                '緩速','免疫緩速','暫停','免疫暫停','遠方攻擊','復活','波動','抵銷波動','免疫波動','2倍金錢','只能攻撃',
                '攻城','鋼鐵'];
  let count = 0 ;
  for(let i in ability) {
    if(count%7 == 6) $(".select_ability").append("</br>") ;
    $(".select_ability").append("<input type='checkbox' value='["+ability[i]+"]'>"+ability[i]+"\t") ;
    count ++ ;
  }

  //when user change rarity load 2nd select
  $(".rare").change(function () {
    $(".cat").prop('disabled',true); //disable select when catname is not ready
    //ask for cat name
    socket.emit('load cat name', {
      cat:$(".rare").val()
    });
  });
  //show the slider value
  $(".level").change(function () {
    $(".level_num").text($(this).val());
  });
  //change slider value by 1
  $("#lv_minus").click(function () {
    m = $(".level").val() ;
    $(".level").val(m-1) ;
    $(".level_num").text(m-1);
  });
  $("#lv_plus").click(function () {
    p = Number($(".level").val()) ;
    $(".level").val(p+1) ;
    $(".level_num").text(p+1);
  });

  socket.on('push cat name',function (data) {

    $(".cat").prop('disabled',false); //restore 2nd select

    $(".cat").empty() ; //clear select
    $(".cat").append("<option value='-1'>請選擇</option>"); //add default option
    //add cat name of current rarity
    let exist = '000' ; //initial the exist id
    for(let i in data){
      let current = data[i].id.substring(0,3) ;
      if(current == exist) continue ; //prevent repeat same cat with different stage
      $(".cat").append("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
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
      return ;
    }
    displayCatData(id) ;

  }) ;

  function displayCatData(id) {
    bufferId = 0 ; //recover bufferId
    $(".dataTable").append(
      "<tr>"+
      "<th colspan='6'>"+catdata[id].全名+"</th>"+
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
    $("html, body").animate({ scrollTop: $(document).height() },1000,'easeInOutCubic');
  }
  function levelToValue(origin) {
    let lv = Number($(".level").val()) ;//get current value
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



});
