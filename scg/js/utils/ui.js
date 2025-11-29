// UI utilities for ripple effects and interactions

export class RippleEffect {
    static init() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.fab, .button-start, .menu-item');
            if (!target) return;
            
            this.createRipple(e, target);
        });
    }
    
    static createRipple(event, element) {
        const ripple = element.querySelector('.ripple') || document.createElement('div');
        
        if (!element.querySelector('.ripple')) {
            ripple.classList.add('ripple');
            element.appendChild(ripple);
        }
        
        ripple.classList.remove('active');
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('active');
    }
}

export class Drawer {
    constructor() {
        this.drawer = document.getElementById('drawer');
        this.overlay = document.getElementById('drawer-overlay');
        this.menuButton = document.getElementById('menu-button');
        
        this.init();
    }
    
    init() {
        this.menuButton.addEventListener('click', () => this.open());
        this.overlay.addEventListener('click', () => this.close());
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    open() {
        this.drawer.classList.add('active');
        this.overlay.classList.add('active');
    }
    
    close() {
        this.drawer.classList.remove('active');
        this.overlay.classList.remove('active');
    }
    
    isOpen() {
        return this.drawer.classList.contains('active');
    }
}

export function fitText(element, compressor = 1) {
    const resizer = () => {
        const fontSize = Math.max(
            Math.min(
                element.clientWidth / (compressor * 10),
                parseFloat(window.getComputedStyle(element).fontSize)
            ),
            parseInt(window.getComputedStyle(element).fontSize)
        );
        element.style.fontSize = fontSize + 'px';
    };
    
    resizer();
    window.addEventListener('resize', resizer);
}

export function isMobile() {
    return /iphone|ipad|ipod|android|blackberry|mobile|mini|windows\sce|palm/i.test(
        navigator.userAgent.toLowerCase()
    );
}
