# SimpleCarGame — Modernized Arcade Racing Game

![SimpleCarGame Banner](scg/images/large_favicon.png)

A fully modernized multiplayer arcade racing game where you drive in the wrong direction on a one-way road. Built with modern web technologies including Pixi.js v8, Vite, and ES6+ JavaScript.

## 🎮 Game Description

Drive against traffic on a busy highway! You start with 10 lives and lose one for every car you hit. Traffic will brake for you but never stops completely. Dodge cars to survive as long as possible, or hit ambulances to gain lives back!

**Features:**
- 🚗 Multiple vehicle types: cars, trucks, and ambulances
- 👥 Local multiplayer support (up to 6 players)
- 🎨 Dynamic color-coded players
- ⚡ Real-time physics and collision detection
- 🎛️ Live gameplay controls with dat.GUI
- 📱 Responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation & Running

```bash
cd scg
npm install
npm run dev
```

The game will automatically open at `http://localhost:3000`

### Building for Production

```bash
npm run build      # Build to dist/
npm run preview    # Preview production build
```

## 🎯 How to Play

1. **Add Players**: Click orange player buttons to add up to 6 players
2. **Assign Controls**: Click left/right arrows to assign keyboard keys
3. **Start Game**: Click the START button
4. **Survive**: Avoid traffic and collect ambulances for extra lives!

### Default Controls

- Player 1: Arrow keys (← →)
- Additional players: Assign custom keys

## 🛠️ Tech Stack (Modernized)

### Current (2025)

- **Pixi.js v8.6.0** - Latest WebGL rendering with modern Graphics API
- **Vite 5.0** - Lightning-fast build tool with HMR
- **ES6+ Modules** - Modern JavaScript architecture
- **CSS Custom Properties** - Modern responsive styling
- **dat.GUI 0.7.9** - Real-time controls
- **Vanilla JavaScript** - No framework dependencies

### Legacy (Removed)

- ~~Polymer~~ → Modern HTML5
- ~~Bower~~ → npm
- ~~jQuery~~ → Native DOM APIs
- ~~Pixi.js v4~~ → Pixi.js v8
- ~~PHP/Apache~~ → Static build with Vite

## 📁 Project Structure

```
scg/
├── images/              # Game assets (fences, icons)
├── js/
│   ├── main.js         # Game entry point & Host class
│   ├── pixi/           # Game engine
│   │   ├── pixi-game.js     # Main game loop
│   │   ├── car.js           # Base car class
│   │   ├── playercar.js     # Player-controlled cars
│   │   ├── selfdrivingcar.js # AI base class
│   │   ├── normalcar.js     # Regular traffic
│   │   ├── ambucar.js       # Ambulances (life powerup)
│   │   ├── truck.js         # Large trucks
│   │   ├── lifecar.js       # Life indicator
│   │   ├── background.js    # Road & grass
│   │   └── brakeline.js     # Brake light trails
│   ├── utils/          # UI utilities (ripple, drawer, etc.)
│   └── socket/         # Multiplayer server (future feature)
├── styles/
│   └── main.css        # Modern CSS with custom properties
├── index.html          # Main HTML5 entry
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

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

## 🔄 Modernization Changes

### Architecture
- ✅ ES6 classes replacing prototype patterns
- ✅ ES6 modules replacing global scripts
- ✅ Async/await for resource loading
- ✅ Modern event handling (no jQuery)

### Graphics (Pixi.js v4 → v8)
- ✅ New Graphics API with method chaining
- ✅ Updated Text API with style objects
- ✅ Modern Application initialization
- ✅ Asset loading with `PIXI.Assets`
- ✅ Proper canvas management

### Build System
- ✅ Vite with hot module replacement
- ✅ npm package management
- ✅ Production build optimization
- ✅ No Apache/PHP required

### CSS
- ✅ CSS custom properties for theming
- ✅ Modern Flexbox layouts
- ✅ Smooth animations with CSS transitions
- ✅ Responsive design patterns

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🐛 Known Issues

All major rendering and memory issues from the legacy version have been resolved in this modernization.

## 📝 License

MIT

## 👨‍💻 Credits

- **Original Game**: Joep Schyns
- **Modernization**: 2025
- **Technologies**: Pixi.js, Vite, dat.GUI, QRCode.js, Font Awesome

---

**Legacy Version**: http://joepschyns.me/scg/
