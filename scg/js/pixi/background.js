import * as PIXI from 'pixi.js';

export class Background extends PIXI.Container {
    constructor(w, h, margin) {
        super();
        
        this.margin = margin;
        this.h = h;
        this.fences = [];
        this.MINSPEED = 1;
        
        const totalFences = 8;
        
        // Left grass
        this.grassL = new PIXI.Graphics();
        this.grassL.rect(0, 0, margin, h);
        this.grassL.fill(0x9cf39c);
        this.addChild(this.grassL);
        
        // Right grass
        this.grassR = new PIXI.Graphics();
        this.grassR.rect(0, 0, margin, h);
        this.grassR.fill(0x9cf39c);
        this.grassR.x = w - margin;
        this.addChild(this.grassR);
        
        // Add fences
        for (let i = 0; i < totalFences; i++) {
            const fence = PIXI.Sprite.from('/fence.png');
            fence.anchor.x = 1;
            fence.anchor.y = 0.5;
            
            if (i < totalFences / 2) {
                fence.position.y = (h / (totalFences / 2)) * (i + 1);
                fence.position.x = margin * 0.8;
                fence.right = true;
            } else {
                fence.position.y = (h / (totalFences / 2)) * (i - totalFences / 2 + 1);
                fence.position.x = w - margin * 0.8;
                fence.scale.x = -1;
                fence.right = false;
            }
            
            this.addChild(fence);
            this.fences.push(fence);
        }
    }
    
    update() {
        this.fences.forEach(f => {
            f.y += this.MINSPEED;
            if (f.y > window.host.pixi.height) {
                f.y = -100;
            }
        });
    }
    
    resize() {
        const host = window.host;
        this.grassL.width = (host.pixi.MARGIN / this.margin);
        this.grassL.height = host.pixi.height / this.h;
        this.grassR.x = host.pixi.width - host.pixi.MARGIN;
        this.grassR.width = (host.pixi.MARGIN / this.margin);
        this.grassR.height = host.pixi.height / this.h;
        
        this.fences.forEach(f => {
            if (f.right) {
                f.x = host.pixi.MARGIN * 0.8;
            } else {
                f.x = host.pixi.width - host.pixi.MARGIN * 0.8;
            }
        });
    }
}
