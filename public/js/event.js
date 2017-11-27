$(document).ready(function () {
  let url = "https://ponos.s3.dualstack.ap-northeast-1.amazonaws.com/information/appli/battlecats/event/tw/";
  let today = new Date();
  let dd = today.getDate(),
      mm = today.getMonth()+1,
      yy = today.getFullYear() ;
  let site = url+yy+mm+dd+".html";

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
  
  $("iframe").attr("src",site);
  $(document).on('click','#fine',function () {
    // alert("test");
    $(".debugwindow").fadeOut();
  });
  $(document).on('click','#retry',function () {
    $(".debugwindow").fadeOut();
    dd -= 1;
    site = url+yy+mm+dd+".html";
    $("iframe").attr("src",site);
    setTimeout(function () {
      $(".debugwindow").fadeIn();
    },800);
  });

});
