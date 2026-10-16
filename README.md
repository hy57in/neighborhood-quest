# 🏡 Neighborhood Quest (동네 퀘스트)

**Capture Freely. Remember Vividly.**  
> **Turn your real-world neighborhood experiences into playful, explorable 3D memories powered by Gemini 4 Argon.**

---

## 1. Product Vision

**Neighborhood Quest** is not just a digital real-estate note or a simple photo-to-3D converter.  
It is an **AI-powered spatial memory service** where no matter how a user records a neighborhood visit—photos, voice notes, sensory impressions, or quick text—**Gemini 4 Argon** understands the physical features and emotional context of that place and transforms it into a **playful, explorable 3D world**.

Here, **3D is not mere visual decoration**—it creates the joy of recording and the motivation to revisit and compare neighborhoods vividly.

### Three Core Values (`Explore → Capture → 3D World`)

| Core Value | Traditional Field Notes (기존 임장노트) | Neighborhood Quest |
|---|---|---|
| **Effortless Capture** | Manually organizing photos, spreadsheets, and text notes | Capture freely in any format—photos, voice memos, slope/noise tags, and text |
| **Rich Memories** | Flat text and disconnected gallery photos | **Gemini 4 Argon** interprets emotions + spatial features into an interactive **3D Diorama** |
| **Playful Exploration** | Tedious post-visit homework | Explore your 3D neighborhood with **🐧 Pingu & 🐶 Gyodong**, inspect multimodal evidence pins, and collect stamps |

---

## 2. Personas

### 👩 Primary Persona — Meet Jamie (첫 집을 찾는 도시 탐험가)

| Attribute | Detail |
|---|---|
| **Age / Role** | 29-year-old Office Worker in Seoul, South Korea |
| **Situation** | Looking for her first home; visits multiple neighborhoods and apartment complexes every weekend |
| **Motivation** | Find a neighborhood that truly fits her daily commute and lifestyle |
| **Frustration** | After visiting 5–6 complexes, every neighborhood blurs together in her camera roll |

*Note: Jamie is a fictional persona created for product design, not an actual user research subject.*

#### Jamie's Pain Points
1. **Fragmented Memories**: Photos sit in the phone gallery, memos in a notes app, and locations on a map.
2. **Lost Context**: Looking at an apartment photo weeks later doesn't bring back how steep the walk from the subway felt or how peaceful the back-alley park was at sunset.
3. **Recording Feels Like Work**: Organizing field notes after walking 15,000 steps feels like unpaid homework.
4. **Difficult Comparison**: Comparing subjective sensory impressions alongside objective resale liquidity is overwhelming.

#### Jobs To Be Done (JTBD)
> *"When I visit multiple neighborhoods, I want to capture what I saw and felt without organizing everything manually, so I can vividly remember and revisit places when deciding where to live."*

---

### 👩‍❤️‍👨 Secondary Persona — Meet Alex & Sam (함께 집을 찾는 커플: 🐧 핑구 & 🐶 교동)

A couple searching for their next home together visits the exact same neighborhood, yet notices completely different things:
- **🐧 Pingu (출퇴근·현실·환금성 중심 / Commute & Reality Focus)**: *"The subway walk is convenient, and the 6 resale liquidity pillars (Brand, New Build, Station, School, Flatland, Scale) are rock-solid."*
- **🐶 Gyodong (감성·산책·동네 분위기 중심 / Vibe & Walkability Focus)**: *"The uphill walk was tiring, but the quiet tree-lined walkway at the top felt so cozy at sunset."*

In **Neighborhood Quest**, both **🐧 Pingu** and **🐶 Gyodong** stand unobstructed on the front promenade of the 3D Diorama, preserving each person's distinct perspective on the same place.

---

## 3. Revised Problem Statement

> **Exploring a neighborhood is a rich, multisensory experience, but documenting it is fragmented and tedious.**  
> People capture what they see, hear, and feel through photos, videos, voice notes, and text. Yet these disconnected records fail to preserve the full experience of being there.  
> As a result, valuable impressions fade, and remembering neighborhoods becomes difficult.

---

## 4. Solution — Multimodal Input → Unified Memory → 3D World

