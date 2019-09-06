Date.splitDate = (str) => { return [str.substring(0,4),str.substring(4,6),str.substring(6,8)].join("/"); }

$(document).ready(function () {

});

['newPage','newEvent'].map((x)=>{
  fetch(`./public/data/${x}.txt`).then(response => {
    response.text().then(data => {
      data = data.split("\n");
      if(data.length == 0) return;
      data.map(tr => {
        tr = tr.split(",");
        $("#"+x).find("table").append(`<tr><th>${Date.splitDate(tr[0])}</th><td><a ${tr[2]?`href="${tr[2]}"`:""}>${tr[1]}</a></td></tr>`);
      });
    });
  }).catch(e=>{console.log(e);})
});
