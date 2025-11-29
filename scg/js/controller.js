import { SocketManager } from './utils/SocketManager.js';

class MobileController {
    constructor() {
        this.socketManager = null;
        this.roomCode = null;
        this.playerColor = '#ffaa44';
        this.isReady = false;
        this.lives = 10;
        this.score = 0;
        this.isPaused = false;
        
        this.init();
    }
    
    init() {
        // Get references to screens
        this.connectScreen = document.getElementById('connect-screen');
        this.waitingScreen = document.getElementById('waiting-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.errorScreen = document.getElementById('error-screen');
        
        // Setup event listeners
        this.setupColorPicker();
        this.setupConnectButton();
        this.setupControlButtons();
        this.setupReadyButton();
        this.setupDisconnectButton();
        this.setupRetryButton();
        this.setupPauseButton();
        
        // Load saved room code
        const savedCode = this.getSavedRoomCode();
        if (savedCode) {
            document.getElementById('room-code').value = savedCode;
        }
        
        // Focus room code input
        document.getElementById('room-code').focus();
    }
    
    setupColorPicker() {
        const colorButtons = document.querySelectorAll('.color-btn');
        
        colorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                colorButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.playerColor = btn.dataset.color;
            });
        });
    }
    
    setupConnectButton() {
        const connectBtn = document.getElementById('connect-btn');
        const roomCodeInput = document.getElementById('room-code');
        const errorElement = document.getElementById('room-error');
        
        const attemptConnect = async () => {
            const code = roomCodeInput.value.trim().toUpperCase();
            
            if (code.length !== 6) {
                this.showError('Please enter a 6-digit room code');
                return;
            }
            
            errorElement.textContent = '';
            roomCodeInput.classList.remove('error');
            connectBtn.disabled = true;
            connectBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Connecting...';
            
            try {
                await this.connectToGame(code);
            } catch (error) {
                this.showError(error.message);
                connectBtn.disabled = false;
                connectBtn.innerHTML = '<i class="fa fa-plug"></i> Connect to Game';
            }
        };
        
        connectBtn.addEventListener('click', attemptConnect);
        
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptConnect();
            }
        });
        
        // Auto-uppercase input
        roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
    
    async connectToGame(code) {
        this.roomCode = code;
        
        // Initialize socket connection
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
        this.socketManager = new SocketManager(serverUrl);
        
        // Setup socket event handlers
        this.setupSocketHandlers();
        
        // Connect to server
        this.socketManager.connect();
        
        // Wait for connection
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 5000);
            
            this.socketManager.on('connected', () => {
                clearTimeout(timeout);
                resolve();
            });
        });
        
        // Join room
        try {
            await this.socketManager.joinRoom(code, this.playerColor);
            this.saveRoomCode(code);
            this.showWaitingScreen();
        } catch (error) {
            throw new Error('Room not found or is full');
        }
    }
    
    setupSocketHandlers() {
        this.socketManager.on('hostFeedback', (feedback) => {
            if (feedback.lives !== undefined) {
                this.updateLives(feedback.lives);
            }
            if (feedback.message) {
                this.showStatus(feedback.message);
            }
        });
        
        this.socketManager.on('gameStarted', () => {
            this.showGameScreen();
        });
        
        this.socketManager.on('hostDisconnected', () => {
            this.showErrorScreen('The host has disconnected.');
        });
        
        this.socketManager.on('gameStateUpdate', (gameState) => {
            // Handle game state updates
            if (gameState.score !== undefined) {
                this.updateScore(gameState.score);
            }
        });
    }
    
    setupControlButtons() {
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        
        let leftPressed = false;
        let rightPressed = false;
        
        const sendInput = () => {
            if (this.socketManager) {
                let inputValue = 0;
                if (leftPressed) inputValue = -1;
                if (rightPressed) inputValue = 1;
                this.socketManager.sendPlayerInput(inputValue);
            }
        };
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !leftPressed) {
                leftPressed = true;
                leftBtn.style.transform = 'scale(0.95)';
                sendInput();
                e.preventDefault();
            } else if (e.key === 'ArrowRight' && !rightPressed) {
                rightPressed = true;
                rightBtn.style.transform = 'scale(0.95)';
                sendInput();
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' && leftPressed) {
                leftPressed = false;
                leftBtn.style.transform = '';
                sendInput();
                e.preventDefault();
            } else if (e.key === 'ArrowRight' && rightPressed) {
                rightPressed = false;
                rightBtn.style.transform = '';
                sendInput();
                e.preventDefault();
            }
        });
        
        // Left button - Touch events
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            leftPressed = true;
            leftBtn.style.transform = 'scale(0.95)';
            sendInput();
            this.vibrate(10);
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            leftPressed = false;
            leftBtn.style.transform = '';
            sendInput();
        });
        
        // Left button - Mouse events (for desktop testing)
        leftBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            leftPressed = true;
            leftBtn.style.transform = 'scale(0.95)';
            sendInput();
        });
        
        leftBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            leftPressed = false;
            leftBtn.style.transform = '';
            sendInput();
        });
        
        leftBtn.addEventListener('mouseleave', (e) => {
            if (leftPressed) {
                leftPressed = false;
                leftBtn.style.transform = '';
                sendInput();
            }
        });
        
        // Right button - Touch events
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            rightPressed = true;
            rightBtn.style.transform = 'scale(0.95)';
            sendInput();
            this.vibrate(10);
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            rightPressed = false;
            rightBtn.style.transform = '';
            sendInput();
        });
        
        // Right button - Mouse events (for desktop testing)
        rightBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            rightPressed = true;
            rightBtn.style.transform = 'scale(0.95)';
            sendInput();
        });
        
        rightBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            rightPressed = false;
            rightBtn.style.transform = '';
            sendInput();
        });
        
        rightBtn.addEventListener('mouseleave', (e) => {
            if (rightPressed) {
                rightPressed = false;
                rightBtn.style.transform = '';
                sendInput();
            }
        });
        
        // Prevent double-tap zoom
        [leftBtn, rightBtn].forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    }
    
    setupReadyButton() {
        const readyBtn = document.getElementById('ready-btn');
        
        readyBtn.addEventListener('click', () => {
            this.isReady = !this.isReady;
            
            if (this.socketManager) {
                this.socketManager.setPlayerReady(this.isReady);
            }
            
            if (this.isReady) {
                readyBtn.innerHTML = '<i class="fa fa-check-double"></i> Ready!';
                readyBtn.style.background = '#45a049';
            } else {
                readyBtn.innerHTML = '<i class="fa fa-check"></i> Ready';
                readyBtn.style.background = '';
            }
            
            this.vibrate(20);
        });
    }
    
    setupDisconnectButton() {
        const disconnectBtn = document.getElementById('disconnect-btn');
        
        disconnectBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to disconnect?')) {
                this.disconnect();
                this.showConnectScreen();
            }
        });
    }
    
    setupRetryButton() {
        const retryBtn = document.getElementById('retry-btn');
        
        retryBtn.addEventListener('click', () => {
            this.disconnect();
            this.showConnectScreen();
        });
    }
    
    setupPauseButton() {
        const pauseBtn = document.getElementById('pause-btn');
        
        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            
            if (this.socketManager) {
                this.socketManager.sendPlayerInput({ pause: this.isPaused });
            }
            
            if (this.isPaused) {
                pauseBtn.innerHTML = '<i class="fa fa-play"></i>';
            } else {
                pauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
            }
        });
    }
    
    showConnectScreen() {
        this.hideAllScreens();
        this.connectScreen.classList.add('active');
        const connectBtn = document.getElementById('connect-btn');
        connectBtn.disabled = false;
        connectBtn.innerHTML = '<i class="fa fa-plug"></i> Connect to Game';
    }
    
    showWaitingScreen() {
        this.hideAllScreens();
        this.waitingScreen.classList.add('active');
        
        const colorDisplay = document.getElementById('player-color-display');
        colorDisplay.style.background = this.playerColor;
    }
    
    showGameScreen() {
        this.hideAllScreens();
        this.gameScreen.classList.add('active');
        
        // Request fullscreen on mobile
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }
    
    showErrorScreen(message) {
        this.hideAllScreens();
        this.errorScreen.classList.add('active');
        document.getElementById('error-message').textContent = message;
    }
    
    hideAllScreens() {
        [this.connectScreen, this.waitingScreen, this.gameScreen, this.errorScreen].forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    updateLives(lives) {
        this.lives = lives;
        document.getElementById('lives-count').textContent = lives;
        document.getElementById('game-lives-count').textContent = lives;
        
        if (lives < 3) {
            this.vibrate([100, 50, 100]);
        }
    }
    
    updateScore(score) {
        this.score = score;
        document.getElementById('score').textContent = score;
    }
    
    showStatus(message) {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        setTimeout(() => {
            statusElement.textContent = '';
        }, 3000);
    }
    
    showError(message) {
        const errorElement = document.getElementById('room-error');
        const input = document.getElementById('room-code');
        
        errorElement.textContent = message;
        input.classList.add('error');
        input.parentElement.classList.add('shake');
        
        this.vibrate([50, 100, 50]);
        
        setTimeout(() => {
            input.parentElement.classList.remove('shake');
        }, 300);
    }
    
    disconnect() {
        if (this.socketManager) {
            this.socketManager.disconnect();
            this.socketManager = null;
        }
        this.roomCode = null;
        this.isReady = false;
        this.lives = 10;
        this.score = 0;
    }
    
    saveRoomCode(code) {
        try {
            localStorage.setItem('scg_last_room', code);
        } catch (e) {
            console.warn('Could not save room code to localStorage');
        }
    }
    
    getSavedRoomCode() {
        try {
            return localStorage.getItem('scg_last_room');
        } catch (e) {
            return null;
        }
    }
    
    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MobileController();
    });
} else {
    new MobileController();
}