```text
        NEIGHBORHOOD VISIT
                 │
      ┌──────────┼──────────┐
      │          │          │
   📸 Photos  🎙️ Voice   🎥 Sensory Tags
      │          │          │
      └────┬─────┴────┬─────┘
           │  📝 Text │
           └────┬─────┘
                ▼
         GEMINI 4 ARGON
                │
     Multimodal Understanding
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
    Physical  Sensory  Emotional
    Features  Details  Impressions
       └────────┼────────┘
                ▼
       Structured Memory
                │
        3D Scene Generation
                │
        Evidence Validation
                ▼
      🏡 INTERACTIVE 3D WORLD
                │
      Explore · Capture · Revisit
```

### What Gemini 4 Argon Extracts & Maps to 3D

| Category | Field Observation Example | 3D Diorama Representation |
|---|---|---|
| **Terrain** | Steep uphill walk from subway (`14°`) | Elevated 3D terrain slope & escalator path |
| **Architecture** | Attached apartment photo | **Photo-to-3D** custom color palette, facade relief & skyline massing |
| **Nature** | Beautiful nearby park | 3D trees, green lawn, and walking paths |
| **Transportation** | Subway station nearby | Stylized subway entrance & commute badge |
| **Noise & Vibe** | Quiet interior walkway (`38dB`) | Calm ambient ring & time-of-day lighting (`Day / Sunset / Night`) |
| **Objective Liquidity** | **6 Golden Pillars of Resale Liquidity** | `1. 브랜드 (Brand)` · `2. 신축 (New Build)` · `3. 역세권 (Station)` · `4. 학군 (School)` · `5. 평지 (Flatland)` · `6. 세대수 (Households)` |

Crucially, **Neighborhood Quest** separates **objective physical/market facts** from **subjective sensory impressions**, linking every 3D element back to its source evidence (`🎤 Voice Memo`, `📷 Field Photo`, `🔉 Noise dB`, `🏫 School Anchor`).

---

## 5. Why 3D?

1. **Experience, Not Just Information**: Text stores facts; a 3D world lets you spatially re-experience climbing a `14°` hill and discovering a quiet park at the top.
2. **Spatial Context**: Slope, building density, sunlight direction, and park proximity are inherently spatial—they come alive immediately in an interactive 3D diorama.
3. **Playful Motivation**: Watching your photos and voice memos turn into a miniature 3D town with **🐧 Pingu** and **🐶 Gyodong** transforms tedious note-taking into an engaging quest.

---

## 6. Focused 3-Tab Neo-Tactile Glass UI

1. **`탐색` (Explore — Google Maps & Location Verification)**
   - Keyless **Google Maps** Korean road tiles & interactive Google Maps Embed.
   - **Location Verification Flow**: Verify current GPS or clicked map coordinates (*"여기가 맞나요?"*) or search any Korean apartment complex via live geocoding + presets.
   - **Recent Footprint Focus Card**: Instant summary of slope, noise dB, school safety, inline voice memo playback, and 1-click jump to **3D Diorama** or **Quick Capture**.
2. **`퀵기록` (Quick Capture — Multimodal Field Logger & Photo-to-3D)**
   - **Tactile Voice Recorder** with real-time waveform + **🐧 Pingu (출퇴근·현실)** / **🐶 Gyodong (감성·산책)** perspective toggle.
   - **1-Tap Sensory Chips** for perceived hill steepness (`완만함 | 보통 | 가파름 🔥`), ambient noise (`dB`), and alley sunlight (`우수 ☀️ | 보통 | 그늘짐`).
   - **Photo-to-3D Snapshot Upload** + **Gemini 4 Argon Real-Time Intelligence Card** + **Saved Quests Bookmark List**.
3. **`3D 디오라마` (3D Diorama — Interactive Three.js Spatial Memory)**
   - **Photo-to-3D Relief & Skyline**: Projects uploaded photos onto a 3D relief canvas and dynamically colors/scales apartment blocks and terrain slope.
   - **Unobstructed Front Promenade**: **🐧 Pingu (출퇴근·현실)** and **🐶 Gyodong (감성·산책)** stand front-and-center on the foreground plaza with floating 3D nameplates.
   - **Interactive Evidence Pins** (`🎤 0:14 가파른 오르막`, `📷 석재 마감/외벽`, `🔉 저소음 힐링`, `🏫 초품아 안심통학`) + **Perceived Spatial Index (`신뢰도 98.4%`)** + **6 Golden Pillars of Resale Liquidity**.

---

## 7. Quick Start & Deployment

```bash
# Install dependencies
npm install

# Start full-stack dev server (Express API + Vite frontend)
npm run dev

# Build production bundle
npm run build

# Start production server (Cloud Run compatible on PORT=8080)
npm start
```
