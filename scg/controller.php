<!DOCTYPE html>
<html>
<title>controls</title>
<meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1, user-scalable=no" minimal-ui>
<!-- Polymer components commented out - not available via CDN -->
<!-- <link rel="import" href="https://cdn.jsdelivr.net/npm/@polymer/font-roboto@3.0.2/roboto.html">
<link rel="import" href="https://cdn.jsdelivr.net/npm/@polymer/paper-button@3.0.1/paper-button.html">
<link rel="import" href="https://cdn.jsdelivr.net/npm/@polymer/paper-toggle-button@3.0.1/paper-toggle-button.html">
<link rel="import" href="https://cdn.jsdelivr.net/npm/@polymer/paper-input@3.2.1/paper-input.html">
<link rel="import" href="https://cdn.jsdelivr.net/npm/@polymer/paper-dialog@3.0.1/paper-dialog.html"> -->
<link rel="manifest" href="WebAppManifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<link rel="shortcut icon" type="image/png" href="images/favicon.png">
<meta name="theme-color" content="#ff9b0a">
<link rel="icon" sizes="192x192" href="images/large_favicon.png">
<script src="https://code.jquery.com/jquery-3.6.0.min.js" type="text/javascript"></script>
<script src="js/jquery.animate-colors-min.js" type="text/javascript"></script>
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script type="text/javascript" src="js/socket/playersocket.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

