# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
Contains a complete **Quranic Linguistic Explorer** mobile app (Expo/React Native) + backend API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo SDK 54, React Native 0.81.5, expo-router, @tanstack/react-query

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Quranic Linguistic Explorer — Mobile App

### Artifacts
- `artifacts/quran-app` — Expo mobile app (`@workspace/quran-app`)
- `artifacts/api-server` — Express API server (`@workspace/api-server`)

### Mobile App Features
- **114 Surah browsing** — full list with search and filter
- **Surah reading** — word-by-word tappable Arabic text with translation
- **Word Dictionary** — tap any Arabic word → bottom sheet with root, wazn, type, English/Arabic meanings (classical dictionary + quran.com fallback)
- **Analysis Hub** — 4-tab modal per verse: Words | Grammar (إعراب) | Morphology (صرف) | Tafseer (تفسير)
- **Tafseer** — 3 editions: Maududi (EN), Ibn Kathir (EN), Maariful Quran (UR)
- **Grammar (إعراب)** — fetched from tafsir.app (3 classical sources)
- **Morphology (صرف)** — AI-powered via Groq (requires GROQ_API_KEY)
- **Search** — 4 tabs: Keyword | Root | Themes | Tasreef (verb conjugation)
- **Tasreef** — full verb conjugation tables via Groq AI (requires GROQ_API_KEY)
- **Audio recitation** — play/pause/next/prev per ayah
- **Bookmarks & Notes** — saved with AsyncStorage
- **Multilingual** — English + Urdu (RTL supported)
- **Dark/Light mode** — via settings

### API Server Routes (`artifacts/api-server`)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/grammar` | GET | إعراب from tafsir.app — no API key needed |
| `/api/word-lookup` | POST | Classical dictionary + corpus.quran.com fallback |
| `/api/tafseer/:surah/:edition` | GET | Proxy to quran.com (editions: en.kathir, ur.maarifulquran) |
| `/api/tasreef` | POST | Verb conjugation via Groq AI — requires GROQ_API_KEY |
| `/api/analysis/stream` | POST | Morphology/word analysis via Groq SSE — requires GROQ_API_KEY |

### Environment Variables Needed
- `GROQ_API_KEY` — required for Morphology and Tasreef AI features
- `GROQ_API_KEY_2`, `GROQ_API_KEY_3` — optional additional keys for rotation
- `EXPO_PUBLIC_DOMAIN` — set to `REPLIT_DEV_DOMAIN` for the mobile app to reach the API

### Key Files
- `artifacts/quran-app/services/apiService.ts` — all API calls from mobile
- `artifacts/quran-app/components/AnalysisHub.tsx` — 4-tab analysis modal
- `artifacts/quran-app/components/DictionarySheet.tsx` — word-tap dictionary popup
- `artifacts/quran-app/app/surah/[id].tsx` — surah reading screen (tappable words + Analyse button)
- `artifacts/quran-app/app/(tabs)/search.tsx` — search with Tasreef tab
- `artifacts/api-server/src/routes/` — all API route handlers
