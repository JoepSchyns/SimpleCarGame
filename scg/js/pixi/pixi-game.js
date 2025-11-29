import * as PIXI from 'pixi.js';
import { Background } from './background.js';
import { PlayerCar } from './playercar.js';
import { NormalCar } from './normalcar.js';
import { AmbuCar } from './ambucar.js';
import { Truck } from './truck.js';

export class PixiGame {
    constructor() {
        this.amountOfCars = 0;
        this.paused = false;
        this.frames = 0;
        this.startFrame = -1; // -1 means no game is started
        this.started = false;
        this.pressedKeys = {};
        
        // Setup keyboard listeners
        window.addEventListener('keydown', (event) => {
            this.pressedKeys[event.keyCode] = true;
        });
        
        window.addEventListener('keyup', (event) => {
            this.pressedKeys[event.keyCode] = false;
        });
        
        // Get dimensions
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.MARGIN = 200 * this.width / 1920;
        
        // Create application (Pixi v8 async initialization)
        this.app = new PIXI.Application();
    }
    
    async initializeApp() {
        await this.app.init({
            width: this.width,
            height: this.height,
            background: 0xC8C8C8,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        // Preload fence texture
        await PIXI.Assets.load('/fence.png');
        
        // Add to DOM
        document.getElementById('game').appendChild(this.app.canvas);
        
        // Setup stage
        this.stage = this.app.stage;
        
        // Create background
        this.background = new Background(this.width, this.height, this.MARGIN);
        this.stage.addChild(this.background);
        
        // Create brake line layer
        this.brakeLineLayer = new PIXI.Container();
        this.stage.addChild(this.brakeLineLayer);
        
        // Create text display
        this.text = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 30,
                fill: 0xff0000
            }
        });
        this.text.x = this.width / 2 - 100;
        this.text.y = this.height - 50;
        this.stage.addChild(this.text);
        
        // Initialize arrays
        this.selfDrivingCars = [];
        this.collisionCars = [];
        this.players = [];
        this.brakeLines = [];
        
