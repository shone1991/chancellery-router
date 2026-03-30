#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting backend..."
cd "$ROOT/chancellery-router-backend"
npm start &
BACKEND_PID=$!

echo "Starting frontend..."
cd "$ROOT/chancellery-router-frontend"
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID  |  Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
