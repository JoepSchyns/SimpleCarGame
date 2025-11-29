import { Car } from './car.js';
import { BrakeLine } from './brakeline.js';

export class SelfDrivingCar extends Car {
    constructor(w, h) {
        const host = window.host;
        const SpawnOpp = w * h * 4;
        super(
            Math.random() * (host.pixi.width - w - host.pixi.MARGIN * 2) + host.pixi.MARGIN,
            Math.random() * (-host.pixi.height * 2) - h,
            w, h,
            { h: Math.round(Math.random() * 255), s: Math.round(Math.random() * 254), l: Math.round(Math.random() * 179) + 50 }
        );
        this.SpawnOpp = SpawnOpp;
        this.speed = this.getSpeed();
        this.oldSpeed = this.speed;
        this.brake = false;
        this.drag = false;
        this.ACCEL = host.datVars.maxAcceleration;
        this.MINSPEEDDIF = 1;
        this.MINSPEED = 1;
        this.BRAKINGDIST = 150;
        this.MINDIST = 75;
    }
    getSpeed() { return window.host.datVars.minSpeed + Math.random() * window.host.datVars.maxIncreasedSpeed; }
    display() { this.y += this.speed; if (this.y > window.host.pixi.height) this.remove(); this.collision(); this.inSight(); }
    inSight() {
        const host = window.host;
        if (this.smallestDist !== -1 && this.smallestDist < this.BRAKINGDIST) {
            if (!this.brake) { this.addChild(this.brakeLights); this.brake = true; if (this.y > 0 && this.speed > this.voorliggerSpeed * 2) new BrakeLine(this); }
            const difSpeed = this.voorliggerSpeed - this.speed;
            if (this.smallestDist > this.MINDIST) {
                if (!this.drag) {
                    const absDifSpeed = Math.abs(difSpeed);
                    if (absDifSpeed < this.ACCEL) { this.speed = this.voorliggerSpeed; this.removeChild(this.brakeLights); this.drag = true; }
                    else if (this.speed > this.MINSPEED) this.speed += difSpeed / Math.abs(difSpeed) * this.ACCEL;
                }
            } else {
                if (host.datVars.dodge && (this.smallestDistX_L === -1 || this.smallestDistX_R !== -1 && -this.smallestDistX_L > this.smallestDistX_R && -this.smallestDistX_L > this.w * 1.5)) this.x -= this.ACCEL * 10;
                else if (host.datVars.dodge && (this.smallestDistX_R > this.w * 1.5 || this.smallestDistX_R === -1)) this.x += this.ACCEL * 10;
                else if (difSpeed < this.MINSPEEDDIF && this.speed > this.MINSPEED) {
                    if (this.drag) { this.addChild(this.brakeLights); this.drag = false; }
                    if (this.speed - this.ACCEL < this.MINSPEED) this.speed = this.MINSPEED;
                    else this.speed -= this.speed / 10 + this.ACCEL;
                }
            }
        } else if (this.smallestDist > this.BRAKINGDIST || this.smallestDist === -1) {
            if (this.brake) { this.removeChild(this.brakeLights); this.brake = false; this.drag = false; }
            if (this.speed < this.oldSpeed) this.speed += this.ACCEL;
        }
    }
    remove(other) {
        const host = window.host;
        if (host.pixi.addNonNormalCar()) { this.removeIndefinitely(); host.pixi.updateCollisionCars(); }
        else {
            const spawningLengthNeeded = (this.SpawnOpp * host.pixi.amountOfCars) / host.pixi.width;
            this.y = -this.h - Math.random() * spawningLengthNeeded;
            this.x = Math.random() * (host.pixi.width - this.w - host.pixi.MARGIN * 2) + host.pixi.MARGIN;
            this.speed = this.getSpeed();
            this.oldSpeed = this.speed;
        }
    }
    removeIndefinitely() {
        const index = window.host.pixi.selfDrivingCars.indexOf(this);
        if (index >= 0) { window.host.pixi.selfDrivingCars.splice(index, 1); window.host.pixi.stage.removeChild(this); }
    }
}
