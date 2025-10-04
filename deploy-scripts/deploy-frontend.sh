#!/bin/bash

# NFT Marketplace - Frontend Deployment Script

set -e

echo "=========================================="
echo "Frontend Deployment"
echo "=========================================="
echo ""

# Check if .env.production exists
if [ ! -f "../frontend/.env.production" ]; then
    echo "❌ Error: frontend/.env.production file not found!"
    echo ""
    echo "Please create frontend/.env.production"
    echo "Example:"
    echo "NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4000/api"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd ../frontend
yarn install

echo "🔨 Building frontend (this may take 5-10 minutes)..."
NODE_OPTIONS="--max-old-space-size=4096" yarn build

# Stop existing process if running
echo "🛑 Stopping existing frontend process..."
pm2 delete nft-frontend 2>/dev/null || true

echo "🚀 Starting frontend with PM2..."
pm2 start yarn --name nft-frontend -- start

# Save PM2 configuration
pm2 save

echo "✅ Frontend deployed successfully!"
echo ""

# Show status
pm2 status

echo ""
echo "Frontend is running at: http://localhost:3000"
echo ""
echo "To view logs: pm2 logs nft-frontend"
echo "To restart: pm2 restart nft-frontend"
echo ""
