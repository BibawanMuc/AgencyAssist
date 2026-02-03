# PX-AIssistent - Claude Development Guide

## Projektübersicht

**PX-AIssistent** ist eine professionelle All-in-One Content Creation Suite, die Google Gemini 3 und Veo 3.1 APIs nutzt, um multimodale KI-Workflows für Agenturen bereitzustellen.

### Kernfunktionalität

- **ChatBots**: 4 spezialisierte AI-Assistenten (General, DevX, Content Strategist, Media Analyst)
- **ThumbGen**: Intelligenter Thumbnail-Generator mit Plattform-Presets
- **StoryGen**: Vollständiger Storyboard-to-Video Workflow mit Asset-Management
- **ImageGen**: Text-to-Image & Inpainting mit Canvas-Editor
- **VideoGen**: Text-to-Video & Image-to-Video mit Veo 3.1

---

- **Status:** Maintenance & Polishing
- **Recent Fixes (Feb 2026):**
  - Standardized all Image Generation to use `gemini-3-pro-image-preview` (via `ImageModel` alias) to resolve 404/Empty errors with Flash/Imagen models.
  - Implemented auto-logout for `403 Forbidden` / `Not authenticated` errors across all generator pages (`ThumbGen`, `ImageGen`, `VideoGen`, `StoryGen`).
  - Fixed `StoryGen` 404 errors by migrating from `FLASH` to `PRO` model system-wide.
- **Current Focus:** Ensuring stability of generative features and deployment readiness.

**Stand: 03.02.2026 - Maintenance & Polishing**

Das Projekt verfügt nun über eine vollständige Supabase-Integration, persistente History-Funktionen für alle Generatoren und Webcam-Support.

### ✅ Implementiert:

1. **Supabase Integration**
   - Client Config (`src/config/supabase.ts`)
   - Type Definitions (`supabase_schema.sql`)

2. **Authentication System**
   - Auth Service (`src/services/auth.ts`) via Supabase Auth
   - Auth Context (`src/contexts/AuthContext.tsx`) with `useAuth` hook
   - Type-safe User mapping
   - Login & Signup UI (`src/components/auth/`)
   - Protected Route Logic

3. **Backend Services (Direct Client)**
   - Database Service (`src/services/supabase-db.ts`) für Chat & Storyboards
   - Storage Service (`src/services/supabase-storage.ts`) für Assets
   - Gemini Service (`src/services/gemini.ts`) für direkte API-Calls (Serverless/Client-Side)

4. **Frontend Migration & New Features**
   - **History UI**: Alle Generatoren (Thumb/Image/Video/Story) haben nun eine persistente History-Sidebar.
   - **ThumbGen 2.0**: Aspect-Ratio-Support & "No-Magic"-Prompting für mehr Kontrolle.
   - **Webcam Support**: Direkte Bildaufnahme in ImageGen, VideoGen und StoryGen.
   - **Download Fixes**: Zuverlässiger Blob-Download für alle Assets.

### 🗑️ Entfernt (Cleanup):

- Firebase Cloud Functions
- Firebase Config & Rules
- `isApiKeySelected` Logik (da ein Key für alle Modelle genutzt wird)
- Veraltete Services (`firestore.ts`, `api.ts`)

---

## Technologie-Stack

### Frontend

- **React 19.x** mit TypeScript 5.x
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **React Router DOM** (Routing)

### Backend & Infrastructure

- **Supabase Auth** (Authentication)
- **Supabase Database** (PostgreSQL-based persistence)
- **Supabase Storage** (Asset Hosting)

### KI & APIs

- **Google GenAI SDK** (Client-side usage)
- **Gemini 2.5 Flash / 3.0 Pro** (via API Key)
- **Veo 3.1** (via API Key)

---

## Projektstruktur

```
D:\PX AgenturApp\PROJECT\CODE\260109-DL-px-aissistent\
├── src/
│   ├── config/
│   │   └── supabase.ts                 # Supabase Client Init
│   ├── services/
│   │   ├── auth.ts                     # Auth Wrapper
│   │   ├── gemini.ts                   # AI Generation Logic (Gemini/Veo)
│   │   ├── supabase-db.ts              # Database Operations
│   │   └── supabase-storage.ts         # File Upload/Download
│   ├── contexts/
│   │   └── AuthContext.tsx             # Global User State
│   ├── components/
│   │   ├── auth/                       # Login/Signup Pages
│   │   ├── ChatPage.tsx
│   │   ├── StoryGenPage.tsx
│   │   ├── ImageGenPage.tsx
│   │   └── VideoGenPage.tsx
│   └── App.tsx                         # Routing & Layout
│
├── supabase_schema.sql                 # SQL Definition
├── .env.local                          # Environment Variables
└── package.json
```

---

## Environment Variables

Die Anwendung benötigt folgende Umgebungsvariablen in `.env.local`:

```env
# Gemini API Configuration
API_KEY=AIzaSy...                 # Google AI Studio Key (nutzbar für Flash, Pro & Veo)

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
```

---

## Features & Workflows

### 1. Unified API Key

Die Anwendung nutzt einen einzigen API Key (`process.env.API_KEY`) für alle KI-Modelle. Die Unterscheidung zwischen Flash/Pro-Keys im UI wurde entfernt, um die UX zu vereinfachen.

### 2. Direct AI Access

Da es keine Middle-Layer-Functions mehr gibt, ruft der Client (`gemini.ts`) die Google AI APIs direkt auf. Dies reduziert Latenz und Komplexität, erfordert aber einen gültigen API Key im Client-Environment oder Proxy (für Production empfohlen).

### 3. Data Persistence

- **Chats**: Werden in der `chat_sessions` Tabelle gespeichert.
- **Storyboards**: Werden in der `storyboard_sessions` Tabelle gespeichert.
- **Assets**: Bilder und Videos landen im Supabase Storage Bucket `assets`.

---

## Development

### Setup

1. Repository klonen.
2. `npm install`
3. `.env.local` erstellen und Keys eintragen.
4. Supabase Projekt aufsetzen und Schema (`supabase_schema.sql`) ausführen.
5. In Supabase Storage einen Bucket namens `assets` erstellen (Public access policy setzen).

### Start

```bash
npm run dev
```

### Build

```bash
npm run build
```
