# SignForge — Implementation Plan

> A local-first, zero-server document signing tool.
> Nothing leaves the browser. No accounts, no subscriptions, no watermarks.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Color Palette & Design Tokens](#color-palette--design-tokens)
5. [Visual Design Direction](#visual-design-direction)
6. [Page Breakdown & Features](#page-breakdown--features)
7. [Python Backend (Optional Fallback)](#python-backend-optional-fallback)
8. [Key Differentiators](#key-differentiators)
9. [Build Order](#build-order)
10. [Deployment](#deployment)

---

## Core Philosophy

- **Nothing leaves the browser** — all processing happens client-side
- **No accounts, no subscriptions, no watermarks**
- **Signature lives on the user's device** — stored locally, never uploaded
- **Works fully offline** after first load (PWA-ready)

---

## Tech Stack

| Layer            | Tech                          | Why                                    |
| ---------------- | ----------------------------- | -------------------------------------- |
| Frontend         | React + Vite                  | Fast, component-based                  |
| Styling          | Tailwind CSS + Framer Motion  | Modern UI + smooth animations          |
| PDF Render       | React-PDF (locally bundled)   | Render PDF pages in browser            |
| PDF Manipulation | pdf-lib (locally bundled)     | Embed signature into PDF               |
| Canvas Work      | Native HTML5 Canvas API       | Draw + blue ink extraction             |
| Backend          | Python + FastAPI              | Only for image processing fallback     |
| Font             | Single self-hosted cursive .ttf | Typed signature style                |
| Hosting          | Vercel (frontend)             | Free, instant deploy                   |

---

## Project Structure

```
signforge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── GlowButton.jsx        # Neon-glow CTA button
│   │   │   │   ├── GlassCard.jsx          # Glassmorphism card wrapper
│   │   │   │   ├── TooltipHint.jsx        # Hover tooltips
│   │   │   │   └── StepIndicator.jsx      # Progress step display
│   │   │   ├── signature/
│   │   │   │   ├── DrawPad.jsx            # Freehand drawing canvas
│   │   │   │   ├── TypeSignature.jsx      # Type-to-sign with cursive font
│   │   │   │   ├── UploadSignature.jsx    # Photo upload + blue ink extraction
│   │   │   │   └── SignaturePreview.jsx   # Preview before download
│   │   │   ├── document/
│   │   │   │   ├── PDFViewer.jsx          # Page-by-page PDF renderer
│   │   │   │   ├── SignatureDragger.jsx   # Draggable + resizable overlay
│   │   │   │   └── PageSelector.jsx       # Multi-page navigation
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx             # Top nav with offline indicator
│   │   │       └── Footer.jsx
│   │   ├── utils/
│   │   │   ├── renderPDF.js               # pdf-lib rendering helpers
│   │   │   └── canvasHelpers.js           # Canvas drawing + ink extraction
│   │   ├── hooks/
│   │   │   ├── useSignatureCanvas.js      # Canvas state + drawing logic
│   │   │   └── usePDFDocument.js          # PDF load + page management
│   │   ├── pages/
│   │   │   ├── Landing.jsx                # Hero + intro
│   │   │   ├── CreateSignature.jsx        # Draw / Type / Upload tabs
│   │   │   └── SignDocument.jsx           # PDF viewer + signature placement
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── fonts/
│   │       └── Signature.ttf              # Self-hosted cursive font
│   └── package.json
│
├── backend/                                # Optional — only if canvas extraction isn't enough
│   ├── main.py                             # FastAPI app entry
│   ├── routes/
│   │   └── image_process.py                # POST /extract-signature
│   ├── utils/
│   │   └── blue_ink.py                     # OpenCV blue ink isolation
│   └── requirements.txt
│
└── plan.md
```

---

## Color Palette & Design Tokens

| Token      | Hex       | Usage                     |
| ---------- | --------- | ------------------------- |
| Background | `#0A0A0F` | Near black — page bg      |
| Surface    | `#111118` | Dark cards / panels       |
| Primary    | `#6C63FF` | Electric purple — CTAs    |
| Accent     | `#00D9FF` | Cyan glow — highlights    |
| Success    | `#00FF94` | Neon green — confirmations |
| Text       | `#E8E8FF` | Soft white — body text    |

Map these to Tailwind via `tailwind.config.js`:

```js
colors: {
  bg:      '#0A0A0F',
  surface: '#111118',
  primary: '#6C63FF',
  accent:  '#00D9FF',
  success: '#00FF94',
  text:    '#E8E8FF',
}
```

---

## Visual Design Direction

- **Dark glassmorphism** cards — `backdrop-blur` + semi-transparent borders
- Subtle **grid/dot pattern** background
- **Neon glow** effects on interactive elements (buttons, canvas strokes)
- Smooth **page transitions** via Framer Motion (`AnimatePresence`)
- Floating **particles or aurora gradient** in the hero section
- Everything should feel like a **premium SaaS tool**

---

## Page Breakdown & Features

### Page 1 — Landing (`/`)

**What the user sees:**

- Full-screen dark hero with animated aurora gradient background
- Floating "SignForge" logo with glow
- Tagline: *"Your signature. Your device. Always private."*
- Two CTA buttons:
  - **Create Signature** → `/create`
  - **Sign Document** → `/sign`
- Feature cards (3): Privacy, Offline, No Watermark
- Scroll animations via Framer Motion

---

### Page 2 — Create Signature (`/create`)

Three tabs across the top:

#### Tab 1 — Draw

- Large dark canvas with a faint baseline guide
- Smooth brush stroke rendering (not jaggy — use quadratic curves)
- Pen pressure simulation via stroke width variation
- Buttons: `Clear` | `Undo` | `Download PNG`
- Glow effect trails as you draw
- Output: transparent PNG

#### Tab 2 — Type

- Text input field → renders live in cursive font on canvas below
- Font size slider
- Slight ink-bleed effect to look handwritten, not digital
- Output: transparent PNG via `canvas.toDataURL()`

#### Tab 3 — Upload Photo

- Drag-and-drop zone with animated dashed border
- User uploads photo of real signature (blue pen on white paper)
- Canvas processes it:
  1. Isolates blue ink pixels only (HSV-based filtering in JS)
  2. Removes white background
  3. Outputs clean transparent PNG
- Tolerance slider to fine-tune extraction threshold
- Before/After preview side by side
- Download button
- **Fallback:** If canvas extraction is insufficient, hit the Python backend

#### Shared across all tabs

- `SignaturePreview.jsx` shows final result in a GlassCard
- Download saves as `signforge_signature.png`
- Toast: *"File never left your device"*

---

### Page 3 — Sign Document (`/sign`)

**Layout:** Split view

| Left Panel (60%)      | Right Panel (40%)              |
| --------------------- | ------------------------------ |
| PDF viewer (scrollable, page-by-page) | Signature placement controls |

**Flow:**

```
1. Upload PDF
       ↓
2. PDF renders page-by-page in left panel (React-PDF)
       ↓
3. Upload saved signature PNG (or create one inline)
       ↓
4. Signature appears as draggable + resizable overlay on PDF
       ↓
5. User drags it to exact position on the desired page
       ↓
6. Click "Apply & Download"
       ↓
7. pdf-lib embeds signature at exact coordinates into the PDF
       ↓
8. Clean signed PDF downloads to device
```

**Right panel controls:**

- Page selector (multi-page PDF navigation)
- Signature opacity slider
- Signature rotation handle
- Signature scale handle
- Reset position button
- "Apply & Download" CTA (GlowButton)

---

## Python Backend (Optional Fallback)

Only used if client-side blue ink extraction on canvas isn't precise enough (bad lighting, low-quality photo).

**Single endpoint:**

```
POST /extract-signature
  → receives image (multipart/form-data)
  → returns transparent PNG
```

**Core logic (`blue_ink.py`):**

```python
import cv2
import numpy as np

def extract_blue_ink(image_path):
    img = cv2.imread(image_path)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower_blue = np.array([100, 50, 50])
    upper_blue = np.array([140, 255, 255])

    mask = cv2.inRange(hsv, lower_blue, upper_blue)
    result = cv2.bitwise_and(img, img, mask=mask)

    rgba = cv2.cvtColor(result, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = mask

    return rgba
```

**Dependencies:** `fastapi`, `uvicorn`, `opencv-python-headless`, `numpy`, `python-multipart`

---

## Key Differentiators

Build these into the UI prominently:

1. **"Offline ready" indicator** in navbar — green dot + *"All processing on your device"*
2. **No watermark** badge on every download
3. **"File never left your device"** toast notification on every upload/process action
4. **Consistent filenames** — signature downloads as `signforge_signature.png`

---

## Build Order

### Week 1 — Foundation + Signature Creation

- [ ] Initialize React + Vite project
- [ ] Configure Tailwind CSS with custom color tokens
- [ ] Set up Framer Motion
- [ ] Set up React Router (`/`, `/create`, `/sign`)
- [ ] Build shared UI components: `GlowButton`, `GlassCard`, `TooltipHint`, `StepIndicator`
- [ ] Build `Landing.jsx` with aurora gradient hero + CTAs
- [ ] Build `CreateSignature.jsx` page shell with tab navigation
- [ ] Implement **Draw** tab: `DrawPad.jsx` + `useSignatureCanvas` hook
- [ ] Implement **Type** tab: `TypeSignature.jsx` with cursive font rendering

### Week 2 — Upload + Signature Finalization

- [ ] Implement **Upload** tab: `UploadSignature.jsx` with drag-and-drop
- [ ] Build client-side blue ink extraction in `canvasHelpers.js`
- [ ] Add tolerance slider + before/after preview
- [ ] Build `SignaturePreview.jsx` with download functionality
- [ ] (Optional) Set up Python FastAPI backend as extraction fallback
- [ ] Add toast notifications for privacy messaging

### Week 3 — PDF Signing

- [ ] Integrate React-PDF: `PDFViewer.jsx` + `usePDFDocument` hook
- [ ] Build `PageSelector.jsx` for multi-page navigation
- [ ] Build `SignatureDragger.jsx` — draggable + resizable overlay
- [ ] Add opacity, rotation, and scale controls
- [ ] Integrate pdf-lib: embed signature at exact coordinates
- [ ] Build "Apply & Download" flow with signed PDF output

### Week 4 — Polish + Deploy

- [ ] Add page transitions with `AnimatePresence`
- [ ] Add dot/grid background pattern
- [ ] Add offline indicator in navbar
- [ ] Responsive design pass (mobile + tablet)
- [ ] Performance optimization (lazy load PDF worker, code splitting)
- [ ] Deploy frontend to Vercel
- [ ] (Optional) Deploy backend to Railway / Render if needed
- [ ] Final QA + cross-browser testing

---

## Dependencies (Frontend)

```json
{
  "react": "^18",
  "react-dom": "^18",
  "react-router-dom": "^6",
  "react-pdf": "^7",
  "pdf-lib": "^1.17",
  "framer-motion": "^11",
  "react-hot-toast": "^2"
}
```

**Dev dependencies:** `vite`, `tailwindcss`, `autoprefixer`, `postcss`
