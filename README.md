# AeroSky — Premium Weather & Climate Dashboard PWA

AeroSky is a premium, mobile-first **Progressive Web App (PWA)** built from scratch to display real-time global weather forecasts, hourly climate trends, and local air quality indices. It features a glassmorphic dark theme with ambient weather-coded glow backdrops, interactive canvas-like inline SVG charts, and robust offline capabilities.

---

## 📱 Running on Android (PWA)

To run this application as a native Android app:
1. **Local Server**: Run a local web server on your development machine (see below).
2. **Device Connection**: Connect your Android device to the same Wi-Fi network.
3. **Browser Access**: Open Chrome on your Android device and navigate to your computer's local IP address (e.g. `http://192.168.1.100:8000`).
   - *Alternative (USB debugging)*: Connect the device via USB, open Chrome DevTools on desktop (`chrome://inspect`), set up Port Forwarding (`8000` to `localhost:8000`), and visit `http://localhost:8000` on the Android Chrome browser.
4. **Install App**: Chrome will detect the `manifest.json` and prompt you to **Add to Home Screen / Install**.
5. Once installed, AeroSky will open in full-screen standalone mode with standard app shell caching for offline use.

---

## 🚀 How to Run Locally

Since this app is built using vanilla HTML, CSS, and JS (no build tools required), you can serve it using any simple static file server:

### Option 1: Python (Built-in)
Run the following in the project directory:
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

### Option 2: Node.js (http-server or live-server)
Install and run a dev server:
```bash
npm install -g http-server
http-server -p 8000
```
Then visit: `http://localhost:8000`

---

## 🌟 Premium Features

- **Responsive Mobile-First UI**: Custom grid systems built using CSS grids and flexbox designed to fit perfectly on standard Android notch displays and tablets.
- **Dynamic Weather Ambience**: The dashboard background and ambient glows transition smoothly based on current weather codes (sunny, rainy, snowy, stormy, or foggy).
- **Service Worker Offline Cache**: Static app shell elements are cached in Chrome’s Cache Storage API so the app launches instantly when offline.
- **Offline States**: Gracefully captures API outages, presenting a connection state with a retry button and loading caches of previously viewed watchlist cities.
- **Interactive 24-Hour Climate Graph**: Generates a smooth, responsive SVG trend curve charting hourly fluctuations synced with a horizontal list of time-nodes.
- **Watchlist Persistence**: Saved locations sync with standard `localStorage` and query weather statistics dynamically on load.

---

## 📡 API Systems Utilized

We pull all weather metrics from **Open-Meteo's** free public APIs (which do not require rate-limiting API keys):
1. **Geocoding API**: Searches locations by name query.
   - `https://geocoding-api.open-meteo.com/v1/search`
2. **Weather Forecast API**: Returns current conditions, hourly forecasts, and daily parameters.
   - `https://api.open-meteo.com/v1/forecast`
3. **Air Quality API**: Fetches particulate concentrations (PM2.5, PM10) and USA AQI benchmarks.
   - `https://air-quality-api.open-meteo.com/v1/air-quality`
