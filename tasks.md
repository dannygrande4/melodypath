# MelodyPath — Build Tasks

> **Initial URL:** `dannygrande.com/music`  
> **Future URL:** Own domain (e.g. `melodypath.com`)  
> Routing and asset paths are fully env-var driven — migration = change 2 vars + redeploy.

---

## Phase 1 — Project Setup

- [ ] Initialize pnpm monorepo root with `pnpm init` + `pnpm-workspace.yaml`
- [ ] Add Turbo (`turbo.json`) with `dev`, `build`, `test`, `lint` pipelines
- [ ] Scaffold `apps/web` — Vite + React 18 + TypeScript
- [ ] Scaffold `apps/server` — Fastify + TypeScript
- [ ] Scaffold `packages/audio-engine`, `packages/music-theory`, `packages/shared-types`
- [ ] Configure TypeScript (`tsconfig.json`) across all packages (strict mode)
- [ ] Configure ESLint + Prettier (shared config in root)
- [ ] Set up Prisma: `schema.prisma` with all models (User, Lesson, Song, LessonProgress, SongAttempt, Achievement, UserAchievement)
- [ ] Run initial Prisma migration (`prisma migrate dev --name init`)
- [ ] Create Supabase project — enable Auth + create storage buckets (`midi-files`, `audio-files`, `lesson-content`)
- [ ] Set up `.env.example` files for `apps/web` and `apps/server`
- [ ] Add GitHub Actions CI workflow (lint + test + build on PR)
- [ ] **Verify:** `pnpm dev` runs web + server; DB migration applies cleanly

---

## Phase 2 — Subpath & Domain Configuration (do this early, not at deploy time)

- [ ] Set `base: process.env.VITE_BASE_PATH ?? '/music'` in `apps/web/vite.config.ts`
- [ ] Pass `basename={import.meta.env.VITE_BASE_PATH}` to `<BrowserRouter>` in `main.tsx`
- [ ] Create `apps/web/.env.development` → `VITE_BASE_PATH=/music`, `VITE_API_URL=http://localhost:3001`
- [ ] Create `apps/web/.env.production.example` → `VITE_BASE_PATH=/music`, `VITE_API_URL=https://dannygrande.com/music-api`
- [ ] All `fetch()` calls use `import.meta.env.VITE_API_URL` as base — create `lib/api.ts` client helper
- [ ] Set `CORS_ORIGINS` env var on server (comma-separated list, include both `dannygrande.com` and future domain)
- [ ] **Verify:** Build output asset paths start with `/music/`; React Router links work under `/music`

---

## Phase 3 — Audio Engine Package

- [ ] Install Tone.js + Tonal.js in `packages/audio-engine`
- [ ] Implement `AudioEngine` class:
  - [ ] `playNote(note, duration, instrument)`
  - [ ] `playChord(notes[], duration)`
  - [ ] `startMetronome(bpm)` / `stopMetronome()`
  - [ ] `loadSoundfont(instrument)` (soundfont-player)
  - [ ] `scheduleSequence(noteEvents[])`
- [ ] Implement `packages/music-theory` wrappers over Tonal.js:
  - [ ] `getChord(name)` → `{ notes[], intervals[], type }`
  - [ ] `getScale(root, type)` → `{ notes[], degrees[] }`
  - [ ] `getIntervals(root, target)`
  - [ ] `transposeNote(note, interval)`
  - [ ] `getProgressionChords(key, numerals[])` — e.g. `('C', ['I','IV','V'])` → chords
- [ ] Unit tests for all music-theory functions (Jest, no browser required)
- [ ] **Verify:** Tests pass; audio plays in a dev browser sandbox page

---

## Phase 4 — UI Foundation

