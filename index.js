var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
var port = process.env.VCAP_APP_PORT || 3000;

server.listen(port, function () {
	console.log('服务器运行在localhost: %d', port);
});
// 静态文件托管目录
app.use(express.static(__dirname + '/public'));
var index = 0;
io.on('connection', function (socket) {
	/*用户离开*/
	socket.on('disconnect', function () {
		console.log('user leave');
	});
	socket.on('userJoin', function (data) {
		console.log('in the userJoin')
		socket.broadcast.emit('userJoin', data);
	});
	socket.on('answer', function (data) {
		console.log('in the answer')
		socket.broadcast.emit('answer', data);
	});
	socket.on('answerIce', function (data) {
		console.log('in the answer')
		socket.broadcast.emit('answerIce', data);
	});
	socket.on('answerOffer', function (data) {
		console.log('in the answer Offer')
		socket.broadcast.emit('answerOffer', data);
	});
	socket.on('answerAnswer', function (data) {
		console.log('in the answer Answer')
		socket.broadcast.emit('answerAnswer', data);
	});
	socket.on('iceSwop', function (data) {
		console.log('in the iceSwop')
		socket.broadcast.emit('iceSwop', data);
	});

});
