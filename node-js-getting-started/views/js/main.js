app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === '<validation_token>') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging; //所有訊息

  for (i = 0; i < messaging_events.length; i++) { // 遍歷毎一則

    event = req.body.entry[0].messaging[i];
    sender = event.sender.id; // 誰發的訊息

    if (event.message && event.message.text) {
      text = event.message.text;
      // Handle a text message from this sender

    }
  }
  res.sendStatus(200);
});

var token = "EAADkjQI3disBAOXwEeGy5cbbwVmNOkxXwuZBzkxTO966l6s5svyZCltoY54VZCuarZANYymAiScU8wkoi28dLDJfLElrigDAZCxtapGi9ouZCXmrEr8cHyfAvK2D7ZCcu2JRQlW3ZBl3d7CDuanmZBdZBLZANLYOeK6dZArWoen9O2jKZAnMmICCa8VxC";

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
