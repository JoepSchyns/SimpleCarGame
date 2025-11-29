# SimpleCarGame — Modernized Arcade Racing Game

![SimpleCarGame Banner](scg/images/large_favicon.png)

A fully modernized multiplayer arcade racing game where you drive in the wrong direction on a one-way road. Built with modern web technologies including Pixi.js v8, Vite, Socket.io, and ES6+ JavaScript.

## 🎮 Game Description

Drive against traffic on a busy highway! You start with 10 lives and lose one for every car you hit. Traffic will brake for you but never stops completely. Dodge cars to survive as long as possible, or hit ambulances to gain lives back!

**Features:**
- 🚗 Multiple vehicle types: cars, trucks, and ambulances
- 👥 Multiplayer support (up to 6 players per room)
- 📱 Mobile controller support (touch, mouse, and keyboard)
- 🎨 Dynamic color-coded players
- ⚡ Real-time WebSocket communication
- 🎛️ Live gameplay controls with dat.GUI
- 🐳 Docker support for easy deployment

## 🚀 Quick Start

### Development Mode

#### Frontend (Vite)
```bash
cd scg
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

#### Backend (Node.js + Socket.io)
```bash
cd server
npm install
npm run dev
```
Backend runs at `http://localhost:8000`

### Production with Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t simple-car-game .
docker run -p 8000:8000 simple-car-game
```

Production server runs at `http://localhost:8000` (serves frontend + WebSocket)

## 🎯 How to Play

### Host Game (Desktop)
1. Open the game at `http://localhost:3000` (dev) or `http://localhost:8000` (production)
2. Click "NEW GAME" to create a room
3. Share the QR code or room code with players
4. Wait for players to join
5. Click "START" when ready

### Join as Player (Mobile/Desktop)
1. Scan the QR code OR visit `/controller.html?room=ROOMCODE`
2. Use on-screen buttons, arrow keys, or mouse to control your car
3. Try to survive as long as possible!

### Controls
- **Touch**: Tap left/right buttons (mobile)
- **Mouse**: Click and hold left/right buttons (desktop)
- **Keyboard**: Arrow keys ← → (all devices)

## 🛠️ Tech Stack

### Frontend
- **Pixi.js v8.6.0** - WebGL rendering engine
- **Vite 5.0** - Build tool with HMR
- **Socket.io Client 4.7** - WebSocket client
- **dat.GUI 0.7.9** - Debug controls

### Backend
- **Node.js 20** - Runtime
- **Express 4.21** - Web server
- **Socket.io 4.8** - WebSocket server
- **CORS** - Cross-origin support

### DevOps
- **Docker** - Containerization
- **Multi-stage builds** - Optimized images
- **Health checks** - Container monitoring

## 📁 Project Structure

```
SimpleCarGame/
├── scg/                     # Frontend application
│   ├── js/
│   │   ├── main.js         # Host game controller
│   │   ├── controller.js   # Mobile controller
│   │   ├── pixi/           # Game engine
│   │   │   ├── pixi-game.js
│   │   │   ├── playercar.js
│   │   │   ├── normalcar.js
│   │   │   └── ...
│   │   └── utils/          # UI utilities
│   ├── styles/
│   │   └── main.css
│   ├── index.html          # Host page
│   ├── controller.html     # Controller page
│   └── package.json
├── server/                  # Backend server
│   ├── src/
│   │   ├── GameRoom.js     # Room logic
│   │   ├── RoomManager.js  # Room management
│   │   └── SocketManager.js # WebSocket logic
│   ├── server.js           # Entry point
│   └── package.json
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # Docker Compose config
├── .env.example            # Environment template
└── README.md
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server
NODE_ENV=production
PORT=8000

# CORS (set to your domain in production)
CORS_ORIGIN=*

# Game settings
MAX_PLAYERS_PER_ROOM=6
ROOM_TIMEOUT_MS=1800000
```

### Docker

The Docker setup includes:
- Multi-stage builds for optimized image size
- Non-root user for security
- Health checks for monitoring
- Auto-restart on failure
- Production optimizations

## 🎛️ Debug Controls (dat.GUI)

Access the control panel in the top-right corner:

### Traffic Folder
- **Car Count** (0-100): Number of AI traffic cars
- **Min Speed** (0-20): Minimum traffic speed
- **Max Speed Bonus** (0-20): Random speed variation
- **Acceleration** (0-5): Speed change rate
- **Enable Dodging**: AI avoidance behavior

### Display Folder
- **Show Interface**: Toggle UI visibility

## 🔄 Modernization Highlights

### Architecture Changes
- ✅ ES6 classes and modules
- ✅ WebSocket multiplayer (Socket.io)
- ✅ Mobile controller support
- ✅ Multi-input support (touch/mouse/keyboard)
- ✅ Room-based multiplayer system
- ✅ Production-ready Docker setup

### Graphics (Pixi.js v4 → v8)
- ✅ New Graphics API
- ✅ Modern Text API
- ✅ Asset loading with `PIXI.Assets`
- ✅ Proper memory management

### Build System
- ✅ Vite with HMR
- ✅ npm package management
- ✅ Production optimization
- ✅ Docker containerization

### Removed Legacy Code
- ❌ Polymer web components
- ❌ Bower package manager
- ❌ jQuery dependencies
- ❌ PHP server files
- ❌ Old socket implementations

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## 🐛 Known Issues

All major rendering and memory issues from the legacy version have been resolved in this modernization.

## 📝 API Endpoints

- `GET /health` - Health check (returns room/player stats)
- `GET /api/rooms/:seed` - Get room information
- WebSocket events: `createRoom`, `joinRoom`, `move`, `gameStarted`, etc.

## 📝 License

MIT

## 👨‍💻 Credits

- **Original Game**: Joep Schyns
- **Modernization**: 2025
- **Technologies**: Pixi.js, Vite, Socket.io, Express, Docker

---

**Production Deployment**: Deploy with Docker for best results!
