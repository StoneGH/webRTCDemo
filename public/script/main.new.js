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
	ME.RTC.PeerConnection = (window.PeerConnection || window.webkitPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
	ME.RTC.RTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
	ME.RTC.RTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);

	ME.RTC.getUserMedia.call(navigator, {
		//			 audio: true,
		video: true
	}, function (stream) {
		ME.DOM.$myView.prop('src', URL.createObjectURL(stream)).on('loadedmetadata', function (event) {
			console.log("Label: " + stream.id);
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
		var PC;
		//相应请求
		ME.PC = PC = new ME.RTC.PeerConnection(ME.ICE_SERVER);
		//一定要先监听，onicecandidate会在setLocalDescription后触发，所以顺序很重要！！！
		PC.onicecandidate = function (event) {
			console.log('in the icecanidate');
			if (event.candidate) {
				socket.emit('iceSwop', {
					iceData: event.candidate
				});
			}
		}
		PC.onaddstream = function (evt) {
			var stream = evt.stream;
			ME.DOM.$pormpt.hide('slow');
			ME.DOM.$otherView.prop('src', URL.createObjectURL(stream));
		};
		PC.addStream(ME.USE.localStream);
		PC.createOffer(function (desc) {
			PC.setLocalDescription(desc, function () {
				socket.emit('answerOffer', {
					sdp: PC.localDescription
				});
			});
		});
	});
	socket.on('answerOffer', function (data) {
		console.log('in the answeOffer:', data);
		ME.OPC = new ME.RTC.PeerConnection(ME.ICE_SERVER);
		/*ME.OPC.onicecandidate = function (event) {
			console.log('in the icecanidate');
			if (event.candidate) {
				socket.emit('iceSwop', {
					iceData: event.candidate
				});
			}
		}*/
		ME.OPC.onaddstream = function (evt) {
			var stream = evt.stream;
			ME.DOM.$pormpt.hide('slow');
			ME.DOM.$otherView.prop('src', URL.createObjectURL(stream));
		};
		ME.OPC.addStream(ME.USE.localStream);
		ME.OPC.setRemoteDescription(new ME.RTC.RTCSessionDescription(data.sdp), function () {
			ME.OPC.createAnswer(function (desc) {
				ME.OPC.setLocalDescription(desc, function () {
					socket.emit('answerAnswer', {
						sdp: ME.OPC.localDescription
					});
				});
			})
		});

	});
	socket.on('answerAnswer', function (data) {
		console.log('in the answer:');
		ME.PC.setRemoteDescription(new ME.RTC.RTCSessionDescription(data.sdp), function () {
			console.log('流媒体信息交换完成');
		});
	});
	socket.on('iceSwop', function (data) {
		console.log('in the answer Ice:', data);
		var PC = ME.OPC;
		PC.addIceCandidate(new ME.RTC.RTCIceCandidate(data.iceData));
	});
});
