// Make Socket for front End
var socket = io.connect('http://localhost:8000');

// An object passed into getUserMedia()
// Lets it know what media types to look for
var constraints = {
  video:true
}

//Reference to video elements
var localVideo = document.getElementById('local-video');
var remoteVideo = document.getElementById('remote-video');

//Reference to buttons
var startButton = document.getElementById('start-btn');
var callButton = document.getElementById('call-btn');

//Init stream variables to store mediaStream objects
var localStream;
var remoteStream;

//If getUserMedia() works then 
//Set localStream to the mediaStream object
//Set the source of the local video as mediaStream object
var localVideoSuccess = function(stream){
  localStream = stream;
  localVideo.srcObject = stream;
}

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
  remoteVideo.srcObject = event.stream;
}

//Add an on-click event listener to the start button
startButton.addEventListener('click',function(){
  console.log('The start button has been clicked!');
  navigator.mediaDevices.getUserMedia(constraints).then(localVideoSuccess).catch(videoError);
  //turn off the start button
  startButton.disabled = true;
});

//Add an on-click event to the call button
callButton.addEventListener('click',function(){
  //Disable Call button
  callButton.disabled = true;
  //Create a RTCPeerConnection object locally
  //Represents our connection
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

//Socket is listening for video-offer
socket.on('video-offer',function(data){
  //disable all the buttons
  startButton.disabled =true;
  callButton.disabled = true;
  //Create a new connection representation for the other end
  var myPeerConnection = new RTCPeerConnection();
  //Setup ice-canidate handler
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  myPeerConnection.onaddstream = handleAddStreamEvent;
  //If not get the MediaStream with getUserMedia() and upon success set localStream to the resulting mediaStream Object
  navigator.mediaDevices.getUserMedia(constraints).then(localVideoSuccess).
  then(function(){
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
        sdp: myPeerConnection.localDescription
      });
    });
  }).catch(videoError);
});