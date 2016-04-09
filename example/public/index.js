var socket = io.connect('http://localhost:8000');

socket.on('response', function (data) {
  console.log(data)
});
socket.emit('request',{path:"update",data:{name:"test"}});
socket.emit('request',{path:"init/12",data:{name:"test"}});
socket.emit('request',{path:"init",data:{name:"test"}});
