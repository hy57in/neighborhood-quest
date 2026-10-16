# Neighborhood Quest — Capture Freely. Remember Vividly.

> **Turn your real-world neighborhood experiences into playful, explorable 3D memories.**  
> *"We don't just record where you've been. We bring how you felt there to life."*

---

## 1. Product Vision

**Neighborhood Quest** is not just a property checklist or a 3D photo viewer. It is an AI-powered neighborhood memory service where **however a user records their visit (voice, photos, video, or quick notes), Gemini 4 Argon understands both the physical environment and their emotional experience, turning it into a cozy 3D world they want to revisit.**

| Value Pillar | Traditional Property Notes | Neighborhood Quest |
|---|---|---|
| **Effortless Capture** | Manually organize photos and text tables | Capture freely while walking—voice, photos, ambient sound, mood pins, or 1-line notes |
| **Rich 3-Layer Memories** | Fragmented photos in gallery & text in notes | AI separates **Physical Environment**, **Sensory Impressions**, and **Subjective Emotions** |
| **Playful 3D Exploration** | Re-read static text checklists | Re-experience the neighborhood’s slope, golden-hour alley mood, and quietness as an interactive 3D diorama |

---

## 2. Personas & Jobs To Be Done

### 👩 Primary Persona — Jamie (29, First-Time Home Seeker in Seoul)
- **Behavior**: Visits multiple neighborhoods and apartment complexes every weekend.
- **Frustration**: After 5–6 neighborhood tours, every place blurs together. Real estate apps show price, area, and subway distance, but fail to capture:
  - *"The uphill walk from the station was much steeper than it looked on the map."*
  - *"There's a quiet forest trail right behind the complex."*
  - *"The golden-hour alley lighting felt warm and safe."*
- **Pain Points**:
  1. **Fragmented Memories**: Photos in gallery, voice notes in chat, locations on map.
  2. **Lost Context**: Looking at photos weeks later doesn't bring back how the neighborhood *felt*.
  3. **Recording Feels Like Work**: Organizing spreadsheets after walking all day is exhausting.
  4. **Difficult Comparison**: Hard to compare subjective feelings across multiple neighborhoods.

### 👫 Secondary Persona — Alex & Sam (Couple Searching for a Newlywed Home)
- **Situation**: Divide neighborhood visits between them or visit together with different priorities.
- **Value**: **Jamie/Alex** focuses on cozy alley atmosphere and park trails, while **Sam** focuses on the uphill commute strain in a suit and alley parking width.
- **Same Physical Place, Different Subjective Memory**: Both visit the exact same `85% (18°)` uphill alley in Seonghyeon-dong, yet their **Subjective Emotional Impressions** differ—and Neighborhood Quest preserves the objective physical slope while visualizing each person's subjective experience!

### Jobs To Be Done (JTBD)
> *"When I visit multiple neighborhoods, I want to capture what I saw and felt without organizing everything manually, so I can vividly remember and compare places when deciding where to live."*

---

## 3. Core Architecture: Multimodal Input → 3-Layer Memory → 3D World

```text
[ Multimodal Field Input ]
 🎙️ Voice Memos  ·  📸 Burst Photos  ·  🔊 Ambient Audio  ·  💭 Mood Pins / Text
                                  │
                                  ▼
           ┌─────────────────────────────────────────────┐
           │    Gemini 4 Argon (gemini-4-argon) Engine   │
           │    Multimodal Extraction & Verification     │
           └─────────────────────────────────────────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       ▼                          ▼                          ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│ 1. Physical Layer  │   │  2. Sensory Layer  │   │ 3. Emotional Layer │
│ (Objective Facts)  │   │ (Perceived Signals)│   │ (Subjective Vibe)  │
│ • Slope 85% (18°)  │   │ • Quietness 28dB   │   │ • Coziness 92%     │
│ • 14m to Station   │   │ • Golden Hour Glow │   │ • "Washes fatigue" │
│ • 2m to Park Trail │   │ • Pine Breeze      │   │ • Jamie vs. Sam    │
└────────────────────┘   └────────────────────┘   └────────────────────┘
       └──────────────────────────┼──────────────────────────┘
                                  ▼
        [ Interactive Three.js 3D Sensory Diorama & 1:1 Comparison ]
```

---

## 4. Why 3D?

Why represent neighborhood memories as a **3D Diorama** instead of a text note or photo album?

1. **Spatial Context**: Slope angle (`18°`), park proximity (`2 min`), and alley enclosures are inherently spatial—you understand them in 1 second when melihat a tilted 3D hill.
2. **Atmosphere & Emotion**: Golden-hour lighting, warm window glow, and quiet residential zones immediately evoke *how the place felt*.
3. **Joy of Collection**: Each neighborhood visit becomes a miniature 3D world in your personal collection (`Quest #09`), making field recording fun rather than a chore.

---

## 5. Product Hypotheses

- **H1 (Effortless Capture)**: Allowing users to speak or snap freely while walking without a rigid form increases field recording completion vs. traditional checklists.
- **H2 (Vivid Recall via 3D)**: Synthesizing multimodal notes into a 3D sensory diorama improves recall of neighborhood pros/cons 2 weeks after visiting.
- **H3 (Perspective Comparison)**: Separating **Physical Environment** from **Subjective Emotional Impressions** helps couples (like Jamie & Sam) align on housing decisions faster.

---

## 6. Tech Stack & Running Locally

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Three.js (Interactive Isometric 3D Sensory Diorama), Google Stitch Mobile-First Design (`Noto Sans KR`, `Plus Jakarta Sans`, `Material Symbols Outlined`), KO/EN Bilingual i18n.
- **AI Backend**: Express + `@google/genai` SDK calling **`gemini-4-argon`** (`POST /api/generate-world` with automated generation → validation → correction loop).

```bash
# Install dependencies
npm install

# Run both Vite frontend (http://localhost:5173) and Gemini 4 Argon server (http://localhost:8787)
npm run dev

# Production build check
npm run build
```
