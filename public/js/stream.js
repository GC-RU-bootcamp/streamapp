// Dependencies 
var express = require('express');
var socket = require('socket.io');

//Setting up the Express application
var PORT = 8000;
var app = express();
var server = app.listen(PORT,function(){
  console.log('\t:: Express :: Listening on ' + PORT);
});
app.get('/',function(req,res){
  res.sendFile(__dirname + '/public/html/index.html')
});

//Static Files
app.use(express.static('public'));

//Setting up socket.io to listen on our app
var io = socket(server);

//Init vars for sockets
var Users = [];
var Connections = [];

// If a connection is formed push the connection to the connections array
// Listen for a disconnect for said connection
io.on('connection',function(socket){
  console.log('\t:: Socket :: has made a connection.');
  Connections.push(socket);
  console.log('\t:: Socket :: has ' + Connections.length + ' connections.');

  //If the specific connection stops remove connection from connections array
  socket.on('disconnect',function(){
    console.log('\t:: Socket :: has lost a connection');
    Connections.splice(Connections.indexOf(socket),1);
    console.log('\t:: Socket :: has ' + Connections.length + ' connections.');  
  });

  //Server is listening for a video-offer msg from client-side
  socket.on('video-offer',function(data){
    //if server receives video-offer msg broadcast the video-offer msg to all clients except original sender
    socket.broadcast.emit('video-offer',data);
  });
  //Server is listening for a video-answer msg from client-side
  socket.on('video-answer',function(data){
    //if server receives video-answer msg broadcast the video-answer msg to all clients except original sender
    socket.broadcast.emit('video-answer',data);
  });
  //Server is listening for a video-answer msg from client-side
  socket.on('new-ice-canidate',function(data){
    //if server receives video-answer msg broadcast the video-answer msg to all clients except original sender
    socket.broadcast.emit('new-ice-canidate',data);
  });
});


