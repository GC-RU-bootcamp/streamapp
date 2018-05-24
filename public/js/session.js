var socket = io();

var url = document.location.href;
var urlArray = url.split('/');
var uuid = urlArray[urlArray.length-1];

var constraints = {
  video:true,
  audio:true
};


var servers = {
   "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
  };


var localVideo = document.getElementById('local-video');
var localAudio = document.getElementById('local-audio');

var localStream;

var handleICECandidateEvent = function(event) {
  if (event.candidate) {
    socket.emit('new-ice-canidate',{
      candidate: event.candidate
    });
  }
};

var handleAddStreamEvent = function(event) {
  console.log('Remote Stream has been received!');
  var id = event.stream.id;

  var newRemoteVideo = document.createElement('video');
  var newRemoteAudio = document.createElement('audio');
  newRemoteVideo.setAttribute('autoplay',true);
  newRemoteAudio.setAttribute('autoplay',true);
  newRemoteVideo.setAttribute('width',250);
  newRemoteVideo.setAttribute('height',250);
  newRemoteVideo.id = id + "-video";
  newRemoteAudio.id = id + "-audio";
  newRemoteVideo.srcObject = event.stream;
  newRemoteAudio.srcObject = event.stream;


  var target = document.getElementById('remote');
  target.appendChild(newRemoteVideo);
  target.appendChild(newRemoteAudio);
};




socket.on('no-host',function(){
  console.log('we tried to send a video offer but there was no host!');
});

socket.emit('room',uuid);

socket.on('host-check',function(){
  $.get("/api/session/"+uuid)
  .then(function(data) {
    document.getElementById('session-name').innerHTML = data.name;
    //send data back to server
    data.uuid = uuid;
    socket.emit('host-answer',data);
  });
})

socket.on('signal-ready',function(data){
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream){
    console.log('I got the signal to start the webRTC!');
    localStream = stream;
    localVideo.srcObject = stream;
    localAudio.srcObject = stream;

    var myPeerConnection = new RTCPeerConnection(servers);
   
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.onaddstream = handleAddStreamEvent;
    myPeerConnection.onremovetrack 

    myPeerConnection.addStream(localStream);
  
    socket.on('new-ice-canidate',function(data){
      console.log('I have got a new ice canidate');
      var canidate = new RTCIceCandidate(data.candidate);
      myPeerConnection.addIceCandidate(canidate);
    });

    myPeerConnection.createOffer()
    .then(function(offer){
      myPeerConnection.setLocalDescription(offer);
    })
    .then(function(){

      var sdpData = {
        sdp: myPeerConnection.localDescription,
        uuid: data.uuid,
        isHost: data.isHost
      };

      console.log("I am going to send UUID: " + sdpData.uuid + " isHost: " + sdpData.isHost);
      
      socket.on('video-answer',function(data){
        console.log('I have received a video answer!');
        var description = new RTCSessionDescription(data.sdp);
        myPeerConnection.setRemoteDescription(description);
      });

      socket.emit('video-offer',sdpData);
    });
      console.log('I sent the video offer!');
  })
  .catch(function(err){
    console.error('mediaStream error : ',err);
  });
});


socket.on('video-offer',function(data){
  console.log('I have received a video offer!');
  var myPeerConnection = new RTCPeerConnection(servers);
  
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  myPeerConnection.onaddstream = handleAddStreamEvent;
  
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream){
    localStream = stream;
    localVideo.srcObject = stream;
    localAudio.srcObject = stream;
    
    var description = new RTCSessionDescription(data.sdp);
    myPeerConnection.setRemoteDescription(description);
    myPeerConnection.addStream(localStream);
 
    socket.on('new-ice-canidate',function(data){
      console.log('I have got a new ice canidate');
      var canidate = new RTCIceCandidate(data.candidate);
      myPeerConnection.addIceCandidate(canidate);
    });
  
    myPeerConnection.createAnswer()
    .then(function(answer){
      myPeerConnection.setLocalDescription(answer);
    })
    .then(function(){
      socket.emit('video-answer',{
        sdp: myPeerConnection.localDescription,
      });
      console.log('I have sent a video answer!');
    });
  })
  .catch(function(err){
    console.error('mediaStream error : ', err);
  });
});

