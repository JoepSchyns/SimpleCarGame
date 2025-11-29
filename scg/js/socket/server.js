var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(8000, '0.0.0.0', function() {
  console.log('Socket server up and running at port 8000');
});
var hosts = {};//create object in which room seed which host is active

io.on('connection',function(socket){

	socket.on("createRoom",function(seed){ //create room <only acces as host>
		console.log("createRoom");
		hosts[seed] = socket.id;
		socket.join(seed); // join room
		socket.room = seed; //save room;
		socket.host = true; //is host
	});
	socket.on("connectToRoom",function(seed,c,fn){ //connect to room <oly acces as player
		console.log("connectToRoom");
		if(hosts[seed] !== undefined){//check of room with this seed excists
			socket.to(hosts[seed]).emit("createPlayer",socket.id,c); //TODO
			fn(true); //send able to connect
			socket.join(seed);//join room
			socket.room = seed //save room
			socket.host = false; //is not a host
			
		}else
		fn(false); //send not able to connect
	});

	socket.on("input",function(input){
		console.log("input " + input);
		socket.to(hosts[socket.room]).emit("input",input,socket.id);//TODO
	});
	socket.on("feedback",function(feedback,id){
		console.log("feedback");
		socket.to(id).emit("feedback",feedback);
	});
	socket.on("initalPlayerData",function(id,color,lifes,pause){
		console.log("initialPlayerData");
		socket.to(id).emit("initialPlayerData",color,lifes,pause);
	});

	socket.on('disconnect', function () { 
		console.log("disconnect " + socket.id);
		if(socket.host){ 
			socket.in(socket.room).emit("hostHasDisconnected");
			delete hosts[socket.room]; 

		}else if(hosts[socket.room] !== undefined){ //if player has disconnecte
			socket.to(hosts[socket.room]).emit("removePlayer",socket.id);//TODO
		}
	});
	socket.on("setPause",function(data){
		console.log("setPause");
		socket.in(socket.room).emit("pauseunpause",data);//TODO
	});
});