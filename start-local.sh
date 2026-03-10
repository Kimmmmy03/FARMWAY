#!/bin/bash
# Farmway — Start Everything Locally (SQLite)
# Run from the FARMWAY directory: bash start-local.sh

set -e

echo ""
echo "🌾 FARMWAY LOCAL DEV STARTUP"
echo "================================"
echo ""

# ─── Backend Setup ────────────────────────────────────────
echo "🗄️  Setting up database (SQLite)..."
(cd farmway-backend && node src/config/setup-db.js)

# ─── Start Backend ────────────────────────────────────────
echo ""
echo "🚀 Starting Backend API (port 3000)..."
(cd farmway-backend && npm run dev) &
BACKEND_PID=$!
sleep 4

# ─── Test Backend Health ──────────────────────────────────
echo "🩺 Checking backend health..."
if curl -s --max-time 10 http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is UP."
else
    echo "⚠️  Backend not responding yet (may still be starting up)."
fi

# ─── Start Expo App ───────────────────────────────────────
echo ""
echo "📱 Starting Expo (React Native) app..."
echo "   → Scan the QR code with Expo Go on your phone"
echo "   → Or press 'a' for Android emulator, 'i' for iOS simulator"
echo ""
(cd farmway-app && npx expo start) &
EXPO_PID=$!

echo ""
echo "================================================================"
echo "🌾 FARMWAY is starting up!"
echo ""
echo "  Backend API  → http://localhost:3000"
echo "  Health check → http://localhost:3000/health"
echo "  Uploads      → http://localhost:3000/uploads/"
echo "  Database     → farmway-backend/data/farmway.sqlite"
echo ""
echo "  Demo Accounts:"
echo "    Admin:  admin@farmway.my  / admin1234"
echo "    Farmer: farmer@farmway.my / farmer123"
echo "    Buyer:  buyer@farmway.my  / buyer123"
echo "================================================================"
echo ""

# Wait for both processes — Ctrl+C kills everything
trap "kill $BACKEND_PID $EXPO_PID 2>/dev/null; exit" INT TERM
wait
