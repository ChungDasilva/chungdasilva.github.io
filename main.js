const socket = io('https://video-call-tnt4.herokuapp.com/');

$('#div-chat').hide();

let customConfig;
$(function(){
    // Get Xirsys ICE (STUN/TURN)
    if(!ice){
        ice = new $xirsys.ice('/webrtc');
        ice.on(ice.onICEList, function (evt){
            console.log('onICE ',evt);
            if(evt.type == ice.onICEList){
                create(ice.iceServers);
            }
        });
    }
});

function create() {
    // PeerJS object
    peer = new Peer({ key: 'lwjd5qra8257b9', debug: 3, config: ice.iceServers});
    peer.on('open', function(){
        console.log(peer.id);
        $('#my-id').text(peer.id);
    });
    // Receiving a call
    peer.on('call', function(call){
        // Answer the call automatically (instead of prompting user) for demo purposes
        call.answer(window.localStream);
        step3(call);
    });
    peer.on('error', function(err){
        alert(err.message);
        // Return to step 2 if error occurs
        step2();
    });
    setup();
}

function setup() {
    console.log('ok');
    // $('#make-call').click(function(){
    //     // Initiate a call!
    //     var call = peer.call($('#callto-id').val(), window.localStream);
    //     step3(call);
    // });
    // $('#end-call').click(function(){
    //     window.existingCall.close();
    //     step2();
    // });
    // // Retry if getUserMedia fails
    // $('#step1-retry').click(function(){
    //     $('#step1-error').hide();
    //     step1();
    // });
    // // Get things started
    // step1();
}

$.ajax({
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "chungdasilva",
    secret: "4e8ff9e8-788b-11e9-9e32-0242ac110003",
    domain: "chungdasilva.github.io",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function (data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();

    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAT', () => alert('Vui long chon username khac!'));


function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));

const peer = new Peer({ 
    config: customConfig 
});

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { ten: username, peerId: id });
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});