- [ ] Install Tailwind CSS + shadcn/ui into `apps/web`
- [ ] Define design token CSS variables: primary palette, `--kids-*`, `--adult-*`, `--accessible-*`
- [ ] Build `AppShell` layout (sidebar nav + content area)
- [ ] Create Zustand stores: `userStore`, `audioStore`, `uiStore`
- [ ] Wire localStorage persistence for stores (skill level, streak, XP, ageMode)
- [ ] Build shared UI components: `XPBar`, `StreakBadge`, `LevelBadge`, `NoteButton`
- [ ] Build Landing page (`/`)
- [ ] Build Onboarding flow (`/onboarding`): age → instrument → 5-question placement quiz → routes to correct skill level
- [ ] Build Dashboard (`/dashboard`): streak, XP, daily challenge widget, "continue" card
- [ ] **Verify:** Onboarding sets skill level in store; dashboard shows correct state

---

## Phase 5 — Interactive Instruments

- [ ] Build `PianoKeyboard.tsx` (Canvas API):
  - [ ] Configurable key range (default 2 octaves, expand to 88)
  - [ ] Click/touch to play via AudioEngine
  - [ ] Highlight notes by role (root/3rd/5th) with color coding
  - [ ] MIDI input highlight support (wire up later in Phase 12)
- [ ] Build `GuitarFretboard.tsx` (SVG):
  - [ ] 6 strings × 24 frets
  - [ ] Chord fingering dots with finger numbers
  - [ ] Scale position dots with note names
  - [ ] Tab notation text display
- [ ] **Verify:** C major chord → piano highlights C/E/G correctly; guitar shows correct chord shape

---

## Phase 6 — Guitar Hero Play Mode

- [ ] Install PixiJS in `apps/web`
- [ ] Build `NoteHighway.ts` (PixiJS Application):
  - [ ] 4–6 lanes with lane color coding
  - [ ] Notes spawn at top, fall at tempo-derived speed
  - [ ] Hit line at bottom with visual indicator
- [ ] Build timing engine:
  - [ ] Use Tone.js Transport as master clock
  - [ ] On input: calculate delta from expected hit time
  - [ ] Perfect <20ms / Good <50ms / OK <100ms / Miss
- [ ] Build scoring system: base score × combo multiplier, accuracy %, grade (S/A/B/C/D)
- [ ] Build MIDI file parser: `.mid` → `NoteEvent[]` timeline
- [ ] Build `PlayGame.tsx` page (wraps PixiJS canvas + HUD overlay)
- [ ] Build `PlayBrowser.tsx` — song library with difficulty/genre/concept filters
- [ ] Build post-song summary screen (grade, score, accuracy chart, replay/next)
- [ ] Seed 3 test songs (easy MIDI files) for development
- [ ] **Verify:** Test MIDI plays with falling notes; timing windows score accurately

---

## Phase 7 — Learn Mode & Content

- [ ] Build `SkillTree.tsx` — visual node graph, prerequisite-based locking, level filter
- [ ] Build `LessonView.tsx` — JSON-driven lesson engine:
  - [ ] `text` step: markdown with highlighted terms
  - [ ] `animation` step: component registry (ScaleAnimation, ChordBuildAnimation)
  - [ ] `exercise` step: Piano/Guitar with expected note validation
  - [ ] `quiz` step: multiple choice with instant feedback
  - [ ] XP award + achievement check on completion
- [ ] Build `ChordExplorer.tsx` (`/explore/chords`):
  - [ ] Browse/filter all chords
  - [ ] Piano + Guitar show voicing on selection, AudioEngine plays it
  - [ ] "Try it" sandbox: click keys → Tonal.js names the chord
- [ ] Build `ScaleExplorer.tsx` (`/explore/scales`):
  - [ ] Root + scale type selector
  - [ ] Piano highlights + Guitar shows all positions
  - [ ] Animate through scale notes
- [ ] Author first 5 beginner lessons (JSON format):
  1. Musical Alphabet & Notes
  2. The Major Scale
  3. Your First Chord (C Major)
  4. I-IV-V-I Progression
  5. The Minor Scale
- [ ] **Verify:** Complete a lesson → XP increases → lesson marked complete in DB

---

## Phase 8 — Ear Training

