import * as PIXI from 'pixi.js';
import { SelfDrivingCar } from './selfdrivingcar.js';

export class AmbuCar extends SelfDrivingCar {
    constructor() {
        super(64, 120);
        this.carGraphic = this.createAmbuGraphic();
        this.carGraphic.scale.x = this.w / this.carGraphic.w;
        this.carGraphic.scale.y = this.h / this.carGraphic.h;
        this.carGraphic.pivot.x = 166;
        this.carGraphic.pivot.y = 290;
        this.carGraphic.rotation = Math.PI;
        this.addChild(this.carGraphic);
        
        this.text = new PIXI.Text({
            text: "1 up",
            style: { fontFamily: "Arial", fontSize: 12 }
        });
        this.text.y = -25;
        this.addChild(this.text);
    }
    
    remove(other) {
        this.removeIndefinitely();
        window.host.pixi.addSelfDrivingCars(1);
        if (other && other.lifeCars && other.lifesActivated && other.timer === null) {
            other.addLifes(1);
        }
    }
    
    createAmbuGraphic() {
        const host = window.host;
        const c = { h: 0, s: 0, l: 225 };
        const car = new PIXI.Graphics();
        
        // Body
        car.poly([10,10, 20,0, 150,0, 160,10, 160,280, 150,290, 20,290, 10,280]);
        car.fill(host.pixi.hsl2hex(c.h, c.s, c.l));
        
        // Hood and main body (lighter)
        car.poly([30,10, 140,10, 150,80, 20,80]);
        car.poly([25,100, 145,100, 145,280, 25,280]);
        car.fill(host.pixi.hsl2hex(c.h, c.s, c.l + 21));
        
        // Red cross
        car.poly([70,230, 40,230, 40,200, 70,200, 70,170, 100,170, 100,200, 130,200, 130,230, 100,230, 100,260, 70,260]);
        car.fill(host.pixi.hsl2hex(0, 166, 150));
        
        // Light bar (green)
        car.poly([20,120, 150,120, 150,140, 20,140]);
        car.fill(host.pixi.hsl2hex(157, 250, 167));
        
        // Light bar highlight
        car.poly([27,126, 143,126, 143,134, 27,134]);
        car.fill(host.pixi.hsl2hex(157, 250, 186));
        
        // Windshield
        car.poly([20,80, 150,80, 145,100, 25,100]);
        car.fill(0xa7dbdd);
        
        // Wheel arches
        car.poly([4,30, 10,20, 10,90, 4,80]);
        car.poly([160,20, 166,30, 166,80, 160,90]);
        car.poly([4,190, 10,180, 10,250, 4,240]);
        car.poly([160,180, 166,190, 166,240, 160,250]);
        car.fill(host.pixi.hsl2hex(c.h, c.s, c.l - 75));
        
        car.w = 166;
        car.h = 290;
        return car;
    }
}
