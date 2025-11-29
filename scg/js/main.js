import { PixiGame } from './pixi/pixi-game.js';
import { RippleEffect, Drawer, fitText, isMobile } from './utils/ui.js';
import { SocketManager } from './utils/SocketManager.js';

class Host {
    constructor() {
        this.pixi = null;
        this.seedRoom = null;
        this.socketManager = null;
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
        
        // Initialize socket connection and room
        if (!this.mobile) {
            this.initializeSocket();
            this.initializeRoomUI();
            this.setupDebugGUI();
        } else {
            document.getElementById('linktoroom').classList.add('hidden');
            document.getElementById('buttons').style.display = 'none';
        }
    }
    
    initializeSocket() {
        // Connect to WebSocket server
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
        this.socketManager = new SocketManager(serverUrl);
        this.socketManager.connect();
        
        // Setup socket event handlers
        this.socketManager.on('connected', (socketId) => {
            console.log('Socket connected:', socketId);
            // Create room after connection is established
            this.createRoom();
        });
        
        this.socketManager.on('playerJoined', (data) => {
            console.log('Remote player joined:', data);
            // Create remote player
            const player = this.pixi.createPlayer(data.playerId, data.color);
            player.remote = true;
            
            // Send initial player data back
            if (this.socketManager) {
                this.socketManager.sendHostFeedback(data.playerId, {
                    color: data.color,
                    lives: player.lifeCars.children.length,
                    paused: this.pixi.paused
                });
            }
        });
        
        this.socketManager.on('playerLeft', (data) => {
            this.removePlayer(data.playerId);
        });
        
        this.socketManager.on('playerInput', (data) => {
            // Handle remote player input
            console.log('Received player input:', data);
            const player = this.pixi.players.find(p => p.id === data.playerId);
            if (player && player.remote) {
                // Apply input value (-1 left, 0 stop, 1 right)
                player.move.x = data.input * player.maxMove;
                console.log(`Player ${data.playerId} move.x set to:`, player.move.x);
            }
        });
        
        this.socketManager.on('hostDisconnected', () => {
            alert('Host has disconnected. Returning to menu...');
            window.location.reload();
        });
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
    
    initializeRoomUI() {
        // Generate random seed
        this.seedRoom = Math.random().toString(36).substr(2, 6).toUpperCase();
        document.getElementById('seed').textContent = this.seedRoom;
        
        // Generate QR code
        const qrElement = document.getElementById('qrcode');
        const link = window.location.origin + '/controller.html';
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
    
    createRoom() {
        // Create room on server (called after socket connects)
        if (this.socketManager && this.socketManager.connected && this.seedRoom) {
            this.socketManager.createRoom(this.seedRoom).then(() => {
                console.log('Room created on server:', this.seedRoom);
            }).catch(error => {
                console.error('Failed to create room:', error);
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
        
        // Notify server that game has started
        if (this.socketManager && this.socketManager.connected) {
            this.socketManager.startGame();
        }
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
