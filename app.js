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

  socket.on('force_update_cat_data', (data,callback) =>{
    console.log('Someone force me to load cat data ...QAQ') ;
    loadcatData() ;
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });


  function loadcatData(data) {

      let cat = [] ;
      gsjson({
          spreadsheetId: sheet_ID,
          // worksheet: data.rare,
          hash : 'id'
      })
      .then(function(result) {
          socket.emit('push cat data',JSON.stringify(result));
          fs.writeFile('js/Catdata.txt', JSON.stringify(result), (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
          });
      })
      .catch(function(err) {
          console.log(err.message);
          console.log(err.stack);
      });
  }

});



const port = 8000 ;
http.listen(port, function(){
  console.log('listening on :'+port);
});

app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});
app.use(express.static(path.join(__dirname, 'public')));// to import css and javascript
