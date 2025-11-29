import { PixiGame } from './pixi/pixi-game.js';
import { RippleEffect, Drawer, fitText, isMobile } from './utils/ui.js';

class Host {
    constructor() {
        this.pixi = null;
        this.seedRoom = null;
        this.socket = null;
        this.mobile = isMobile();
        this.datVars = this.getDefaultVariables();
        
        this.init();
    }
    
    async init() {
        // Initialize UI components
        RippleEffect.init();
        new Drawer();
        
        // Fit title text
        const title = document.getElementById('title');
        fitText(title, 0.8);
        
        // Initialize Pixi game
        this.pixi = new PixiGame();
        await this.pixi.initializeApp();
        
        // Setup player buttons
        this.setupPlayerButtons();
        
        // Setup start button
        document.getElementById('start').addEventListener('click', () => this.startGame());
        
        // Initialize room/socket functionality
        if (!this.mobile) {
            this.initializeRoom();
            this.setupDebugGUI();
        } else {
            document.getElementById('linktoroom').classList.add('hidden');
            document.getElementById('buttons').style.display = 'none';
        }
    }
    
    setupPlayerButtons() {
        const slots = document.querySelectorAll('.player-slot');
        
        slots.forEach((slot, index) => {
            const addButton = slot.querySelector('.add-player');
            const leftButton = slot.querySelector('.control-left');
            const rightButton = slot.querySelector('.control-right');
            
            let player = null;
            let isActive = false;
            let pleasingColor = null;
            let selectedButton = null;
            
            addButton.addEventListener('click', () => {
                if (!isActive) {
                    // Add player
                    pleasingColor = this.pixi.randomPleasingColor(255, 155, 10);
                    const hslColor = this.pixi.rgb2hsl(pleasingColor.r, pleasingColor.g, pleasingColor.b);
                    const hexColor = '#' + this.pixi.rgb2hex(pleasingColor.r, pleasingColor.g, pleasingColor.b).toString(16).padStart(6, '0');
                    
                    addButton.style.backgroundColor = hexColor;
                    addButton.innerHTML = '<i class="fa fa-user"></i><div class="ripple"></div>';
                    
                    leftButton.style.backgroundColor = hexColor;
                    rightButton.style.backgroundColor = hexColor;
                    
                    slot.classList.add('active');
                    
                    const id = Math.random().toString(36).substr(2, 9);
                    player = this.pixi.createPlayer(id, hexColor);
                    
                    // Setup key binding for left button
                    leftButton.addEventListener('click', () => {
                        if (selectedButton === 'left') return;
                        
                        selectedButton = 'left';
                        const darkColor = this.getDarkerColor(hexColor);
                        leftButton.style.backgroundColor = darkColor;
                        
                        const keyHandler = (e) => {
                            player.left = e.keyCode;
                            const char = this.getKeyChar(e.keyCode);
                            leftButton.innerHTML = `${char}<div class="ripple"></div>`;
                            
                            document.removeEventListener('keydown', keyHandler);
                            document.removeEventListener('mousedown', clickHandler);
                            leftButton.style.backgroundColor = hexColor;
                            selectedButton = null;
                        };
                        
                        const clickHandler = () => {
                            document.removeEventListener('keydown', keyHandler);
                            document.removeEventListener('mousedown', clickHandler);
                            leftButton.style.backgroundColor = hexColor;
                            selectedButton = null;
                        };
                        
                        document.addEventListener('keydown', keyHandler);
                        setTimeout(() => document.addEventListener('mousedown', clickHandler), 100);
                    });
                    
                    // Setup key binding for right button
                    rightButton.addEventListener('click', () => {
                        if (selectedButton === 'right') return;
                        
                        selectedButton = 'right';
                        const darkColor = this.getDarkerColor(hexColor);
                        rightButton.style.backgroundColor = darkColor;
                        
                        const keyHandler = (e) => {
                            player.right = e.keyCode;
                            const char = this.getKeyChar(e.keyCode);
                            rightButton.innerHTML = `${char}<div class="ripple"></div>`;
                            
                            document.removeEventListener('keydown', keyHandler);
                            document.removeEventListener('mousedown', clickHandler);
                            rightButton.style.backgroundColor = hexColor;
                            selectedButton = null;
                        };
                        
                        const clickHandler = () => {
                            document.removeEventListener('keydown', keyHandler);
                            document.removeEventListener('mousedown', clickHandler);
                            rightButton.style.backgroundColor = hexColor;
                            selectedButton = null;
                        };
                        
                        document.addEventListener('keydown', keyHandler);
                        setTimeout(() => document.addEventListener('mousedown', clickHandler), 100);
                    });
                    
                    isActive = true;
                } else {
                    // Remove player
                    if (player) {
                        this.pixi.removePlayer(player.id);
                    }
                    
                    addButton.style.backgroundColor = '';
                    addButton.innerHTML = '<i class="fa fa-user-plus"></i><div class="ripple"></div>';
                    
                    leftButton.innerHTML = '<i class="fa fa-arrow-circle-left"></i><div class="ripple"></div>';
                    rightButton.innerHTML = '<i class="fa fa-arrow-circle-right"></i><div class="ripple"></div>';
                    
                    slot.classList.remove('active');
                    
                    player = null;
                    isActive = false;
                }
            });
        });
    }
    
