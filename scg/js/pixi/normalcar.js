import { SelfDrivingCar } from './selfdrivingcar.js';

export class NormalCar extends SelfDrivingCar {
    constructor() {
        super(69, 108);
        this.carGraphic = this.createCarGraphic();
        this.carGraphic.scale.x = this.w / this.carGraphic.w;
        this.carGraphic.scale.y = this.h / this.carGraphic.h;
        this.carGraphic.pivot.x = 180;
        this.carGraphic.pivot.y = 260;
        this.carGraphic.rotation = Math.PI;
        this.addChild(this.carGraphic);
    }
}
