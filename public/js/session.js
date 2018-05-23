var socket = io();

var url = document.location.href;
var urlArray = url.split('/');
var uuid = urlArray[urlArray.length-1];

var constraints = {
  video:true,
  audio:true
};

var servers = {
   "iceServers": [{ "url": "stun:stun.l.google.com:19302" }]
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
  console.log(event);
  var newRemoteVideo = document.createElement('video');
  var newRemoteAudio = document.createElement('audio');
  newRemoteVideo.setAttribute('autoplay',true);
  newRemoteAudio.setAttribute('autoplay',true);
  //newRemoteVideo.setAttribute('data-id',);
  //newRemoteAudio.setAttribute('data-id',);
  newRemoteVideo.srcObject = event.stream;
  newRemoteAudio.srcObject = event.stream;
  var target = document.getElementById('remote');
  target.appendChild(newRemoteVideo);
  target.appendChild(newRemoteAudio);
};

//var handleRemoveStreamEvent = function(){
//};


socket.emit('room',uuid);

socket.on('host-check',function(){
  $.get("/api/session/"+uuid)
  .then(function(data) {
    data.uuid = uuid;
    socket.emit('host-answer',data);
  });
})

socket.on('signal-ready',function(data){
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream){

    localStream = stream;
    localVideo.srcObject = stream;
    localAudio.srcObject = stream;

    var myPeerConnection = new RTCPeerConnection(servers);
   
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.onaddstream = handleAddStreamEvent;
    
    myPeerConnection.addStream(localStream);
  
    socket.on('new-ice-canidate',function(data){
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
        var description = new RTCSessionDescription(data.sdp);
        myPeerConnection.setRemoteDescription(description);
      });

      socket.emit('video-offer',sdpData);
    });
  })
  .catch(function(err){
    console.error('mediaStream error : ',err);
  });
});


socket.on('video-offer',function(data){

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
    });
  })
  .catch(function(err){
    console.error('mediaStream error : ', err);
  });
});

