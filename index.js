var express = require ('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3005;

server.listen(port, function(){
	console.log('Server listening on port %d',port);
});

//routing
app.use(express.static(__dirname+'/'));

//chatroom
var numUsers = 0;

io.on('connection',function(socket){
	var addedUser = false;
	
	// when client types out a new message, this block will listen and execute
	socket.on('new message', function(data){
		socket.broadcast.emit('new message',{
			username: socket.username,
			message:data
		});
	});
	
	socket.on('add user', function(username){
		if(addedUser) return;
		
		socket.username = username;
		++numUsers;
		addedUser = true;
		socket.emit('login',{
			numUsers:numUsers
		});
		
		socket.broadcast.emit('user joined',{
			username:socket.username,
			numUsers:numUsers
		});
		
	});
	
	socket.on('typing',function(){
		socket.broadcast.emit('typing',{
			username: socket.username
		});
	});
	
	socket.on('disconnect',function(){
		if(addedUser){
			--numUsers;
			
			//let everyone know that the user has left.
			socket.broadcast.emit('user left',{
				username: socket.username,
				numUsers: numUsers
				
			});
		}
	});
});