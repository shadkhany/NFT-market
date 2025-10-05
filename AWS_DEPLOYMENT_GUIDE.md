# Complete AWS Deployment Guide (Free Tier)
## Step-by-Step Guide for Beginners

---

## Part 1: AWS Account Setup

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com/free/
2. Click "Create a Free Account"
3. Enter your email and account name
4. Verify your email
5. Enter credit card (won't be charged for free tier)
6. Complete identity verification

### Step 2: Access AWS Console
1. Log in to https://console.aws.amazon.com/
2. Make sure region is set to **US East (N. Virginia)** in top-right corner

---

## Part 2: Launch EC2 Instance

### Step 1: Create EC2 Instance
1. In AWS Console, search for **EC2** in the search bar
2. Click **Launch Instance** (big orange button)

### Step 2: Configure Instance
Fill in these details:

**Name:** `nft-marketplace-server`

**Application and OS Images (AMI):**
- Select **Ubuntu Server 22.04 LTS** (Free tier eligible)

**Instance type:**
- Select **t3.small** (2 GB RAM - needed for building Next.js)
- **Note:** You can downgrade to **t3.micro** after deployment to stay fully within free tier
- If t3.small isn't available, select **t3.micro** and we'll add swap memory to handle the build

**Key pair (login):**
- Click **Create new key pair**
- Name: `nft-marketplace-key`
- Key pair type: **RSA**
- Private key file format: **pem** (Mac/Linux) or **ppk** (Windows)
- Click **Create key pair** - file will download
- **IMPORTANT:** Save this file safely! Move it to a secure location

**Network settings:**
- Click **Edit**
- Auto-assign public IP: **Enable**
- Firewall (security groups): **Create security group**
- Security group name: `nft-marketplace-sg`
- Description: `Security group for NFT Marketplace`

**Add security group rules:**
1. SSH (Port 22) - Already added
2. Click **Add security group rule**
   - Type: **HTTP**
   - Port: **80**
   - Source: **0.0.0.0/0**
3. Click **Add security group rule**
   - Type: **HTTPS**
   - Port: **443**
   - Source: **0.0.0.0/0**
4. Click **Add security group rule**
   - Type: **Custom TCP**
   - Port: **3000**
   - Source: **0.0.0.0/0**
5. Click **Add security group rule**
   - Type: **Custom TCP**
   - Port: **4000**
   - Source: **0.0.0.0/0**

**Configure storage:**
- Change from **8 GB** to **30 GB** (free tier allows up to 30 GB)
- Keep **gp3** as storage type

**Advanced details:**
- Leave as default

### Step 3: Launch Instance
1. Review all settings
2. Click **Launch instance**
3. Wait 2-3 minutes for instance to start
4. Click on the instance ID to view details

---

## Part 3: Connect to Your Server

### Step 1: Get Connection Info
1. Go to EC2 Dashboard → Instances
2. Select your instance
3. Copy the **Public IPv4 address** (e.g., 3.89.123.45)

### Step 2: Set Key Permissions (Mac/Linux)
```bash
# Open terminal
cd ~/Downloads  # or wherever you saved the key
chmod 400 nft-marketplace-key.pem
```

### Step 3: Connect via SSH
```bash
# Replace YOUR_IP with your actual instance IP
ssh -i nft-marketplace-key.pem ubuntu@YOUR_IP

# Example:
# ssh -i nft-marketplace-key.pem ubuntu@3.89.123.45

# Type "yes" when asked about fingerprint
```

**For Windows users:**
- Use **PuTTY** with the .ppk file
- Or use **Windows PowerShell** with the .pem file

---

## Part 4: Server Setup (Run these commands one by one)

### Step 1: Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v18.x.x
npm --version
```

### Step 3: Install Yarn
```bash
sudo npm install -g yarn
yarn --version
```

### Step 4: Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user (ignore "Permission denied" warning - it's harmless)
cd /tmp
sudo -u postgres psql << EOF
CREATE DATABASE nft_marketplace;
CREATE USER nftuser WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE nft_marketplace TO nftuser;
ALTER DATABASE nft_marketplace OWNER TO nftuser;
GRANT ALL ON SCHEMA public TO nftuser;
\q
EOF

# Verify database was created successfully
sudo -u postgres psql -c "\l" | grep nft_marketplace
```

**Note:** If you see "could not change directory" warning, that's normal - as long as you see `CREATE DATABASE` and `CREATE ROLE` messages, it worked!

### Step 5: Install Redis
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping  # Should return PONG
```

### Step 6: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup
# Copy and run the command it outputs
```

### Step 7: Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 8: Install Git
```bash
sudo apt install -y git
git --version
```

---

## Part 5: Upload Your Project

### Option A: Using Git (Recommended)
```bash
# If you have your code on GitHub
cd ~
git clone git:github.com:YOUR_USERNAME/YOUR_REPO.git nft-marketplace
cd nft-marketplace
```

### Option B: Upload from Local Machine
```bash
# On YOUR local machine (not the server)
# Open a new terminal window
cd /Users/shadkhany/Desktop/Git/NFT-market

# Create a tar file
tar -czf nft-marketplace.tar.gz --exclude='node_modules' --exclude='.next' --exclude='dist' .

# Upload to server (replace YOUR_IP)
scp -i ~/Downloads/nft-marketplace-key.pem nft-marketplace.tar.gz ubuntu@YOUR_IP:~/

# Back to server terminal
cd ~
mkdir nft-marketplace
tar -xzf nft-marketplace.tar.gz -C nft-marketplace
cd nft-marketplace
```

---

## Part 6: Backend Deployment

### Step 1: Setup Environment Variables

**First, generate a secure JWT secret:**
```bash
# Generate a secure random string (64 characters)
openssl rand -base64 48
```
Copy the output - you'll use it as your JWT_SECRET.

**Now create the .env file:**
```bash
cd ~/nft-marketplace/backend
nano .env
```

**Get your server's public IP:**
```bash
curl -s ifconfig.me
```
This will show your AWS server's public IP (e.g., 3.89.123.45). You'll need this for CORS_ORIGIN.

**Now paste this content into nano:**

Replace these values:
- `your_secure_password_here` → Database password from Step 4
- `PASTE_GENERATED_SECRET_HERE` → JWT secret you just generated
- `YOUR_IP` → Your server's public IP from the command above

Press Ctrl+X, then Y, then Enter to save.

```env
# Database
DATABASE_URL="postgresql://nftuser:your_secure_password_here@localhost:5432/nft_marketplace?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=PASTE_GENERATED_SECRET_HERE
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=production

# CORS (Replace YOUR_IP with your server's public IP)
CORS_ORIGIN=http://YOUR_IP:3000

# Blockchain (Use a testnet for free tier)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY

# Contracts (Deploy your contracts and add addresses here)
NFT721_CONTRACT_ADDRESS=
NFT1155_CONTRACT_ADDRESS=
MARKETPLACE_CONTRACT_ADDRESS=

# IPFS (Get free key from https://www.pinata.cloud/)
PINATA_API_KEY=
PINATA_SECRET_KEY=

# Optional
STRIPE_SECRET_KEY=
SENTRY_DSN=
```

### Step 2: Install Dependencies and Build
```bash
cd ~/nft-marketplace/backend
yarn install
yarn prisma:generate
yarn prisma:migrate
yarn build
```

### Step 3: Start Backend with PM2
```bash
pm2 start dist/main.js --name nft-backend
pm2 save
pm2 list  # Should show nft-backend running
```

### Step 4: Check Backend is Running
```bash
curl http://localhost:4000/api
# Should return something (not error)
```

---

## Part 7: Frontend Deployment

### Step 1: Setup Environment Variables
```bash
cd ~/nft-marketplace/frontend
nano .env.production
```

Paste this (replace YOUR_IP with your actual IP):
```env
NEXT_PUBLIC_API_URL=http://YOUR_IP:4000/api
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Step 2: Install Dependencies and Build
```bash
cd ~/nft-marketplace/frontend
yarn install
yarn build
```

This will take 5-10 minutes. If you get memory errors:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" yarn build
```

### Step 3: Start Frontend with PM2
```bash
pm2 start yarn --name nft-frontend -- start
pm2 save
pm2 list  # Should show both backend and frontend running
```

---

## Part 8: Configure Nginx Reverse Proxy

### Step 1: Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/nft-marketplace
```

Paste this content (replace YOUR_IP with your actual IP):
```nginx
server {
    listen 80;
    server_name YOUR_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 2: Enable Site and Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/nft-marketplace /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Part 9: Access Your Website

### Open Browser
Go to: **http://YOUR_IP** (replace with your actual IP)

You should see your NFT marketplace! 🎉

---

## Part 10: (Optional) Setup Domain Name

### If you have a domain:

1. **Add A Record in your domain DNS:**
   - Type: A
   - Name: @ (or www)
   - Value: YOUR_IP
   - TTL: 3600

2. **Update Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/nft-marketplace
# Change: server_name YOUR_IP;
# To: server_name yourdomain.com www.yourdomain.com;
sudo systemctl restart nginx
```

3. **Install SSL Certificate (Free with Let's Encrypt):**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow prompts, enter your email
```

---

## Part 11: Monitoring and Maintenance

### Check Application Status
```bash
pm2 status
pm2 logs nft-frontend
pm2 logs nft-backend
```

### Restart Applications
```bash
pm2 restart nft-frontend
pm2 restart nft-backend
pm2 restart all
```

### Update Application
```bash
cd ~/nft-marketplace

# Pull latest changes (if using Git)
git pull

# Backend
cd backend
yarn install
yarn build
pm2 restart nft-backend

# Frontend
cd ../frontend
yarn install
yarn build
pm2 restart nft-frontend
```

### Monitor Server Resources
```bash
htop  # Install with: sudo apt install htop
df -h  # Disk space
free -h  # Memory usage
```

---

## Part 12: Cost Optimization (Stay in Free Tier)

### After successful deployment, reduce instance size:
1. Stop instance in EC2 console
2. Actions → Instance Settings → Change instance type
3. Select **t2.micro** (free tier eligible)
4. Start instance again

**Note:** t2.micro has limited memory, so builds must be done on t2.medium, then you can downgrade.

---

## Troubleshooting

### Frontend not accessible:
```bash
pm2 logs nft-frontend
# Check for errors
```

### Backend not responding:
```bash
pm2 logs nft-backend
# Check database connection
sudo systemctl status postgresql
```

### Out of memory during build:
```bash
# Create swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Port already in use:
```bash
sudo lsof -i :3000
sudo lsof -i :4000
# Kill the process
sudo kill -9 PID
```

### Nginx errors:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Important Security Notes

1. **Change all default passwords** in .env files
2. **Never commit .env files** to Git
3. **Setup firewall:**
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

4. **Regular updates:**
```bash
sudo apt update && sudo apt upgrade -y
```

5. **Backup database regularly:**
```bash
pg_dump -U nftuser nft_marketplace > backup.sql
```

---

## AWS Free Tier Limits (12 months)

- ✅ 750 hours/month t2.micro instance (enough for 24/7)
- ✅ 30 GB storage
- ✅ 15 GB bandwidth out
- ⚠️ After free tier: ~$10-15/month for t2.micro

---

## Success Checklist

- [ ] EC2 instance running
- [ ] SSH access working
- [ ] PostgreSQL installed and configured
- [ ] Redis running
- [ ] Backend deployed (pm2 list shows running)
- [ ] Frontend deployed (pm2 list shows running)
- [ ] Nginx configured
- [ ] Website accessible at http://YOUR_IP
- [ ] API responding at http://YOUR_IP/api

---

## Next Steps After Deployment

1. Deploy smart contracts to testnet (Sepolia or Mumbai)
2. Update contract addresses in backend .env
3. Configure Pinata for IPFS uploads
4. Setup monitoring (PM2 web dashboard)
5. Configure backups
6. Add domain and SSL certificate
7. Setup CloudFlare for DDoS protection (free)

---

Need help? Check logs:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```
