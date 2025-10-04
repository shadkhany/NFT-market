#!/bin/bash

# NFT Marketplace - Backend Deployment Script

set -e

echo "=========================================="
echo "Backend Deployment"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f "../backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo ""
    echo "Please create backend/.env with required configuration."
    echo "You can copy from backend/.env.example"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd ../backend
yarn install

echo "🔨 Generating Prisma client..."
yarn prisma:generate

echo "📊 Running database migrations..."
yarn prisma:migrate

echo "🔨 Building backend..."
yarn build

# Stop existing process if running
echo "🛑 Stopping existing backend process..."
pm2 delete nft-backend 2>/dev/null || true

echo "🚀 Starting backend with PM2..."
pm2 start dist/main.js --name nft-backend

# Save PM2 configuration
pm2 save

echo "✅ Backend deployed successfully!"
echo ""

# Show status
pm2 status

echo ""
echo "Backend is running at: http://localhost:4000"
echo "API endpoint: http://localhost:4000/api"
echo ""
echo "To view logs: pm2 logs nft-backend"
echo "To restart: pm2 restart nft-backend"
echo ""
