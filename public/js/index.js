$(document).ready(function () {

});

['newPage','newEvent'].map((x)=>{
  fetch(`./public/data/${x}.txt`).then(response => {
    response.text().then(data => {
      data = data.split("\n");
      data.map(tr => {
        tr = tr.split(",");
        $("#"+x).append(`<tr><th>${tr[0]}</th><td><a href='${tr[2]}'>${tr[1]}</a></td></tr>`);
      });
    });
  }).catch(e=>{console.log(e);})
});
