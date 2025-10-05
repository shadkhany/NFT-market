# 🔑 Environment Variables Setup Guide

A complete, beginner-friendly guide to setting up your `.env` file for the NFT Marketplace backend.

---

## Quick Start

**On your AWS server:**
```bash
cd ~/NFT-market/backend
cp .env.example .env
nano .env
```

Now fill in each variable following the sections below. Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## 📋 Required Variables (Must Fill)

### 1. DATABASE_URL
**What it is:** Connection string to your PostgreSQL database

**How to get it:**
```bash
# You already set this up in Part 4 of the AWS guide
# Format: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME

# Example:
DATABASE_URL="postgresql://nftuser:MySecurePass123@localhost:5432/nft_marketplace?schema=public"
```

**Your values:**
- Username: `nftuser` (or what you created)
- Password: The password you set when creating the database user
- Host: `localhost` (database is on same server)
- Port: `5432` (default PostgreSQL port)
- Database: `nft_marketplace`

---

### 2. REDIS (Cache & Sessions)

**What it is:** In-memory cache for fast data access

**How to fill:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Note:** Leave `REDIS_PASSWORD` empty if you didn't set a Redis password (default setup).

---

### 3. JWT_SECRET ⚠️ IMPORTANT

**What it is:** Secret key used to sign authentication tokens

**How to generate:**
```bash
# On your AWS server, run:
openssl rand -base64 48
```

**Copy the output and paste it:**
```env
JWT_SECRET=xK8pN2mQ9vL4hR7jF3wE6tY1uI5oP0aS8dG2fH9kJ4nM7bV3cX6z
JWT_EXPIRES_IN=7d
```

**⚠️ CRITICAL:** This must be:
- Long and random (at least 32 characters)
- Kept secret - never commit to Git
- Unique to your project

---

### 4. REFRESH_TOKEN_SECRET

**What it is:** Secret key for refresh tokens (allows users to stay logged in)

**How to generate:**
```bash
# Generate another random string:
openssl rand -base64 48
```

**Paste it:**
```env
REFRESH_TOKEN_SECRET=aB3dF6gH9jK2mN5pQ8rS1tU4vW7xY0zA9bC8dE7fG6hI5jK4l
REFRESH_TOKEN_EXPIRES_IN=30d
```

---

## 🌐 Optional Variables (For Advanced Features)

### 5. Blockchain RPC URLs

**What it is:** Endpoints to connect to Ethereum/Polygon networks

**When you need it:** Only if you want to enable blockchain features (minting, trading NFTs)

**How to get it:**
1. Go to [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/)
2. Create a free account
3. Create a new app
4. Copy the API key

**Fill in:**
```env
# Use Sepolia testnet for free testing
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# For production (costs real money):
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**⚠️ For demo/testing:** Leave these empty or use public endpoints

---

### 6. Contract Addresses

**What it is:** Addresses of your deployed smart contracts

**When you need it:** Only after deploying smart contracts to blockchain

**Fill in:**
```env
NFT_721_ADDRESS=0x...
NFT_1155_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...
CHAIN_ID=1
```

**⚠️ For demo:** Leave empty - blockchain features will be disabled

---

#### How to Get Contract Addresses (Advanced)

**Prerequisites:**
- Smart contracts deployed to a blockchain (Ethereum, Polygon, etc.)
- Deployer wallet with the deployment transaction

**Method 1: From Deployment Output**

When you deploy contracts using Hardhat or Foundry, the deployment script outputs contract addresses:

```bash
# Example Hardhat deployment
npx hardhat run scripts/deploy.js --network sepolia

# Output will show:
# NFT721 deployed to: 0x1234567890123456789012345678901234567890
# NFT1155 deployed to: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
# Marketplace deployed to: 0x9876543210987654321098765432109876543210
```

**Copy these addresses** and paste them into your `.env` file.

**Method 2: From Block Explorer**

1. Go to the block explorer for your network:
   - Ethereum Mainnet: [etherscan.io](https://etherscan.io/)
   - Sepolia Testnet: [sepolia.etherscan.io](https://sepolia.etherscan.io/)
   - Polygon: [polygonscan.com](https://polygonscan.com/)

2. Search for your deployer wallet address

3. Look in the **"Transactions"** tab for contract creation transactions
   - They will show as "Contract Creation"
   - Click on the transaction

4. The contract address will be shown in the transaction details

5. Copy the contract address (starts with `0x`)

**Method 3: From Hardhat Artifacts**

If you deployed using Hardhat:

```bash
# View deployed contract addresses
cat deployments/sepolia/NFT721.json | grep address
cat deployments/sepolia/NFT1155.json | grep address
cat deployments/sepolia/Marketplace.json | grep address
```

**Method 4: From Remix IDE**

If you deployed using Remix:

1. Open Remix IDE
2. Go to the "Deploy & Run Transactions" tab
3. Look under "Deployed Contracts" section
4. Each deployed contract shows its address
5. Click the copy icon next to the address

**Example Complete Configuration:**

```env
# Sepolia Testnet (Chain ID: 11155111)
NFT_721_ADDRESS=0x1234567890123456789012345678901234567890
NFT_1155_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
MARKETPLACE_ADDRESS=0x9876543210987654321098765432109876543210
CHAIN_ID=11155111

