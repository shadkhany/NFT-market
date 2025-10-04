#!/bin/bash

# NFT Marketplace - Server Setup Script for AWS Ubuntu 22.04
# Run this script on your fresh AWS EC2 instance

set -e

echo "=========================================="
echo "NFT Marketplace - Server Setup"
echo "=========================================="
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install Yarn
echo "📦 Installing Yarn..."
sudo npm install -g yarn
echo "✅ Yarn version: $(yarn --version)"

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo "✅ PostgreSQL installed and started"

# Install Redis
echo "📦 Installing Redis..."
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
echo "✅ Redis installed and started"

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2
echo "✅ PM2 installed"

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
echo "✅ Nginx installed and started"

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git
echo "✅ Git version: $(git --version)"

# Install build essentials
echo "📦 Installing build essentials..."
sudo apt install -y build-essential

# Create swap file for build process
echo "💾 Creating swap file (helps with memory during builds)..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap file created"
else
    echo "✅ Swap file already exists"
fi

# Setup firewall
echo "🔒 Setting up firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable
echo "✅ Firewall configured"

echo ""
echo "=========================================="
echo "✅ Server setup completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run: ./database-setup.sh"
echo "2. Upload your project files"
echo "3. Run: ./deploy-backend.sh"
echo "4. Run: ./deploy-frontend.sh"
echo ""