        // Setup resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Start animation loop
        this.app.ticker.add(() => this.animate());
    }
    
    animate() {
        if (this.paused) return;
        
        this.frames++;
        
        // Update players
        this.players.forEach(player => player.display());
        
        // Update self-driving cars
        this.selfDrivingCars.forEach(car => car.display());
        
        // Update background
        this.background.update();
        
        // Update brake lines
        this.brakeLines.forEach(line => line.update());
        
        // Handle game time
        if (this.startFrame !== -1) {
            const currentRunTime = (this.frames - this.startFrame) / 60;
            this.text.text = Math.round(currentRunTime).toString();
            
            const tempAmountOfCars = Math.round(
                (Math.round(currentRunTime / 10) - currentRunTime / 10) * 1000
            ) / 1000;
            
            if (tempAmountOfCars === 0) {
                this.addSelfDrivingCars(1);
                if (window.host && window.host.datVars) {
                    window.host.datVars.amountOfCars = this.amountOfCars;
                }
            }
        }
    }
    
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.app.renderer.resize(this.width, this.height);
        this.MARGIN = 200 * (this.width / 1920);
        this.background.resize();
    }
    
    collisionCheck() {
        const checkCars = this.collisionCars.slice();
        
        // Reset collision data
        for (let i = checkCars.length - 1; i >= 0; i--) {
            const car = checkCars[i];
            car.smallestDist = -1;
            car.smallestDistX_L = -1;
            car.smallestDistX_R = -1;
            car.voorliggerSpeed = -1;
        }
        
        // Check collisions
        for (let i = checkCars.length - 1; i >= 0; i--) {
            const car0 = checkCars[i];
            
            for (let q = i - 1; q >= 0; q--) {
                const car1 = checkCars[q];
                const distY = car1.y + car1.h / 2 - car0.y - car0.h / 2;
                const distX = car1.x + car1.w / 2 - car0.x - car0.w / 2;
                
                if (Math.abs(distX) < car1.w / 2 + car0.w / 2) {
                    if (Math.abs(distY) < car1.h / 2 + car0.h / 2) {
                        // Collision detected
                        car0.remove();
                        car1.remove();
                        checkCars.splice(i, 1);
                        checkCars.splice(q, 1);
                        i -= 2;
                        break;
                    } else {
                        // Update smallest distance
                        if (distY > 0 && (distY < car0.smallestDist || car0.smallestDist === -1)) {
                            car0.smallestDist = distY - car0.h / 2 - car1.h / 2;
                            car0.voorliggerSpeed = car1.speed;
                        } else if (distY < 0 && (-distY < car1.smallestDist || car1.smallestDist === -1)) {
                            car1.smallestDist = -distY - car0.h / 2 - car1.h / 2;
                            car1.voorliggerSpeed = car0.speed;
                        }
                    }
                }
            }
            
            car0.text = car0.smallestDist + '';
        }
    }
    
    removePlayer(id) {
        const index = this.players.findIndex(player => player.id === id);
        
        if (index >= 0) {
            const player = this.players[index];
            this.stage.removeChild(player.lifeCars);
            this.stage.removeChild(player);
            this.players.splice(index, 1);
            this.updateCollisionCars();
        }
        
        // Update life car positions
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].updateHeightLifeCars(i);
        }
    }
    
    updateCollisionCars() {
        this.amountOfCars = this.selfDrivingCars.length;
        this.collisionCars = [...this.selfDrivingCars, ...this.players];
    }
    
    rgb2hex(r, g, b) {
        const decColor = 0x1000000 + b + 0x100 * g + 0x10000 * r;
        return parseInt(decColor.toString(16).substr(1), 16);
    }
    
    hsl2hex(h, s, l) {
        h = h / 250;
        s = s / 250;
        l = l / 250;
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return this.rgb2hex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }
    
    rgb2hsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return { h: h * 255, s: s * 255, l: l * 255 };
    }
    
    hex2hsl(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return this.rgb2hsl(
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        );
    }
    
    randomPleasingColor(r, g, b) {
        const red = Math.round((r / 4 + Math.random() * 255) / 1.25);
        const green = Math.round((g / 4 + Math.random() * 255) / 1.25);
        const blue = Math.round((b / 4 + Math.random() * 255) / 1.25);
        return { r: red, g: green, b: blue };
    }
    
    createRect(x, y, w, h, c) {
        const rect = new PIXI.Graphics();
        rect.rect(x, y, w, h).fill(c);
        return rect;
    }
    
    createEllipse(x, y, w, h, c) {
        const ellipse = new PIXI.Graphics();
        ellipse.ellipse(x, y, w, h).fill(c);
        return ellipse;
    }
    
    addSelfDrivingCars(amount) {
        this.amountOfCars += amount;
        
        if (amount > 0) {
            for (let i = 1; i <= amount; i++) {
                if (!this.addNonNormalCar()) {
                    this.selfDrivingCars.push(new NormalCar());
                }
            }
        } else if (amount < 0) {
            this.selfDrivingCars.forEach(car => {
                if (amount >= 0) return;
                
                if (car.y < -car.h) {
                    car.removeIndefinitely();
                    amount++;
                }
            });
            
            while (amount < 0) {
                this.selfDrivingCars[0].removeIndefinitely();
                amount++;
            }
        }
        
        this.updateCollisionCars();
    }
    
    addNonNormalCar() {
        if (Math.round(Math.random() * 10) === 0) {
            this.selfDrivingCars.push(new AmbuCar());
        } else if (Math.round(Math.random() * 5) === 0) {
            this.selfDrivingCars.push(new Truck());
        } else {
            return false;
        }
        return true;
    }
    
    createPlayer(id, color) {
        const player = new PlayerCar(id, color);
        this.players.push(player);
        this.updateCollisionCars();
        
        if (this.started) {
            player.lifesActivated = true;
        }
        
        return player;
    }
}
