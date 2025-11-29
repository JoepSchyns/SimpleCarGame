import * as PIXI from 'pixi.js';
import { Car } from './car.js';

export class LifeCar extends Car {
    constructor(i, c) {
        const w = 77;
        const h = 100;
        const margin = 5;
        super(margin * 2 + (w / 2 + margin) * i, 0, w / 2, h / 2, c);
        
        this.margin = margin;
        this.carGraphic = this.createCarGraphic();
        this.carGraphic.scale.x = this.w / this.carGraphic.w;
        this.carGraphic.scale.y = this.h / this.carGraphic.h;
        this.addChild(this.carGraphic);
    }
    
    remove(other) {
        // Lifecars don't remove on collision
    }
}
