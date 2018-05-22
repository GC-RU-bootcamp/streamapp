// Requiring necessary npm packages
var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var handlebars = require('express-handlebars');
var socket = require('socket.io');
// Requiring passport as we've configured it
var passport = require("./config/passport");

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8080;
var db = require("./models");

// Creating express app and configuring middleware needed for authentication
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
//Setting up the view engine for handlebars
// Setting up a view engine
app.engine('handlebars', handlebars({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);



// Syncing our database and logging a message to the user upon success
db.sequelize.sync({force: false}).then(function() {
  var server = app.listen(PORT, function() {
  console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  });
  //Setting up socket.io to listen on our app
  var io = socket(server);

  //Setup null array to contain connections
  var hostIDs = [];
  var Connections = [];

  // If a connection is formed push the connection to the connections array
  // Listen for a disconnect for said connection
  io.on('connection',function(socket){
    console.log('\t:: Socket :: has made a connection.');
    Connections.push(socket.id);
    console.log('\t:: Socket :: has ' + Connections.length + ' connections.');

    //If the specific connection stops remove connection from connections array
    socket.on('disconnect',function(){
      console.log('\t:: Socket :: has lost a connection');
      Connections.splice(Connections.indexOf(socket),1);
      console.log('\t:: Socket :: has ' + Connections.length + ' connections.');  
    });

    socket.on('room',function(roomID){
      socket.join(roomID);
      console.log('joined a room || ' + roomID);
      socket.emit('host-check');
    })

    socket.on('host-answer',function(data){
      if(data.isHost === 1){
        var hostInfo = [ socket.id , data.uuid ];
        hostIDs.push(hostInfo);
      }
      socket.emit('signal-ready',data);
    })

    //Server is listening for a video-offer msg from client-side
    socket.on('video-offer',function(data){
      if(data.isHost === 1){
        socket.to(data.uuid).emit('video-offer',data);
      }else{
        for(var i = 0; i < hostIDs.length; i++ ){
          if(data.uuid === hostIDs[i][1]){
            socket.to(hostIDs[i][0]).emit('video-offer',data);
          }
        }
      }
        
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
});
