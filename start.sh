#!/bin/bash

echo "Starting backend server..."
cd server && node index.js &
BACKEND_PID=$!

echo "Starting frontend dev server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

echo ""
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3001"
echo ""

wait
