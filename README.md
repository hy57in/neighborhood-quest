# 🏡 Neighborhood & Policy Quest — Explore, Capture, Remember, Simulate

**Google DeepMind AI Hackathon (Seoul, Oct 2026)** · Powered by **`gemini-4-argon`** (`@google/genai` Interactions API) + **Three.js** + **React / TypeScript**

Turn real-world Seoul home tours (임장) and government housing policy documents into cozy, verified **3D miniature neighborhood worlds** with resident NPCs **Pingu (`🐧 핑구`)** and **Gyodong (`🐶 교동`)**.

---

## ✨ Core Innovation: Dual Gemini 4 Argon Verification Loops

### 1. Multimodal 3D Memory & Spatial Verification Loop (`Neighborhood Quest`)
`Field Photos + Korean/English Voice Notes` → **`gemini-4-argon` Multimodal Understanding** → **3D Scene Blueprint** → **Automated Verification Loop (`Generation → Validation → Correction`)** → **Interactive 3D Memory & Stamp**
- **Explicit Evidence Separation**: Distinguishes **Verified Field Observations** (grounded in user photos, voice notes, and sensor ratings) from **AI Stylized 3D Interpretations** (Animal Crossing-inspired miniature proportions and ambient lighting).
- **Stylized 3D Spatial Telemetry**:
  - **Steep Hills & Stairs**: Renders tiered hillside elevation and 3D stairway geometry when steep slopes are detected (e.g., *Oksu Park Hills 16°*).
  - **Subway Access**: Renders a line-color-coded 3D subway entrance portal with walk-time telemetry.
  - **Traffic Noise Acoustic Waves**: Renders pulsing 3D concentric acoustic wave rings and moving miniature cars proportional to street noise (`dB`).
  - **Collectible Stamps & Side-by-Side Comparison**: Unlock stamps in the Stamp Passport and run AI Trade-Off Matrices across visited neighborhoods.

### 2. Government Policy → Game Rule Engine (`PolicyQuest`)
`Government Policy Document (KR/EN)` → **`gemini-4-argon` Rule Extraction** → **Automated 30-Year Mortgage Math Verification (`min(LTV Cap, Stress DSR Cap)`)** → **Human-in-the-Loop Approval Gate** → **Live 3D Village Transformation**
- Walk around the 3D island with **`WASD` / Arrow Keys** and talk to village residents **Pingu (`🐧 핑구`, Newlywed Buyer)** and **Gyodong (`🐶 교동`, 29yo Solo Dev)**.
- See why a headline `70% LTV` rule is often overridden by the `40% Stress DSR` ceiling, and approve policy changes to watch Pingu and Gyodong unlock (or lose) homeownership in real time.

---

## 🚀 Quick Start (Local Development)

```bash
npm install
# Configure GEMINI_API_KEY in .env (never committed to git)
npm run dev
```

- **Frontend (Vite HMR)**: `http://localhost:5173`
- **Backend API (`gemini-4-argon`)**: `http://localhost:8080/api/health`
