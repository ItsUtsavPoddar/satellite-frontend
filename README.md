# 🛰️ Satellite Tracker

Track satellites in real time, visualize orbital paths, and explore their upcoming passes — all in one interactive map.

## 🌐 Live Demo

- 🔗 Frontend: [https://satellite.utsv.tech](https://satellite.utsv.tech)  
- ⚙️ Backend API: [https://satellite-backend-v1.onrender.com](https://satellite-backend-v1.onrender.com)

---

## 📖 Overview

Satellite Tracker is a full-stack application that allows users to query and visualize the real-time location and future path of any satellite using its NORAD ID. It also predicts visibility passes based on the user's coordinates — letting users understand which satellites will be overhead and when.

The app defaults to displaying the International Space Station (ISS), while also supporting multiple satellite tracking on the same map. All data is processed from Two-Line Element (TLE) sets fetched from a self-managed database backed by Celestrak's API.

This tool is designed to serve curious minds, astronomy enthusiasts, educators, and hobbyists with clean UI and advanced orbital visualization.

---

## ✨ Key Features

- 🔭 **Real-time satellite tracking** using TLE data from Celestrak
- 🗺️ **Live orbital visualization** on an interactive Leaflet map
- ☀️ **Pass prediction** for the next 10 days with sunlight/shadow status
- 🌒 **Daylight vs. Earth’s shadow view** on orbital path
- 🛰️ **Add & remove multiple satellites**, tracked simultaneously
- 🧠 **Satellite education** via simplified orbital parameters (docs coming)
- 🧊 **TLE data caching** to reduce Celestrak API load
- 💡 **Future work**: ISS live feed, user profiles, saved satellites, UI revamp

---
## 🔮 Roadmap / Future Work

- [ ] 🔴 **ISS live feed video integration** – Real-time camera view synced with sunlight/shadow transitions
- [ ] 🟢 **User authentication** – Allow users to log in, save satellite preferences, and coordinate profiles
- [ ] 🟢 **Revamped UI/UX** – Improve mobile layout, add loading states and feedback animations
- [ ] 🟢 **User coordinate profiles** – Store and reuse location presets for pass predictions
- [ ] 🟢 **Orbital education portal** – Teach orbital elements (e.g., inclination, RAAN) through visual tools
- [ ] 🟢 **Global chat feature** – Authenticated users can discuss satellites, passes, and events in a real-time chatroom (WebSocket-based)

---
## 🌌 Advanced Orbital Models & Astronomical Calculations

### 🛰️ Satellite Propagation Using TLE

This app uses [Satellite.js](https://github.com/shashwatak/satellite-js) to parse TLE data and calculate satellite positions in real-time. Satellite.js is a JavaScript port of the SGP4 model, built on the foundation of:

- David Vallado's C++ SGP4 implementation  
- Brandon Rhodes’ Python SGP4  
- Hoots & Roehrich's *SpaceTrack Report #3*  
- 📘 TS Kelso’s **Satellite Times Columns** (Parts I–IV)  
- 🎓 UC Boulder's Aerospace Engineering coursework

These serve as the mathematical core of orbital prediction software and are used across many ground-tracking systems.

---

### ☀️ Custom Solar Position Model

Since the **Sun does not follow a geocentric orbit**, it has **no valid TLE**. I implemented a custom astronomical model to compute the Sun’s position in real time using the formulas from:

- 📕 *Astronomical Algorithms* – Jean Meeus (1991)
- 📘 TS Kelso’s CelesTrak Columns: [https://celestrak.org/columns](https://celestrak.org/columns/)

This includes:
- Julian Date conversion  
- Solar mean anomaly and ecliptic longitude  
- Right Ascension (RA) and Declination (Dec)  
- Local Sidereal Time and observer hour angle  
- Azimuth and elevation at the observer's location  
- ECI coordinates of the Sun for shadow calculations

---

### 🌑 Earth Shadow & Eclipse Detection

To determine whether a satellite is in Earth’s shadow:

- Calculate vector angles between `sat → Earth` and `sat → Sun`
- Compute angular radii:
  - **θ_Earth** = asin(R_E / dist_sat_to_Earth)  
  - **θ_Sun** = asin(R_S / dist_sat_to_Sun)
- Use dot product of vectors and compare angles:
  - **Umbral**: θ < θ_Earth − θ_Sun  
  - **Penumbral**: |θ_Earth − θ_Sun| < θ < θ_Earth + θ_Sun

This determines sunlight/shadow state for each satellite, and powers the **color-coded orbital path** shown on the map.

---

### 📏 Computational Assumptions & Thresholds

**Pass Prediction:**
- Elevation > 5° = considered "in pass"
- Max Elevation ≥ 10° = retained for display
- Sampled every 10 seconds over 48h

**Visibility:**
- Sun elevation < -6° (civil twilight)
- Satellite not in shadow
- Satellite elevation > 5°

**Orbital Path Rendering:**
- 80 minutes ahead  
- 1-second intervals  
- Colored by shadow state  
- Anti-meridian cross triggers path segmentation

**Sunrise/Sunset Detection:**
- Triggers when a satellite transitions into/out of eclipse
- Stored as array of `sunrise/sunset` times per satellite

---

### 🌐 Terminator Line (Day/Night Boundary)

Currently, the Earth’s day/night terminator line is drawn using a lightweight helper library.  
However, I plan to replace this with a **custom-rendered terminator** calculated via:

- The **Sun’s declination angle**, and  
- Time-based rotation to compute Earth’s night side dynamically

> This will ensure full control, reduce dependencies, and improve realism.

---

### 🧠 Why I Built This From Scratch

Most satellite apps either ignore lighting/eclipses or use external APIs.  
I wanted:
- Deeper educational control  
- Better simulation accuracy  
- Independence from 3rd party APIs  
- A learning project bridging **astronomy, geodesy, and software engineering**

---

### 📚 Resources Worth Reading (if you're serious)

- TS Kelso’s Satellite Times: [https://celestrak.org/columns](https://celestrak.org/columns)  
- *Astronomical Algorithms* – Jean Meeus  
- *Fundamentals of Astrodynamics and Applications* – David Vallado  
- [Satellite.js source code](https://github.com/shashwatak/satellite-js)  
- UC Boulder's ASEN orbital mechanics coursework

---

> 🧭 *This project is not just a tracker — it’s a fusion of astronomy, physics, and full-stack engineering.*

---
## 🛠️ Tech Stack

### 🌐 Frontend
- [Next.js](https://nextjs.org/) — Framework
- [Leaflet.js](https://leafletjs.com/) — Map visualizations
- [Satellite.js](https://github.com/shashwatak/satellite-js) — TLE processing

### ⚙️ Backend
- Spring Boot (Java)
- MySQL (CleverCloud Free Tier)
- Caching logic (re-fetch if TLE > 2 hrs old)
- Dockerized backend deployment
- Hosted on [Render](https://render.com/) (with GitHub Actions + CronJobs to stay alive)

### ☁️ Hosting
- Frontend: Vercel (Custom Domain: `satellite.utsv.tech`)
- Backend: Docker → Render Free Tier
- Database: MySQL on CleverCloud

---

## 📷 Screenshots

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5d8c4bdb-3d98-49d7-89c4-f036000dcc8a" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fd5e8f19-5f27-478b-94b4-beb42915ed71" />



---

## ⚙️ Local Setup Instructions

### 🔹 Frontend

```bash
git clone https://github.com/yourusername/satellite-frontend
cd satellite-frontend
npm install
npm run dev
```
### 🔹 Backend

The backend is a Spring Boot application that serves TLE data and pass calculations.  
It is Dockerized and deployed via Render.

🛠 To run it locally, follow the setup in the backend repo here:  
👉 [satellite-backend](https://github.com/ItsUtsavPoddar/satellite-backend)

