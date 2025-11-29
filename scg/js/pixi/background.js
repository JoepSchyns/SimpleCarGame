function Background(w,h,margin){
	this.margin = margin;
	this.h = h;
	PIXI.Container.call(this); //create container for all graphics
	var totalFences = 8;


	this.grassL = new PIXI.Graphics();
	this.grassL.beginFill('0x9cf39c');
	this.grassL.drawRect(0,0,margin,h);
	this.addChild(this.grassL);

	this.grassR = new PIXI.Graphics();
	this.grassR.beginFill('0x9cf39c');
	this.grassR.drawRect(0,0,margin,h);
	this.grassR.x = w - margin;
	this.addChild(this.grassR);

	for (var i = 0; i < totalFences; i++) {
		var fence = new PIXI.Sprite(PIXI.Texture.fromImage("images/fence.png"));
		fence.anchor.x = 1;
		fence.anchor.y = 0.5;
			if(i < totalFences / 2){ //place half of the fences left others right
				fence.position.y = (h / (totalFences / 2 )) * (i + 1);
				fence.position.x = margin * .8;
				fence.right = true;
			}else{
				fence.position.y = (h / (totalFences / 2 )) * (i - totalFences / 2 + 1);
				fence.position.x = w - margin * .8;
				fence.scale.x = -1;
				fence.right = false;
			}
			this.addChild(fence);
			this.fences.push(fence);
		};

	}

	Background.prototype = PIXI.Container.prototype;

	Background.prototype.fences = [];

	Background.prototype.MINSPEED = 1;

	Background.prototype.update = function() {
		this.fences.forEach(function(f){
			f.y += this.MINSPEED;
			console.debug("host.pixi.height ipv 1080");
			if(f.y > 1080)
				f.y = -100;
		}.bind(this));
	};

	Background.prototype.resize = function(){
		console.debug(this.grassR.x);
		this.grassL.width = (host.pixi.MARGIN / this.margin);
		this.grassL.height = host.pixi.height / this.h;
		this.grassR.x =host.pixi.width - host.pixi.MARGIN;
		this.grassR.width = (host.pixi.MARGIN / this.margin);
		this.grassR.height = host.pixi.height / this.h;
		this.fences.forEach(function(f){
			if(f.right)
				f.x = host.pixi.MARGIN * .8;
			else
				f.x = host.pixi.width - host.pixi.MARGIN * .8;
		});
	}
