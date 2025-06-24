#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting Codehub Dashboard Setup..."

# --- Frontend Setup ---
echo "\n⚙️  Setting up frontend (React)...
"
cd frontend

echo "Installing frontend dependencies..."
npm install

echo "Building frontend application..."
npm run build

# Return to project root
cd ..

# --- Scheduler Backend Setup ---
echo "\n⚙️  Setting up scheduler backend (Node.js)...
"
cd scheduler-backend

echo "Installing scheduler backend dependencies..."
npm install

# --- Final Step: Start the Scheduler Backend which serves the frontend ---
# The Node.js server (server.js) will be configured to serve the built React app
# from ../frontend/dist and expose the scheduler API, all on port 9000.
echo "\n🚀 Starting Codehub Scheduler Backend and serving frontend on port 9000..."

# Ensure the server starts and keeps running. Output will be visible.
npm start
