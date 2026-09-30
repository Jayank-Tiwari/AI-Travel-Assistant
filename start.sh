#!/bin/bash

echo "Starting AI-Travel-Assistant Deployment..."

# 1. Setup Python Backend
echo "Installing Python dependencies..."
# Ensure pip is installed
apt-get update && apt-get install -y python3-pip python3-venv

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# 2. Setup React Frontend
echo "Installing and building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 3. Stop any existing PM2 processes to avoid conflicts
echo "Cleaning up old PM2 processes..."
pm2 delete travel-api 2>/dev/null
pm2 delete travel-frontend 2>/dev/null

# 4. Start the Backend API (FastAPI) on port 8000
echo "Starting Backend API with PM2..."
pm2 start venv/bin/python --name "travel-api" -- api.py

# 5. Start the Frontend (React static files) on port 5173
echo "Starting Frontend with PM2..."
pm2 serve frontend/dist 5173 --name "travel-frontend" --spa

# Save PM2 process list so it restarts on server reboot
pm2 save

echo "======================================================="
echo "Deployment Complete!"
echo "Backend API is running on port 8000"
echo "Frontend is running on port 5173"
echo "Check logs using: pm2 logs"
echo "======================================================="
