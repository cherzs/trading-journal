#!/bin/bash

# Development script to run both backend and frontend

echo "🚀 Starting Trading Journal Development Environment"
echo "=================================================="

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Backend
echo "📡 Starting Flask Backend..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo "🎨 Starting React Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Development servers started!"
echo "📡 Backend API: http://localhost:5000"
echo "🎨 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait 