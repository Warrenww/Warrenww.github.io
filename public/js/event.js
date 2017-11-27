$(document).ready(function () {
  let url = "https://ponos.s3.dualstack.ap-northeast-1.amazonaws.com/information/appli/battlecats/event/tw/";
  let today = new Date();
  let dd = today.getDate(),
      mm = today.getMonth()+1,
      yy = today.getFullYear() ;
  let site = url+yy+mm+dd+".html";
  var eventUpdate = {
        modify_date: dd,
        modify_to:"",
      };

  var showMobilePanel = 1 ;
  $(document).on('click','#m_nav_menu',function () {
    if(showMobilePanel){
      $(".m_nav_panel").css('right',0);
      $("#m_nav_panel_BG").fadeIn();
      showMobilePanel = 0 ;
    }
    else{
      $(".m_nav_panel").css('right',-180);
      $("#m_nav_panel_BG").fadeOut();
      showMobilePanel = 1 ;
    }
  });
  $(document).on('click','#m_nav_panel_BG',function () {
    if(!showMobilePanel){
      $(".m_nav_panel").css('right',-180);
      $("#m_nav_panel_BG").fadeOut();
      showMobilePanel = 1 ;
    }
  });
  $("iframe").load(function () {
    $(".debugwindow h3").text("如果沒有東西出現請按重試按鈕");
  });
  $("iframe").attr("src",site);
  $(document).on('click','#fine',function () {
    // alert("test");
    $(".debugwindow").fadeOut();
  });
  $(document).on('click','#retry',function () {
    $(".debugwindow h3").text("重新抓取資料中...");
    dd -= 1;
    var load = confirm("貓咪:確定要載入"+mm+"月"+dd+"日的活動嗎?");
    if(load){
      site = url+yy+mm+dd+".html";
      console.log(site);
      $("iframe").attr("src",site);
    }
    else{
      $(".debugwindow h3").text("如果沒有東西出現請按重試按鈕");
      dd += 1 ;
    }

  });

});