# Ethereum Mainnet (Chain ID: 1)
# NFT_721_ADDRESS=0x...
# NFT_1155_ADDRESS=0x...
# MARKETPLACE_ADDRESS=0x...
# CHAIN_ID=1
```

**Chain IDs Reference:**
- Ethereum Mainnet: `1`
- Sepolia Testnet: `11155111`
- Polygon Mainnet: `137`
- Mumbai Testnet: `80001`
- BSC Mainnet: `56`

**⚠️ Important Notes:**
- Make sure all contracts are deployed to the **same network**
- Use the same `CHAIN_ID` as the network you deployed to
- Test contracts on testnets first (Sepolia, Mumbai) before mainnet
- Keep your contract addresses safe - you'll need them for frontend integration

---

### 7. IPFS / Pinata (Image Storage)

**What it is:** Decentralized storage for NFT images and metadata

**How to get it:**
1. Go to [Pinata.cloud](https://www.pinata.cloud/)
2. Sign up for a free account (1GB free)
3. Go to **API Keys** → **New Key**
4. Give it a name: "NFT Marketplace"
5. Enable permissions: `pinFileToIPFS`, `pinJSONToIPFS`
6. Copy the **API Key** and **API Secret**

**Fill in:**
```env
PINATA_API_KEY=abc123def456
PINATA_SECRET_KEY=xyz789uvw012
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

**⚠️ For demo:** Leave empty - file uploads will return mock responses

---

### 8. Stripe (Payments)

**What it is:** Payment processor for credit card payments

**When you need it:** Only if you want to accept credit card payments

**How to get it:**
1. Go to [Stripe.com](https://stripe.com/)
2. Create an account
3. Go to **Developers** → **API Keys**
4. Copy the **Secret key** (starts with `sk_test_`)

**Fill in:**
```env
STRIPE_SECRET_KEY=sk_test_abc123def456
STRIPE_WEBHOOK_SECRET=whsec_xyz789
```

**⚠️ For demo:** Leave empty

---

## 📝 Complete Example for Basic Setup

Here's a complete `.env` file for a **working demo without blockchain**:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://nftuser:MyPassword123@localhost:5432/nft_marketplace?schema=public"

# Redis (REQUIRED)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (REQUIRED - generate with: openssl rand -base64 48)
JWT_SECRET=xK8pN2mQ9vL4hR7jF3wE6tY1uI5oP0aS8dG2fH9kJ4nM7bV3cX6z
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=aB3dF6gH9jK2mN5pQ8rS1tU4vW7xY0zA9bC8dE7fG6hI5jK4l
REFRESH_TOKEN_EXPIRES_IN=30d

# Blockchain RPC (OPTIONAL - leave empty for demo)
MAINNET_RPC_URL=
SEPOLIA_RPC_URL=
POLYGON_RPC_URL=

# Contract Addresses (OPTIONAL - leave empty for demo)
NFT_721_ADDRESS=
NFT_1155_ADDRESS=
MARKETPLACE_ADDRESS=
CHAIN_ID=1

# IPFS / Pinata (OPTIONAL - get free key from pinata.cloud)
PINATA_API_KEY=
PINATA_SECRET_KEY=
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Arweave (OPTIONAL)
ARWEAVE_WALLET_PATH=./arweave-wallet.json

# Payment Processors (OPTIONAL)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MOONPAY_API_KEY=
```

---

## ✅ Testing Your Configuration

After filling in your `.env` file:

```bash
# 1. Test database connection
cd ~/NFT-market/backend
yarn prisma:generate
yarn prisma:migrate

# 2. If successful, start the backend
pm2 restart nft-backend

# 3. Check logs for errors
pm2 logs nft-backend --lines 30

# 4. Test the API
curl http://localhost:4000/api
# Should return: {"message":"Cannot GET /api","error":"Not Found","statusCode":404}
# This 404 is good - it means the server is running!
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use long, random secrets (at least 32 characters)
- Use different secrets for JWT and REFRESH_TOKEN
- Keep your `.env` file private
- Use test API keys during development
- Generate new secrets for production

### ❌ DON'T:
- Commit `.env` to Git (it's in `.gitignore`)
- Share your `.env` file
- Use simple passwords like "password123"
- Use the same secrets across multiple projects
- Use production API keys in development

---

## 🆘 Troubleshooting

### "Database connection failed"
- Check your `DATABASE_URL` format
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql postgresql://nftuser:PASSWORD@localhost/nft_marketplace`

### "JWT secret missing"
- Make sure `JWT_SECRET` is filled in
- Must be at least 32 characters
- No quotes needed around the value

### "Cannot connect to Redis"
- Check Redis is running: `sudo systemctl status redis`
- Verify port 6379 is correct
- If you set a Redis password, add it to `REDIS_PASSWORD`

### "Backend won't start"
- Check PM2 logs: `pm2 logs nft-backend`
- Verify all REQUIRED variables are filled
- Make sure no extra spaces or quotes

---

## 📚 Additional Resources

- **PostgreSQL Setup:** See AWS_DEPLOYMENT_GUIDE.md Part 4
- **Redis Setup:** See AWS_DEPLOYMENT_GUIDE.md Part 4
- **Alchemy/Infura:** [docs.alchemy.com](https://docs.alchemy.com/)
- **Pinata IPFS:** [docs.pinata.cloud](https://docs.pinata.cloud/)
- **Stripe:** [stripe.com/docs](https://stripe.com/docs)

---

## 🎯 Quick Checklist

Before deploying, make sure you have:

- [ ] `DATABASE_URL` filled with correct credentials
- [ ] `REDIS_HOST` and `REDIS_PORT` set
- [ ] `JWT_SECRET` generated (48+ characters)
- [ ] `REFRESH_TOKEN_SECRET` generated (48+ characters)
- [ ] All optional variables either filled or left empty
- [ ] File saved as `.env` (not `.env.example`)
- [ ] Backend tested with `pm2 logs nft-backend`

---

**Need help?** Check the [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for full deployment instructions.