- [ ] Build `IntervalExercise.tsx` — play 2 notes → pick interval name
- [ ] Build `ChordQualityExercise.tsx` — play chord → pick major/minor/dim/aug/7th
- [ ] Build `MelodyDictation.tsx` — play 4-note melody → select notes on piano
- [ ] Build `RhythmTapping.tsx` — visual + audio rhythm → tap spacebar to match
- [ ] Adaptive difficulty: track accuracy per interval type, increase difficulty at >80%
- [ ] **Verify:** Interval plays correct notes; correct/incorrect answers tracked in store

---

## Phase 9 — Gamification Layer

- [ ] Implement `addXP(amount)` in userStore: update XP → check level threshold → animate level-up
- [ ] Build level-up animation overlay (Framer Motion)
- [ ] Build `AchievementToast.tsx` — badge unlock notification
- [ ] Implement `achievementChecker.ts`: JSON badge config → check conditions on lesson/song complete
- [ ] Create initial badge set (JSON):
  - "First Chord", "Blues Initiate", "Hat Trick" (3 lessons), "30-Day Streak", "Ear of the Tiger", "Perfect Score", "Speed Demon"
- [ ] Implement streak system: server checks `last_practice` date on each session start
- [ ] Build Daily Challenge widget: date-seeded song + exercise, +25 XP on completion
- [ ] Build `Profile.tsx` page: stats, badge grid, practice history chart
- [ ] **Verify:** Complete lesson → XP updates → badge unlocks → streak increments next day

---

## Phase 10 — Age-Adaptive UI

- [ ] Build `AgeProvider.tsx`: inject CSS vars + context based on `uiStore.ageMode`
- [ ] Implement Kids Mode:
  - [ ] Star display replacing XP numbers
  - [ ] Terminology map JSON (e.g. "major" → "happy chord")
  - [ ] Mascot SVG character in lesson sidebar
  - [ ] Bright rounded palette, larger hit targets
  - [ ] Lesson steps capped to 5 min
- [ ] Implement Accessible Mode:
  - [ ] 18px base font, 1.6 line height
  - [ ] WCAG AA high-contrast color overrides
  - [ ] Respect `prefers-reduced-motion` OS setting + manual toggle
  - [ ] Simplified nav (3 top-level items only)
- [ ] Build Settings page (`/settings`): mode picker, instrument, font size, contrast
- [ ] **Verify:** Toggle modes → UI updates instantly; Accessible Mode passes contrast checker

---

## Phase 11 — Practice Sandbox

- [ ] Install Howler.js
- [ ] Build backing track player: loop list by key + genre, seamless looping
- [ ] Build metronome: BPM slider (40–220), tap tempo, visual pendulum + click sound
- [ ] Build loop editor: set start/end points on audio timeline, speed control (50–150%)
- [ ] Build recorder: `getUserMedia` → `MediaRecorder` → in-browser playback
- [ ] **Verify:** Backing track loops cleanly; metronome click aligns with visual; recording plays back

---

## Phase 12 — Backend & Persistence

- [ ] Set up Fastify server with Prisma client
- [ ] Implement auth routes (Supabase JWT validation middleware)
- [ ] Implement REST endpoints:
  - [ ] `POST /api/progress/xp` — add XP + update level
  - [ ] `POST /api/progress/lesson` — mark lesson complete
  - [ ] `POST /api/progress/song` — record song attempt
  - [ ] `GET /api/songs` — list songs with filters
  - [ ] `GET /api/lessons` — list lessons with user progress
  - [ ] `GET /api/achievements` — user's earned badges
- [ ] Implement `achievement.service.ts` — server-side badge condition evaluation
- [ ] Implement `streak.service.ts` — compute streak from `last_practice` timestamps
- [ ] Wire frontend stores to persist to API (debounced, 500ms)
- [ ] **Verify:** Progress persists across sessions; streak logic correct across days

---

## Phase 13 — MIDI Hardware Support

