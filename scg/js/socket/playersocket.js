function Socket (seed,player) {
	var self = this;
	this.seed = seed;
	this.socket = io("http://localhost:8000");
	this.socket.on('connect', function(){ //do stuff when connection is succesfull
		self.connectToRoom();
	});

	this.socket.on("hostHasDisconnected",function(){ //do stuff when to host is not connected//TODO
		console.log("host has disconnected");
		self.socket.disconnect();

	});

	this.socket.on("feedback",function(feedback){
		controller.changeLifes(feedback.lifes);
		console.log(feedback);
	});
	this.socket.on("initialPlayerData",function(color,lifes,pause){
		controller.setupForPlayer(color,lifes);
		controller.setPauseButton(pause);
	});
	this.socket.on("pauseunpause",function(data){
		controller.setPauseButton(data.pause);
	});
}

Socket.prototype.input = function(input) {
	console.log("input " + input);
	this.socket.emit("input",input);
};

Socket.prototype.connectToRoom = function() {
	this.socket.emit("connectToRoom",this.seed,controller.color,function(feedback){
		if(feedback){ //if where able to connect to room
			$("#pause").css("display","inline");
			$("#noroomdialog").css("display","none");
		}else{
			$('body').css("background-color","#ffcbbb");
			$("#noroomdialog").css("display","block");
		}
	});
};
Socket.prototype.connectWithSeedToRoom = function(seed) {
	this.socket.emit("connectToRoom",seed,controller.color,function(feedback){
		if(feedback){ //if where able to connect to room
			controller.setCookieRoomNumber(seed);
			$("#pause").css("display","inline");
			$("#noroomdialog").css("display","none");
		}else{
			$('body').css("background-color","#ffcbbb");
			$("#noroomdialog").css("display","block");
			document.getElementById('roomnumbererror').style.display = 'block';
			document.getElementById('roomnumber').style.borderColor = '#d32f2f';
		}
	});
};

Socket.prototype.setPause = function(pause) {
	var data = {pause:pause};
	this.socket.emit("setPause",data);
};