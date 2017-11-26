$(document).ready(function () {
  let url = "https://ponos.s3.dualstack.ap-northeast-1.amazonaws.com/information/appli/battlecats/event/tw/";
  let today = new Date();
  let dd = today.getDate(),
      mm = today.getMonth()+1,
      yy = today.getFullYear() ;
  let site = url+yy+mm+dd+".html";
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
