#!/bin/bash

# NFT Marketplace - Database Setup Script

set -e

echo "=========================================="
echo "Database Setup"
echo "=========================================="
echo ""

# Prompt for database password
read -sp "Enter password for database user 'nftuser': " DB_PASSWORD
echo ""
read -sp "Confirm password: " DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords do not match!"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Password cannot be empty!"
    exit 1
fi

echo "📦 Creating database and user..."

# Create database and user
sudo -u postgres psql << EOF
-- Drop existing if needed
DROP DATABASE IF EXISTS nft_marketplace;
DROP USER IF EXISTS nftuser;

-- Create new
CREATE DATABASE nft_marketplace;
CREATE USER nftuser WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE nft_marketplace TO nftuser;
ALTER DATABASE nft_marketplace OWNER TO nftuser;

-- Grant schema privileges
\c nft_marketplace
GRANT ALL ON SCHEMA public TO nftuser;

\q
EOF

echo "✅ Database 'nft_marketplace' created"
echo "✅ User 'nftuser' created with provided password"
echo ""

# Save connection string for reference (without exposing password)
echo "📝 Your DATABASE_URL (add this to backend/.env):"
echo "DATABASE_URL=\"postgresql://nftuser:YOUR_PASSWORD@localhost:5432/nft_marketplace?schema=public\""
echo ""
echo "⚠️  Replace YOUR_PASSWORD with the password you just set"
echo ""

# Test connection
echo "Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -U nftuser -d nft_marketplace -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Database setup completed!"
echo "=========================================="
