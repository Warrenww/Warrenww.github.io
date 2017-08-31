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
  loadcatData() ;
  
  socket.on('load cat name',function (data) {
    console.log(data) ;
    loadcatName(data.cat) ;
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  function loadcatName(rare) {
    console.log('loading cat name ...') ;
      let cat = [] ;
      gsjson({
          spreadsheetId: sheet_ID,
          worksheet: rare,
          hash : 'id'
      })
      .then(function(result) {
          for(let i in result){
            let obj = {} ;
            obj.id = result[i].id ;
            obj.name = result[i]['全名'] ;
            cat.push(obj) ;
          }
          socket.emit('push cat name',cat);
      })
      .catch(function(err) {
          console.log(err.message);
          console.log(err.stack);
      });
  }

  function loadcatData(data) {
      console.log('loading cat data ...') ;
      let cat = [] ;
      gsjson({
          spreadsheetId: sheet_ID,
          // worksheet: data.rare,
          hash : 'id'
      })
      .then(function(result) {
          socket.emit('push cat data',result);
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
