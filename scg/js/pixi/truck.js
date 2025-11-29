import * as PIXI from 'pixi.js';
import { SelfDrivingCar } from './selfdrivingcar.js';

export class Truck extends SelfDrivingCar {
    constructor() {
        super(90, 206);
        this.speed = this.getSpeed();
        this.oldSpeed = this.speed;
        this.carGraphic = this.createTruckGraphic();
        this.carGraphic.scale.x = this.w / this.carGraphic.w;
        this.carGraphic.scale.y = this.h / this.carGraphic.h;
        this.carGraphic.pivot.x = 210;
        this.carGraphic.pivot.y = 496;
        this.carGraphic.rotation = Math.PI;
        this.addChild(this.carGraphic);
    }
    
    remove(other) {
        this.removeIndefinitely();
        window.host.pixi.addSelfDrivingCars(1);
    }
    
    createTruckGraphic() {
        const host = window.host;
        const c = this.c;
        const car = new PIXI.Graphics();
        
        // Dark parts (roof edge, bottom edge, step)
        car.poly([16,10, 22,4, 188,4, 194,10, 194,30, 16,30]);
        car.poly([0,490, 210,490, 206,496, 4,496]);
        car.poly([30,120, 180,120, 180,130, 30,130]);
        car.fill(host.pixi.hsl2hex(c.h, c.s, c.l - 75));
        
        // Cabin (medium shade)
        car.poly([10,30, 30,10, 180,10, 200,30, 200,120, 10,120]);
        car.fill(host.pixi.hsl2hex(c.h, c.s, c.l - 10));
        
        // Bed and windshield (lighter)
        car.poly([0,110, 20,70, 190,70, 210,110]);
        car.poly([0,130, 210,130, 210,490, 0,490]);
        car.fill(host.pixi.hsl2hex(c.h, c.s, c.l + 21));
        
        car.w = 210;
        car.h = 496;
        return car;
    }
}
