# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FARMWAY is a Malaysian AgriTech marketplace connecting farmers and buyers. It's a monorepo with two projects:

- **farmway-backend/** — Express.js REST API with PostgreSQL (Sequelize ORM)
- **farmway-app/** — React Native mobile app built with Expo and Expo Router

## Common Commands

### Backend (run from `farmway-backend/`)
```bash
npm run dev          # Start dev server with nodemon (port 3000)
npm start            # Start production server
npm run db:setup     # Initialize database and seed data
npm run db:reset     # Drop and recreate the farmway database
npm run lint         # ESLint on src/
```

### Frontend (run from `farmway-app/`)
```bash
npx expo start       # Start Expo dev server
npm run android      # Start on Android emulator
npm run ios          # Start on iOS simulator
npm run web          # Start web version
```

### Full Stack
```powershell
.\start-local.ps1   # PowerShell script: checks PostgreSQL, sets up DB, starts backend + Expo
```

## Architecture

### Backend

**Entry:** `src/server.js` → `src/app.js` (Express app setup)

**Layers:**
- `src/routes/` — Route definitions (auth, products, orders, payments, messages, categories, admin)
- `src/controllers/` — Business logic per route
- `src/models/` — Sequelize models with associations defined in `models/index.js`
- `src/middleware/` — `auth.js` (JWT + role authorization), `errorHandler.js` (centralized errors with i18n)
- `src/config/` — `database.js`, `logger.js` (Winston), `i18n.js`, `s3.js`, `setup-db.js`

**Key patterns:**
- UUID primary keys on all models
- JSONB fields for multilingual content (product name/description store `{en, ms, zh, ta}`)
- Three user roles: `FARMER`, `BUYER`, `ADMIN` — role-based middleware via `authorize(...roles)`
- JWT token pair: 15-min access + 30-day refresh tokens
- Products use soft delete (`deleted_at` field)
- File uploads via multer — local storage mode serves from `/uploads/`, S3 mode available
- Rate limiting: 20 req/15min on `/api/auth`, 300 req/15min globally
- i18next on backend with 4 languages (en, ms, zh, ta)

**Models:** User, Product, ProductImage, Category (hierarchical via parent_id), Order, OrderItem, Payment, Commission, Message

**API routes:**
- `GET /health` — health check
- `/api/auth` — register, login, refresh, profile
- `/api/products` — CRUD, image upload, farmer storefront
- `/api/categories` — category tree
- `/api/orders` — order lifecycle (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED)
- `/api/payments` — payment processing (FPX, credit card, e-wallets, COD)
- `/api/messages` — buyer-farmer messaging
- `/api/admin` — admin operations

### Frontend

**Routing:** Expo Router file-based routing in `app/` directory with route groups:
- `(auth)/` — login, register
- `(buyer)/` — marketplace, orders, checkout, chat, profile (tab navigation)
- `(farmer)/` — dashboard
- `(admin)/` — dashboard
- `index.tsx` — routing middleware that redirects by user role

**State management:**
- `store/authStore.ts` — Zustand store for auth state, tokens persisted in SecureStore
- `@tanstack/react-query` — server state with 3-min staleTime

**API layer:** `utils/api.ts` — Axios instance with JWT interceptors, automatic token refresh with request queuing, 15s timeout (designed for rural connectivity)

**Design system:** `constants/theme.ts` — primary green (#1A6335), accent gold (#F5A623), spacing scale, border radii, MIN_TOUCH target 48pt

**i18n:** `i18n/index.ts` — same 4 languages as backend, `Accept-Language` header on all API requests

## Environment Setup

**Backend** requires a `.env` file (see `.env.example`):
- PostgreSQL connection (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- JWT secrets (JWT_SECRET, JWT_REFRESH_SECRET)
- Optional: AWS S3 config, OpenWeather API key, payment gateway config

**Frontend** uses `EXPO_PUBLIC_API_URL` env var (defaults to `http://localhost:3000/api`)

**Demo accounts:** admin@farmway.my/admin1234, farmer@farmway.my/farmer123, buyer@farmway.my/buyer123

## Tech Stack

- **Backend:** Node.js >=18, Express 4, Sequelize 6, PostgreSQL, Winston, i18next
- **Frontend:** React Native 0.74, Expo SDK 51, TypeScript, Expo Router, Zustand, React Query, Axios
- **Path aliases:** `@/*` maps to project root in frontend (tsconfig.json)
