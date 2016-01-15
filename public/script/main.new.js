$(document).ready(function () {
	var ME = {
		DOM: {
			$myView: $('#my-view'),
			$otherView: $('#other-view'),
			$pormpt: $('#prompt')
		},
		USE: {
			localStream: null
		},
		METHODS: {},
		RTC: {},
		ICE_SERVER: {
			iceServers: [{
				url: 'stun:stunserver.org'
			}]
		},
		PC: null,
		OPC: null

	}
	var socket = io();
	ME.RTC.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	window.PeerConnection = (window.PeerConnection || window.webkitPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
	ME.RTC.RTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
	ME.RTC.RTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);

	ME.RTC.getUserMedia.call(navigator, {
		//			 audio: true,
		video: true
	}, function (stream) {
		ME.DOM.$myView.prop('src', URL.createObjectURL(stream)).on('loadedmetadata', function (event) {
			console.log("Label: " + stream.label);
			console.log("AudioTracks", stream.getAudioTracks());
			console.log("VideoTracks", stream.getVideoTracks());
		});
		//发送数据流
		ME.USE.localStream = stream;
		socket.emit('userJoin');

	}, function (err) {
		console.log('Reeeejected!', err);

	});

	socket.on('userJoin', function (data) {
		console.log('hava the user join', data);
		//相应请求
		ME.PC = new window.PeerConnection(ME.ICE_SERVER);

		ME.PC.onicecandidate = function (event) {
			console.log('ok?');
			var description = JSON.stringify(event.candidate);
			console.log(description);
		}
	});
	socket.on('answer', function (data) {
		console.log('in the answer:');
		ME.OPC = new ME.RTC.PeerConnection(ME.iceServer);
		ME.OPC.addIceCandidate(new ME.RTC.RTCIceCandidate(data.iceData));
		ME.OPC.onicecandidate = function (evt) {
			console.log('ice:', evt);
			if (evt.candidate) {
				socket.emit('answerrIce', {
					iceData: evt.candidate
				});
			}
		};

	});
	socket.on('answerIce', function (data) {
		console.log('in the answer Ice:', data);
		ME.PC.addIceCandidate(new ME.RTC.RTCIceCandidate(data.iceData));
	});
});
