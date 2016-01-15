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
		iceServer: {
			"iceServers": [{
				"url": "stun:stun.l.google.com:19302"
			}]
		},
		PC: null,
		OPC: null

	}
	var socket = io();
	ME.RTC.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	ME.RTC.PeerConnection = (window.PeerConnection || window.webkitPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
	ME.RTC.RTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
	ME.RTC.RTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);

	ME.PC = new ME.RTC.PeerConnection(ME.iceServer);


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
		ME.PC.createOffer(function (desc) {
			ME.PC.setLocalDescription(desc);
			socket.emit('userJoin', {
				sdp: desc
			});
		});

	}, function (e) {
		console.log('Reeeejected!', e);
	});

	socket.on('userJoin', function (data) {
		console.log('hava the user join', data);
		//相应请求
		ME.OPC = new ME.RTC.PeerConnection(ME.iceServer);
		//发送ICE候选到其他客户端
		ME.OPC.onicecandidate = function (event) {
			console.log('emit iceSwop');
			console.log(event.candidate);
			socket.emit('iceSwop', {
				candidate: event.candidate
			});
		};
		//监听对接流
		ME.OPC.onaddstream = function (event) {
			ME.DOM.$pormpt.hide(400);
			ME.DOM.$otherView.prop('src', URL.createObjectURL(event.stream));
		};
		ME.OPC.setRemoteDescription(new ME.RTC.RTCSessionDescription(data.sdp));
		ME.OPC.createAnswer(function (desc) {
			console.log('emit answer');
			ME.OPC.setLocalDescription(desc);
			socket.emit('answer', {
				sdp: desc
			});
		});
	});

	socket.on('answer', function (data) {
		console.log('hava in the answer');
		ME.OPC = new ME.RTC.PeerConnection(ME.iceServer);
		ME.OPC.setRemoteDescription(new ME.RTC.RTCSessionDescription(data.sdp));

	});

	socket.on('iceSwop', function (data) {
		console.log('hava in the ice swop');
		ME.OPC.addIceCandidate(new ME.RTC.RTCIceCandidate(data.candidate));
		//监听对接流
		ME.OPC.onaddstream = function (event) {
			ME.DOM.$pormpt.hide(400);
			ME.DOM.$otherView.prop('src', URL.createObjectURL(event.stream));
		};

	});
});
