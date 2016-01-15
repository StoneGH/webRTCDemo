var config = {
	iceServers: [{
		url: 'stun:stunserver.org'
	}]
};
/*var config = {
	iceServers: [{
		url: "stun:stun.l.google.com:19302"
    }]
};*/

window.PeerConnection = (window.PeerConnection || window.webkitPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);

var PC = new window.PeerConnection(config);
PC.onicecandidate = function (event) {
	//为什么这个onicecandidate事件回调一直没反应
	console.log('iceData');
	console.log(event.candidate);
};