- [ ] Build `MIDIManager.ts` in `audio-engine`:
  - [ ] `navigator.requestMIDIAccess()` → list/select input ports
  - [ ] Map `noteon`/`noteoff` → `AudioEngine.playNote()`
  - [ ] Forward MIDI events to active Piano/Guitar component
  - [ ] In Play Mode: MIDI input drives timing engine instead of keyboard
- [ ] Settings page: MIDI device detection + port selection
- [ ] **Verify:** MIDI keyboard → notes highlight on Piano → scoring works in Play Mode

---

## Phase 14 — Microphone & Pitch Detection

- [ ] Install pitchfinder in `audio-engine`
- [ ] Build `PitchDetector.ts`:
  - [ ] `getUserMedia({audio: true})` → AnalyserNode
  - [ ] YIN algorithm on 50ms windows
  - [ ] Emit `{ note, frequency, confidence }` when confidence > 0.8
  - [ ] Debounce to avoid jitter
- [ ] Build singing exercise UI: show target note, confirm mic match
- [ ] Build Tune-Up mode in Practice: real-time pitch + cents deviation display
- [ ] **Verify:** Sing A4 → "A4" displayed within 200ms; cents deviation accurate

---

## Phase 15 — Deployment (Initial: dannygrande.com/music)

- [ ] Build frontend: `pnpm build` → output to `apps/web/dist`
- [ ] Set production env vars:
  - `VITE_BASE_PATH=/music`
  - `VITE_API_URL=https://dannygrande.com/music-api`
- [ ] Configure nginx on dannygrande.com server:
  ```nginx
  location /music {
    alias /var/www/melodypath/dist;
    try_files $uri $uri/ /music/index.html;
  }
  location /music-api/ {
    proxy_pass http://localhost:3001/;
    proxy_set_header Host $host;
  }
  ```
- [ ] Deploy Fastify server (PM2 or systemd on port 3001)
- [ ] Run `prisma migrate deploy` against production DB
- [ ] Add SSL cert for dannygrande.com (if not already present)
- [ ] Set Supabase Auth redirect URLs to include `https://dannygrande.com/music`
- [ ] Smoke test: visit `dannygrande.com/music` → onboarding → play a song → XP saves
- [ ] **Verify:** All routes work under `/music` prefix; no 404s on page refresh

---

## Phase 16 — Domain Migration (when ready)

- [ ] Register new domain (e.g. `melodypath.com`)
- [ ] Point DNS A record to same server IP
- [ ] Add new nginx server block:
  ```nginx
  server {
    server_name melodypath.com www.melodypath.com;
    location / {
      root /var/www/melodypath/dist;
      try_files $uri $uri/ /index.html;
    }
    location /api/ {
      proxy_pass http://localhost:3001/;
    }
  }
  ```
- [ ] Add 301 redirect from `dannygrande.com/music` → `https://melodypath.com`
- [ ] Get SSL cert for new domain (`certbot --nginx -d melodypath.com`)
- [ ] Update env vars and rebuild:
  - `VITE_BASE_PATH=/`
  - `VITE_API_URL=https://api.melodypath.com` (or `https://melodypath.com/api`)
- [ ] Run `pnpm build` and deploy new dist
- [ ] Update Supabase Auth redirect URLs to `https://melodypath.com`
- [ ] Update `CORS_ORIGINS` on server to include `melodypath.com`
- [ ] Update any OAuth app callback URLs
- [ ] **Verify:** `melodypath.com` loads app at root; old `/music` URL redirects correctly

---

## Content Seeding (ongoing)

- [ ] Source/create MIDI files for MVP song list:
  - Easy: "Smoke on the Water", "Seven Nation Army", "Ode to Joy"
  - Medium: "Sweet Home Chicago", "La Bamba"
  - Hard: "Autumn Leaves", "So What"
- [ ] Tag each song: BPM, key, difficulty (1–5), genre, concepts covered
- [ ] Upload to Supabase Storage
- [ ] Author 10 beginner lessons (JSON)
- [ ] Author 5 intermediate lessons (JSON)
