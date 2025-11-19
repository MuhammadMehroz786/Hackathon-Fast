# Quick Start - Wokwi in VS Code

## 🚀 Get Running in 3 Minutes

### Step 1: Install Wokwi Extension (1 minute)

Open VS Code and run this command in the terminal:

```bash
code --install-extension wokwi.wokwi-vscode
```

Or install manually:
- Press `Cmd+Shift+X` (Extensions)
- Search "Wokwi Simulator"
- Click Install

### Step 2: Get Free License

1. Go to: https://wokwi.com/vscode
2. Sign in with GitHub
3. Copy your license key
4. In VS Code: Press `F1` → type "Wokwi: Request License"
5. Paste key

### Step 3: Start Simulation

```bash
# Navigate to sensor folder
cd "/Users/apple/Desktop/Fast Hackathon/barfani/sensor/esp32_glof_sensor"

# Open in VS Code
code .

# Or if VS Code is already open, just open the .ino file
code esp32_glof_sensor.ino
```

Then:
- Press `F1`
- Type "**Wokwi: Start Simulator**"
- Press Enter

**Done!** The simulation starts! 🎉

---

## 🎮 Demo the Full System

### Terminal 1 - Backend:
```bash
cd "/Users/apple/Desktop/Fast Hackathon/barfani/backend"
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd "/Users/apple/Desktop/Fast Hackathon/barfani/frontend"
npm run dev
```

### Browser:
```
http://localhost:3000
```

### VS Code - Wokwi Simulation:
- Open `esp32_glof_sensor.ino`
- Press `F1` → "Wokwi: Start Simulator"
- Adjust sensors in the diagram
- Watch data flow to dashboard!

---

## 🎯 Quick Demo Scenario

### Trigger CRITICAL Alert:

1. **In Wokwi:** Click DHT22 → Set temperature to **15°C**
2. **In Wokwi:** Click HC-SR04 → Set distance to **50cm**
3. **In Wokwi:** Drag seismic slider to **4000**
4. **Watch:**
   - Wokwi serial monitor: Shows CRITICAL readings
   - Backend console: Receives alert, sends emails
   - Dashboard: Red alert appears!

---

## 📸 Perfect for Presentation

**Screen Layout:**
```
┌──────────────────┬──────────────────┐
│  VS Code         │  Browser         │
│  (Wokwi)         │  (Dashboard)     │
│  + Serial        │  localhost:3000  │
│  Monitor         │                  │
└──────────────────┴──────────────────┘
```

---

## ⚡ Troubleshooting

**Issue:** "Compilation failed"

**Fix:** Make sure you're in the right directory:
```bash
cd "/Users/apple/Desktop/Fast Hackathon/barfani/sensor/esp32_glof_sensor"
code esp32_glof_sensor.ino
```

**Issue:** "Cannot connect to backend"

**Fix:** Check backend is running:
```bash
curl http://localhost:5001/api/health
# Should return: {"status":"healthy"}
```

**Issue:** "License error"

**Fix:** Request new license at https://wokwi.com/vscode

---

## 🎬 You're Ready!

Everything is configured and ready to demo. Just:

1. Start backend (`npm run dev`)
2. Start frontend (`npm run dev`)
3. Open Wokwi in VS Code (`F1` → "Wokwi: Start Simulator")
4. Adjust sensors
5. Watch the magic! ✨

**Good luck with your hackathon!** 🏆
