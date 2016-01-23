# WebRTc 简易聊天室DOME


前几天看的的WebRtc，很神奇的一个东西，支持浏览器之间点对点之间的流对接，比web socket更牛逼。不过因为是新特性，所以支持还不是很好。


WebRtc很适合实时的数据传输，它造成的网络延迟比传统的服务器转发要低很多。非常适合做即时的的文件传输与视频聊天室。


这次实现的的就是一个简单的视频聊天室。

主要参照的教程是[天镶的博客-即时通讯](http://lingyu.wang/#/category/即时通信)



由于WebRtc要求传输网络以https加密，由于我电脑没有装openSSL，所以就没搞成https服务器，不过在局域网下应该时能用的。


webRtc在天镶的博客教程里已经写得很清楚，大家可以参照他的教程。


webRTC建立联接最重要的就是信令交换与ICE描述交换，具体可以参照博客。这里我就提一下我学这个碰到的坑。简单讲一下两个浏览器之间如何建立webRTC联接。

虽然webRTC是浏览器之间的点对点联接，但它们之间建立的联接还是需要服务器支持的。


下面有A和B两个浏览器，它们建立webRTC的联接的过程是：


* A和B各自创建自己的RTCPeerConnection对象，简称PC。
* A通过PC所提供的createOffer()方法建立一个包含A的SDP描述符的offer信令
* A通过PC所提供的setLocalDescription()方法，将A的SDP描述符交给A的PC实例
* A将信令经过服务器发给B
* B将A的offer信令中所包含的的SDP描述符提取出来，通过PC所提供的setRemoteDescription()方法交给B的PC实例
* B通过PC所提供的createAnswer()方法建立一个包含B的SDP描述符answer信令
* B通过PC所提供的setLocalDescription()方法，将B的SDP描述符交给B的PC实例
* B将answer信令通过服务器发送给A
* A接收到B的answer信令后，将其中B的SDP描述符提取出来，调用setRemoteDescripttion()方法交给A自己的PC实例



简单描述为：

* A创建offer。
* A --------发送offer--------> B
* B接收A的offer并设置，并由B创建anwer。
* B --------发送anwer--------> A
* A接收B的anwer并设置.


通过在这一系列的信令交换之后，和B所创建的PC实例都包含A和B的SDP描述符了，完成了两件事的第一件。我们还需要完成第二件事——获取连接两端主机的网络地址，即ICE的交换。


ICE的交换其实发生在A和B的SDP描述符交换期间。简单来说：


* A创建完PC实例后并为其添加onicecandidate事件回调。
* 当A网络候选可用时，将会调用onicecandidate函数，回调函数中包含A的ICE描述。
* A发送ICE给B
* B接收并调用PC的addIceCandidate()将A的ice描述符加入，从而获取到A的网络地址。

ice交换只需要一方含有另一方的ice描述就行，不需要和sdp一样需要相互交换。


还有就是**onicecandidate事件,发生在PC实例setLocalDescription()之后，所以一定要在setLocalDescription()之前监听事件**，这就是我碰到的坑。

这样连接就创立完成了，可以向RTCPeerConnection中通过addStream()加入流来传输媒体流数据。将流加入到RTCPeerConnection实例中后，对方就可以通过onaddstream所绑定的回调函数监听到了。调用addStream()可以在连接完成之前，在连接建立之后，对方一样能监听到媒体流。


后台服务器使用socket.io，就是简单的转发消息。



简单的webrtc建立就是这样，具体请参照天镶的博客。










