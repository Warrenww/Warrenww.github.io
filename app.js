var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var path = require('path');
var sheet_ID = '1lGJC6mfH9E0D2bYNKVBz78He1QhLMUYNFSfASzaZE9A' ;
var gsjson = require('google-spreadsheet-to-json');


io.on('connection', function(socket){
  console.log('a user connected');
  fs.stat('public/js/Catdata.txt', function(err,stats){
    var mtime = Date.parse(stats.mtime),
        today = Date.now();
    timepass = today - mtime ;
    console.log(timepass);
    if(timepass > 86400000) loadcatData()
  });

  socket.on('force_update_cat_data', (data,callback) =>{
    console.log('Someone force me to load cat data ...QAQ') ;
    loadcatData() ;
  });
  socket.on('connet', (data,callback) => {
    console.log('connnnnnnet');
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });


  function loadcatData(data) {

      let cat = [] ;
      gsjson({
          spreadsheetId: sheet_ID,
          // worksheet: ['貓咪資料']
          hash : 'id'
      })
      .then(function(result) {
        // console.log(result)
          socket.emit('push cat data',JSON.stringify(result));
          fs.writeFile('public/js/Catdata.txt', JSON.stringify(result), (err) => {
            if (err) throw err;
            console.log('Catdata is saved!');
          });
      })
      .catch(function(err) {
          console.log(err.message);
          console.log(err.stack);
      });
      gsjson({
          spreadsheetId: sheet_ID,
           hash : 'id' ,
          worksheet: ['聯組']
      })
      .then(function(result) {
        // console.log(result)
          socket.emit('push cat data',JSON.stringify(result));
          fs.writeFile('public/js/Combo.txt', JSON.stringify(result), (err) => {
            if (err) throw err;
            console.log('Combo is saved!');
          });
      })
      .catch(function(err) {
          console.log(err.message);
          console.log(err.stack);
      });
      gsjson({
          spreadsheetId: sheet_ID,
           hash : 'id' ,
          worksheet: ['敵人資料']
      })
      .then(function(result) {
        // console.log(result)
          socket.emit('push cat data',JSON.stringify(result));
          fs.writeFile('public/js/Enemydata.txt', JSON.stringify(result), (err) => {
            if (err) throw err;
            console.log('Enemydata is saved!');
          });
      })
      .catch(function(err) {
          console.log(err.message);
          console.log(err.stack);
      });
  }

});



const port = 8000 ;
http.listen(process.env.PORT || port, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});
app.use(express.static(path.join(__dirname, '/')));// to import css and javascript
