import * as PIXI from 'pixi.js';

export class BrakeLine extends PIXI.Container {
    constructor(car) {
        super();
        
        this.x = car.x;
        this.y = car.y;
        this.car = car;
        this.MINSPEED = 1;
        this.attached = true;
        
        this.left = new PIXI.Graphics();
        this.left.rect(5, 0, 8, 1);
        this.left.rect(car.w - 10, 0, 8, 1);
        this.left.fill(0xaaaaaa);
        this.addChild(this.left);
        
        window.host.pixi.brakeLineLayer.addChild(this);
        window.host.pixi.brakeLines.push(this);
    }
    
    update() {
        if (this.attached && !this.car.drag && this.car.brake) {
            const length = Math.round(this.car.y - this.y);
            if (length > 0) {
                this.left.height = length;
            }
        } else {
            this.attached = false;
        }
        
        this.y += this.MINSPEED;
        if (this.y > window.host.pixi.height) {
            this.remove();
        }
    }
    
    remove() {
        const index = window.host.pixi.brakeLines.indexOf(this);
        if (index >= 0) {
            window.host.pixi.brakeLines.splice(index, 1);
            window.host.pixi.brakeLineLayer.removeChild(this);
        }
    }
}
