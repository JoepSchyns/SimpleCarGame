import * as PIXI from 'pixi.js';
import { Car } from './car.js';
import { LifeCar } from './lifecar.js';

export class PlayerCar extends Car {
    constructor(id, c) {
        let color = c;
        if (c == null) {
            const randColor = window.host.pixi.randomPleasingColor(255, 155, 10);
            color = window.host.pixi.rgb2hsl(randColor.r, randColor.g, randColor.b);
        } else {
            color = window.host.pixi.hex2hsl(c.substring(1));
        }
        
        super(
            Math.random() * (window.host.pixi.width / 1.5) + window.host.pixi.width / 4,
            window.host.pixi.height / 2,
            80,
            110,
            color
        );
        
        this.carGraphic = this.createCarGraphic();
        this.carGraphic.scale.x = this.w / this.carGraphic.w;
        this.carGraphic.scale.y = this.h / this.carGraphic.h;
        this.addChild(this.carGraphic);
        
        this.id = id;
        this.remote = false; // Default to local player
        this.timeOffset = Math.PI * Math.random();
        this.centerY = this.y;
        this.move = { x: 0, y: 0 };
        this.maxMove = 10;
        this.lifesActivated = false;
        
        // Setup life cars
        this.lifeCars = new PIXI.Container();
        this.updateHeightLifeCars(window.host.pixi.players.length);
        this.addLifes(10);
        window.host.pixi.stage.addChild(this.lifeCars);
        
        // Setup invincibility timer
        const lengthTimer = 350;
        this.timeOutLifesActivated = 5000 / lengthTimer;
        this.timer = setInterval(() => {
            if (this.alpha < 0.6) {
                this.alpha = 1;
            } else {
                this.alpha = 0.1;
            }
            if (this.lifesActivated && this.timeOutLifesActivated-- < 0) {
                this.alpha = 1;
                window.clearInterval(this.timer);
                this.timer = null;
            }
        }, lengthTimer);
        
        this.left = 37;  // Default to left arrow key
        this.right = 39; // Default to right arrow key
    }
    
    display() {
        const host = window.host;
        if (this.x + this.move.x < host.pixi.width - this.h / 2 - host.pixi.MARGIN && 
            this.x + this.move.x > host.pixi.MARGIN) {
            if (!this.remote) {
                if (host.pixi.pressedKeys[this.left]) {
                    this.x -= this.maxMove;
                }
                if (host.pixi.pressedKeys[this.right]) {
                    this.x += this.maxMove;
                }
            } else {
                this.x += this.move.x;
            }
        }
        this.y = this.centerY + Math.sin(this.timeOffset + host.pixi.frames / 200) * this.h;
    }
    
    remove(other) {
        if (this.lifesActivated && this.timer === null) {
            const lifesLeft = this.lifeCars.children.length;
            if (lifesLeft > 0) {
                this.lifeCars.removeChildAt(this.lifeCars.children.length - 1);
                const newLifesLeft = this.lifeCars.children.length;
                if (this.remote && window.host && window.host.socketManager) {
                    window.host.socketManager.sendHostFeedback(this.id, { 
                        message: "Life lost", 
                        lives: newLifesLeft
                    });
                }
            } else {
                window.host.pixi.removePlayer(this.id);
                if (this.remote && window.host && window.host.socketManager) {
                    window.host.socketManager.sendHostFeedback(this.id, { 
                        message: "Game over", 
                        lives: 0 
                    });
                }
            }
        }
    }
    
    updateHeightLifeCars(row) {
        const margin = 5;
        this.lifeCars.y = (this.h / 2 + margin) * row + margin;
    }
    
    addLifes(amount) {
        for (let i = 0; i <= amount; i++) {
            this.lifeCars.addChild(new LifeCar(this.lifeCars.children.length, this.c));
        }
    }
}
