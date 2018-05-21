var socket = io();

var url = document.location.href;
var urlArray = url.split('/');
var uuid = urlArray[urlArray.length-1];

socket.emit('room',uuid);

socket.on('host-check',function(){
  $.get("/api/session/"+uuid).then(function(data) {
    data.uuid = uuid;
    socket.emit('host-answer',data);
  });
})

socket.on('signal-ready',function(data){
  console.log('I got the signal to start webRTC!');
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream){
    localStream = stream;
    localVideo.srcObject = stream;
    localAudio.srcObject = stream;
    var myPeerConnection = new RTCPeerConnection();
    //Setup Icecanidate handler
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.onaddstream = handleAddStreamEvent;
    //Add the localSteam Object to our connection representation
    myPeerConnection.addStream(localStream);
    //Before we set a local description we need to be able to listen for new-ice-canidate msgs
    //Socket listening for new-ice-canidate msgs
    socket.on('new-ice-canidate',function(data){
      var canidate = new RTCIceCandidate(data.candidate);
      myPeerConnection.addIceCandidate(canidate);
    });
    //Create an SDP with built in createOffer()
    //If it works sets the connection representation's local description with that offer
    //If setting the local configuration succeeds emit a message to the server of video-offer type with the sdp data
    myPeerConnection.createOffer().then(function(offer){
      myPeerConnection.setLocalDescription(offer);
    }).
    then(function(){
      //Socket is listening for video-answer
      socket.on('video-answer',function(data){
        var description = new RTCSessionDescription(data.sdp);
        myPeerConnection.setRemoteDescription(description);
        console.log('SDP information has been fully exchanged.')
      });
      socket.emit('video-offer',{
        sdp: myPeerConnection.localDescription
      });
    });
  })
  .catch(videoError);
});


// An object passed into getUserMedia()
// Lets it know what media types to look for
var constraints = {
    video:true,
    audio:true
}

//Reference to video elements
var localVideo = document.getElementById('local-video');
var localAudio = document.getElementById('local-audio');

//Init stream variables to store mediaStream objects
var localStream;

//If getUserMedia() fails then log the error
var videoError = function(err){
  console.error('mediaStream error : ',err);
}

// An event handler used for ICE canidates that come after setLocalDescription();
var handleICECandidateEvent = function(event) {
  if (event.candidate) {
    //client side will emit a msg of type new-ice-canidate with data of the canidate
    socket.emit('new-ice-canidate',{
      candidate: event.candidate
    });
  }
};

// An event handler for  new stream events (the remote stream)
var handleAddStreamEvent = function(event) {
  var newRemoteVideo = document.createElement('video');
  var newRemoteAudio = document.createElement('audio');
  newRemoteVideo.setAttribute('autoplay',true);
  newRemoteAudio.setAttribute('autoplay',true);
  newRemoteVideo.srcObject = event.stream;
  newRemoteAudio.srcObject = event.stream;
  var target = document.getElementById('remote');
  target.appendChild(newRemoteVideo);
  target.appendChild(newRemoteAudio);
}

//Socket is listening for video-offer
socket.on('video-offer',function(data){
  //Create a new connection representation for the other end
  var myPeerConnection = new RTCPeerConnection();
  //Setup ice-canidate handler
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  myPeerConnection.onaddstream = handleAddStreamEvent;
  //If not get the MediaStream with getUserMedia() and upon success set localStream to the resulting mediaStream Object
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream){
    localStream = stream;
    localVideo.srcObject = stream;
    localAudio.srcObject = stream;
    //Create a pure SDP from the data using the constructor RTCSessionDescription();
    var description = new RTCSessionDescription(data.sdp);
    //Configure the local connection representation with the remote SDP
    myPeerConnection.setRemoteDescription(description);
    //Add the localStream to your local connection representation
    myPeerConnection.addStream(localStream);
    //Before we set a local description we need to be able to listen for new-ice-canidate msgs
    //Socket listening for new-ice-canidate msgs
    socket.on('new-ice-canidate',function(data){
      var canidate = new RTCIceCandidate(data.candidate);
      myPeerConnection.addIceCandidate(canidate);
    });
    //Create an answer(new SDP) to the video-offer
    myPeerConnection.createAnswer().
    //Configure the local connection representation with the local SDP
    then(function(answer){
      myPeerConnection.setLocalDescription(answer);
    }).
    //Send the video answer to the relay server with the local SDP
    then(function(){
      socket.emit('video-answer',{
        sdp: myPeerConnection.localDescription,
      });
    });
  })
  .catch(videoError);
});

