#!/bin/bash

# NFT Marketplace - Nginx Configuration Script

set -e

echo "=========================================="
echo "Nginx Configuration"
echo "=========================================="
echo ""

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo "📍 Server IP detected: $SERVER_IP"
echo ""

# Create Nginx configuration
echo "📝 Creating Nginx configuration..."

sudo tee /etc/nginx/sites-available/nft-marketplace > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Increase max body size for NFT uploads
    client_max_body_size 50M;

    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

echo "✅ Nginx config created"

# Enable site
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/nft-marketplace /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "=========================================="
echo "✅ Nginx configured successfully!"
echo "=========================================="
echo ""
echo "Your marketplace is now accessible at:"
echo "http://$SERVER_IP"
echo ""
echo "To add SSL certificate (recommended):"
echo "sudo apt install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d yourdomain.com"
echo ""