<script type="text/javascript">
function Controller(){
	this.inGameTime = 0;
	this.counter;
	this.pause = false;
	var self = this;
	this.color;
	var t = <?php echo isset($_GET["s"]) ? json_encode($_GET["s"]) : '""'; ?>;

	if(t == ""){
		t = this.getRoomNumber();
		console.debug(t);
	}
	this.socket = new Socket(t,self); //create new player in room
	this.mobile = (/iphone|ipad|ipod|android|blackberry|mobile|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
	console.log("mobile " + this.mobile);

	this.keys = {left:false,right:false};
	$(window).keydown(function(event){
		if(event.which == 37 && !self.keys.left){ //.left
			self.keys.left = true;
			self.socket.input(-1);
		}else if(event.which == 39 && !self.keys.right){ //right
			self.keys.right = true;
			self.socket.input(1);
		}
	}).keyup(function(event){
		if(event.which == 37){ //.left
			self.socket.input(0);
			self.keys.left = false;
		}else if(event.which == 39){ //right
			self.socket.input(0);
			self.keys.right = false;
		}
	});
	this.gamma = 0;
	this.beta = 0;
	this.alpha = 0;
	this.orientationSupport;
	this.useAccel = false;

	if (window.DeviceOrientationEvent)
		window.addEventListener('deviceorientation', this.getOrientation, false);
	else
		this.orientationNotSupported();

}
Controller.prototype.getRoomNumber= function(){ //look for cookies and get saved seed
	var cookieCrumb = document.cookie.split('=');
	for(var i = 0; i < cookieCrumb.length;i++){
		if(cookieCrumb[i] == "roomNumber"){
				return cookieCrumb[i + 1];//return previous seed
			}
		}
		return false; //no room was created in this browser before
	}

	Controller.prototype.setCookieRoomNumber= function(number){
		console.debug(number);
		 document.cookie = 'roomNumber=' + number; //create cookie
	}

	Controller.prototype.getOrientation = function(eventData) {
	if(window.orientation === 90 ){ //if is in landscape mode
		controller.gamma = Math.round(eventData.beta);//rotate direction of orientation with the orientation of the device
	}else if(window.orientation === -90){
		controller.gamma = -Math.round(eventData.beta);//rotate direction of orientation with the orientation of the device
	}else{ //if is in protrait
		controller.gamma = Math.round(eventData.gamma);
	}
	if(controller.orientationSupport === undefined ){
		if(eventData.gamma + eventData.beta + eventData.alpha === 0)
			controller.orientationNotSupported();
		else
			controller.orientationSupport = true;
	}else if(controller.useAccel){
		var input = (1.0 / 40.0) * controller.gamma;
		if(Math.abs(input) < .2)
			input = 0;
		else if(input > 1)
			input = 1;
		else if(input < -1)
			input = -1;
		controller.socket.input(input);
	}
};

Controller.prototype.orientationNotSupported = function() {
	controller.orientationSupport = false;
	$("body").append("<span> accelrometer Not supported.</span>");
	window.removeEventListener('deviceorientation', this.getOrientation, false);
};


Controller.prototype.setupForPlayer = function(color,lifes) {
	$("#lifes").text(lifes);
	controller.color = "#" + color.substr(2);
	$("body").css("background-color",controller.color);
	this.counter = setInterval(function(){ //setup interval for timeimg the ingame score
		$('#time').text(++controller.inGameTime);
	},1000);
};

Controller.prototype.changeLifes = function(lifes){
	var prevLifes = $("#lifes").text();
	var pos = ($("#lifes").text() < lifes); //if lifes where added
	console.debug(pos);
	$("#lifes").text(lifes);
	if(lifes > 0){ //if alive
		if(pos)
			this.animateBackground("#9bfd92"); //flash green
		else
			this.animateBackground("#fd9292"); //flash red

	}else{ //if is dead
		if(this.counter !== undefined)
			clearInterval(this.counter);
		$("#playagainscreen").css("display","inline");

	}
}
Controller.prototype.animateBackground = function(color) {
	$("body").animate({
		backgroundColor: color

	},100,function(){
		$("body").animate({
			backgroundColor: controller.color
		},100);
	});
};
Controller.prototype.setPauseButton = function(pause){
	console.debug(pause);
	this.pause = pause;
	if(this.pause)
		$("#pause").html('<i class="fa fa-play"></i>'); //set play icon
	else
		$("#pause").html('<i class="fa fa-pause"></i>'); //set pause icon
}
Controller.prototype.pauseunpause = function() { //reverse pause
	console.log("test");
	this.pause = !this.pause;
	this.socket.setPause(this.pause);
	if(this.pause)
		$("#pause").html('<i class="fa fa-play"></i>'); //set play icon
	else
		$("#pause").html('<i class="fa fa-pause"></i>'); //set pause icon
};
Controller.prototype.setRoomNumber = function() {
	var value = document.getElementById('roomnumber').value;
	var errorDiv = document.getElementById('roomnumbererror');
	var input = document.getElementById('roomnumber');

	if(value.length == 0 || value.length < 3){
		errorDiv.style.display = 'block';
		input.style.borderColor = '#d32f2f';
	}else{
		var valid = /^[0-9]{3,5}$/.test(value);
		if(valid){
			errorDiv.style.display = 'none';
			input.style.borderColor = '#4caf50';
			document.getElementById('noroomdialog').style.display = 'none';
			this.socket.connectWithSeedToRoom(value);
		}else{
			errorDiv.style.display = 'block';
			input.style.borderColor = '#d32f2f';
		}
	}
};


var controller;
$(function(){ //do stuff when page has loaded
	window.scrollTo(0,1);
	controller = new Controller();
	if(controller.mobile){
		$("#buttons").css("display","inline");
		$("#toggle").bind('change',function(eventData){
			if(controller.useAccel){
				controller.useAccel = false;
				$('#RB').css("display","inline");
				$('#LB').css("display","inline");
			}else{
				controller.useAccel = true;
				$('#RB').css("display","none");
				$('#LB').css("display","none");

			}
		});
	}

	$('#RB').bind('touchstart',function(){controller.socket.input(1);});//start moving left
	$('#RB').bind('touchend',function(){controller.socket.input(0); });//start moving left
	$('#LB').bind('touchstart',function(){controller.socket.input(-1)});//start moving left
	$('#LB').bind('touchend',function(){controller.socket.input(0); });//start moving left



});

</script>
<style>
body{
	margin:0;
	height:100%;
	font-family: RobotoDraft, 'Helvetica Neue', Helvetica, Arial;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

#RB{
	right:0;
	width: 100px;
	height: 100px;
	background-color: #ff9b0a;
}
#LB{
	width: 100px;
	height: 100px;
	background-color: #ff9b0a;
}
#toggletext{
	position: absolute;
	left:50%;
	width:200px;
	text-align: center;
	margin-left: -100px;
}
paper-toggle-button{
	position:absolute;
	left:50%;
	margin-left: -15px;
	margin-top:40px;
}
/* Button */
.button {
	display: inline-block;
	position: absolute;
	text-align: center;
	line-height: 32px;
	border-radius: 2px;
	font-size: 0.9em;
	color: #fff;

}

