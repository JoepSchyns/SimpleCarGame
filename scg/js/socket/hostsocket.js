function Socket(seed){

	var self = this;
	self.socket = io("http://localhost:8000");
	self.socket.on('connect', function(){ //do stuff when connection is succesfull
	console.log("connection");
	self.socket.emit("createRoom",seed);//create room on server
	host.pixi.players.length = 0; //remove previouse players
	});

	self.socket.on("createPlayer",function(id,c){
		var player = host.pixi.createPlayer(id,c);
		player.remote = true;
		self.socket.emit("initalPlayerData",id,host.pixi.hsl2hex(player.c.h,player.c.s,player.c.l),player.lifeCars.children.length,host.pixi.paused);
	host.setPlayerButton(host.pixi.hsl2hex(player.c.h,player.c.s,player.c.l),id);
	});
	self.socket.on("removePlayer",function(id){
		host.pixi.removePlayer(id);
		host.removePlayerButton(id);
		if(host.pixi.player.length == 0) //if no players are left
			host.pixi.startFrame = -1; //-1 means no game currently running
	});

	self.socket.on("input",function(input,id){
		var player =  host.pixi.players[$.map(host.pixi.players, function(obj, index) {if(obj.id == id) {return index;}})];
		player.move.x = input * player.maxMove;
	});
	self.socket.on("pauseunpause",function(data){
		if(!data.pause && host.pixi.paused){
			host.pixi.paused = false;
			host.pixi.startAnim();
		}else if(data.pause)
			host.pixi.paused = true;

	});

}

Socket.prototype.feedback = function(feedback,id) {
	this.socket.emit("feedback",feedback,id);
}