    getDarkerColor(hexColor) {
        const hsl = this.pixi.hex2hsl(hexColor);
        return '#' + this.pixi.hsl2hex(hsl.h, hsl.s, hsl.l - 50).toString(16).padStart(6, '0');
    }
    
    getKeyChar(keyCode) {
        const specialKeys = {
            37: '<i class="fa fa-arrow-circle-left"></i>',
            38: '<i class="fa fa-arrow-circle-up"></i>',
            39: '<i class="fa fa-arrow-circle-right"></i>',
            40: '<i class="fa fa-arrow-circle-down"></i>',
        };
        
        if (specialKeys[keyCode]) {
            return specialKeys[keyCode];
        }
        
        // Handle numpad
        let code = keyCode;
        if (code > 96 && code < 108) {
            code -= 48;
        }
        
        const char = String.fromCharCode(code).toLowerCase();
        
        // Check if alphanumeric
        if (/^[a-z0-9]$/i.test(char)) {
            return char;
        }
        
        return '<i class="fa fa-exclamation-circle"></i>';
    }
    
    initializeRoom() {
        // Generate random seed
        const seed = Math.random().toString(36).substr(2, 6).toUpperCase();
        document.getElementById('seed').textContent = seed;
        
        // Generate QR code
        const qrElement = document.getElementById('qrcode');
        const link = window.location.origin + '/controller';
        document.getElementById('link').href = link;
        
        // Clear any existing QR code
        qrElement.innerHTML = '';
        
        // Generate QR code using the global QRCode library
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrElement, {
                text: link,
                width: 100,
                height: 100,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
    
    startGame() {
        this.pixi.started = true;
        document.getElementById('interface').classList.add('hidden');
        
        this.pixi.players.forEach(player => {
            player.lifesActivated = true;
        });
        
        this.pixi.startFrame = this.pixi.frames;
        
        // Add initial traffic cars
        this.pixi.addSelfDrivingCars(3);
    }
    
    setupDebugGUI() {
        // Setup dat.GUI if available
        if (typeof dat !== 'undefined') {
            const gui = new dat.GUI({ width: 300 });
            
            // Position in top-right corner
            const guiContainer = gui.domElement.parentElement;
            guiContainer.style.position = 'fixed';
            guiContainer.style.zIndex = '1000';
            
            // Traffic folder
            const trafficFolder = gui.addFolder('Traffic');
            trafficFolder.add(this.datVars, 'amountOfCars', 0, 100)
                .name('Car Count')
                .step(1)
                .listen()
                .onChange((value) => {
                    const diff = Math.round(value) - this.pixi.amountOfCars;
                    if (diff !== 0) {
                        this.pixi.addSelfDrivingCars(diff);
                    }
                });
            
            trafficFolder.add(this.datVars, 'minSpeed', 0, 20)
                .name('Min Speed')
                .step(0.5);
            
            trafficFolder.add(this.datVars, 'maxIncreasedSpeed', 0, 20)
                .name('Max Speed Bonus')
                .step(0.5);
            
            trafficFolder.add(this.datVars, 'maxAcceleration', 0, 5)
                .name('Acceleration')
                .step(0.1)
                .onChange((value) => {
                    this.pixi.selfDrivingCars.forEach(car => {
                        car.ACCEL = value;
                    });
                });
            
            trafficFolder.add(this.datVars, 'dodge')
                .name('Enable Dodging');
            
            trafficFolder.open();
            
            // Display folder
            const displayFolder = gui.addFolder('Display');
            displayFolder.add(this.datVars, 'showInterface')
                .name('Show Interface')
                .onChange((value) => {
                    if (value) {
                        document.getElementById('interface').classList.remove('hidden');
                    } else {
                        document.getElementById('interface').classList.add('hidden');
                    }
                });
            displayFolder.open();
        }
    }
    
    getDefaultVariables() {
        return {
            amountOfCars: 25,
            showInterface: true,
            dodge: false,
            minSpeed: 4,
            maxIncreasedSpeed: 4,
            maxAcceleration: 0.2
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.host = new Host();
    });
} else {
    window.host = new Host();
}