.button > paper-ripple {
	border-radius: 2px;
	overflow: hidden;

}

.button.raised {
	transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	transition-delay: 0.2s;
	box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
}

.button.raised:active {
	box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2);
	transition-delay: 0s;
}

#pause{
	display:none;
	position: absolute;
	left:5px;
	top:5px;
	width:50px;
	height:50px;
	-webkit-border-radius: 25px;
	-moz-border-radius: 25px;
	border-radius: 25px;
	line-height: 50px;
	text-align: center;
	font-size:20px;
	background-color: #0a6eff;
}
html /deep/ paper-dialog {
	position: absolute;
	z-index: 100;
	left:50%;
	width:250px;
	margin-left: -125px;

}


</style>
<body>
<!-- Simple HTML replacement for Polymer dialog -->
<div id="noroomdialog" style="display:block; position:fixed; z-index:200; left:50%; top:50%; transform:translate(-50%, -50%); width:300px; padding:20px; background:white; box-shadow:0 4px 6px rgba(0,0,0,0.3); border-radius:4px;">
	<h3 style="margin-top:0; color:#333;">Fill in your room number</h3>
	<div style="margin:20px 0;">
		<input id="roomnumber" type="text" pattern="[0-9]{3,5}" maxlength="4" placeholder="xxxx" 
		       style="width:100%; padding:10px; font-size:16px; border:2px solid #ddd; border-radius:4px; box-sizing:border-box;">
		<div id="roomnumbererror" style="display:none; color:#d32f2f; font-size:12px; margin-top:5px;">Please enter a valid room number (3-5 digits)</div>
	</div>
	<button onclick="controller.setRoomNumber();" 
	        style="width:100%; padding:12px; background:#ff9b0a; color:white; border:none; border-radius:4px; font-size:16px; cursor:pointer; font-weight:bold;">
		Accept
	</button>
</div>
<!-- pause button -->
<div id="pause" class="button raised" onclick="controller.pauseunpause();">
	<div  fit>
		<i class="fa fa-pause"></i>
	</div>
	<paper-ripple class="circle recenteringTouch" fit></paper-ripple>
</div>
<!-- play again screen -->
<div style="display:none; position:absolute; z-index:99; left:0; top:0; width:100%; height:100%; background-color:rgba(227,227,227,0.8);" id="playagainscreen">
	<div style="position:absolute;z-index:100; left:50%; top:50%; margin-left:-50px; width:100px; height:40px; line-height: 40px; font-size:17px; background-color: #ff9b0a;" class="button raised" onclick="controller.socket.connectToRoom(); $('#playagainscreen').css('display','none');">
		<div class="center" fit>
			Play again
		</div><paper-ripple fit></paper-ripple>
	</div>
</div>
<!-- display lifes -->
<div style="z-index:0; position:absolute; width:200px;height:50px; left:50%; top:25%; margin-left:-100px; text-align:center; font-size:20px;">
	lifes <span id="lifes" style="font-size:30px"></span>
</div>
<!-- timer -->
<div style="width:100px;position:absolute; top:40%; left:50%; margin-left:-50px; font-size:15px; text-align: center;">
	<span id="time"></span><span> seconds</span>
</div>

<!--buttons and accelrometer toggle -->
<div style="width:100%;position:absolute; top:50%; display:none;" id="buttons">
	<div style="position:relative; ">
		<div id="LB" class="button raised">
			<div fit>
				L
			</div>
			<paper-ripple fit></paper-ripple>
		</div>
		<span id="toggletext">turn on accelrometer</span>
		<paper-toggle-button id="toggle"></paper-toggle-button>
		<div id="RB" class="button raised">
			<div fit>
				R
			</div>
			<paper-ripple fit class="circle recenteringTouch" fit></paper-ripple>
		</div>
	</div>
</div>



</body>
</html>
