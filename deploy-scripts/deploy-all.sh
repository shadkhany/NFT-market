#!/bin/bash

# NFT Marketplace - Complete Deployment Script
# Run this on a fresh AWS EC2 Ubuntu instance

set -e

echo "=========================================="
echo "NFT Marketplace - Complete Deployment"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Setup server environment"
echo "2. Configure database"
echo "3. Deploy backend"
echo "4. Deploy frontend"
echo "5. Configure Nginx"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Make all scripts executable
chmod +x *.sh

# Step 1: Server setup
echo ""
echo "📦 Step 1/5: Setting up server environment..."
./server-setup.sh

# Step 2: Database setup
echo ""
echo "📊 Step 2/5: Configuring database..."
./database-setup.sh

# Step 3: Deploy backend
echo ""
echo "⚙️ Step 3/5: Deploying backend..."
./deploy-backend.sh

# Step 4: Deploy frontend
echo ""
echo "🎨 Step 4/5: Deploying frontend..."
./deploy-frontend.sh

# Step 5: Configure Nginx
echo ""
echo "🌐 Step 5/5: Configuring Nginx..."
./configure-nginx.sh

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "Your NFT Marketplace is now live!"
echo ""

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo "🌐 Access your marketplace at: http://$SERVER_IP"
echo ""
echo "📊 Check application status: pm2 status"
echo "📝 View logs: pm2 logs"
echo "🔄 Restart services: pm2 restart all"
echo ""
echo "⚠️  Important next steps:"
echo "1. Update backend/.env with your RPC URLs and API keys"
echo "2. Deploy your smart contracts to testnet"
echo "3. Update contract addresses in backend/.env"
echo "4. Setup domain name and SSL certificate (optional)"
echo ""
