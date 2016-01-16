/*
var config = {
	iceServers: [{
		url: 'stun:stunserver.org'
	}]
};
var config = {
	iceServers: [{
		url: "stun:stun.l.google.com:19302"
    }]
};

window.PeerConnection = (window.PeerConnection || window.webkitPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);

var PC = new window.PeerConnection(config);
PC.onicecandidate = function (event) {
	//为什么这个onicecandidate事件回调一直没反应
	console.log('iceData');
	console.log(event.candidate);
};
*/
var pc1, pc2, offer, answer;
var options = {
	iceServers: [{
		url: 'stun:stun.l.google.com:19302'
	}]
};

pc1 = new webkitRTCPeerConnection(options);
pc2 = new webkitRTCPeerConnection(options);

pc1.onicecandidate = function (candidate) {
	console.log('p1:', candidate);
	pc2.addIceCandidate(candidate);
};

pc2.onicecandidate = function (candidate) {
	console.log('p2:', candidate);
	pc1.addIceCandidate(candidate);
};

pc1.createOffer(onOfferCreated, onError);

function onError(err) {
	window.alert(err.message);
}

function onOfferCreated(description) {
	offer = description;
	pc1.setLocalDescription(offer, onPc1LocalDescriptionSet, onError);
}

function onPc1LocalDescriptionSet() {
	// after this function returns, pc1 will start firing icecandidate events
	pc2.setRemoteDescription(offer, onPc2RemoteDescriptionSet, onError);
}

function onPc2RemoteDescriptionSet() {
	pc2.createAnswer(onAnswerCreated, onError);
}

function onAnswerCreated(description) {
	answer = description;
	pc2.setLocalDescription(answer, onPc2LocalDescriptionSet, onError);
}

function onPc2LocalDescriptionSet() {
	// after this function returns, you'll start getting icecandidate events on pc2
	pc1.setRemoteDescription(answer, onPc1RemoteDescriptionSet, onError);
}

function onPc1RemoteDescriptionSet() {
	window.alert('Yay, we finished signaling offers and answers');
}
