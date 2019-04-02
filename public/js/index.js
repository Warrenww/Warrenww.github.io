$(document).ready(function () {

});

['newPage','newEvent'].map((x)=>{
  var temp = xmlHttp(`./public/data/${x}.txt`);
  console.log(temp);
})
function xmlHttp (url) {
  if (!url) return null;
  else return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open("GET",url, true);
    request.send();
    request.onreadystatechange = function () {
      if(this.readyState == 4 && this.status == 200) resolve(this.responseText);
      else reject(this);
    }
  });
}
