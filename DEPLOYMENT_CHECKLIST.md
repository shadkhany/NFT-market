# AWS Deployment Checklist

Complete checklist for deploying your NFT Marketplace to AWS EC2.

## ✅ Pre-Deployment (Local Machine)

### 1. Project Files Ready
- [x] Unnecessary files removed (test files, hardhat configs, etc.)
- [x] Deployment scripts created in `deploy-scripts/`
- [x] Documentation updated for AWS focus
- [x] `.gitignore` and `.awsignore` configured

### 2. Environment Configuration
- [ ] Backend: Copy `backend/.env.example` to `backend/.env`
- [ ] Backend: Fill in database password
- [ ] Backend: Fill in JWT secret (use strong random string)
- [ ] Frontend: Copy `frontend/.env.production.example` to `frontend/.env.production`
- [ ] Frontend: Update `NEXT_PUBLIC_API_URL` with your server IP

### 3. Create Archive for Upload
```bash
cd /Users/shadkhany/Desktop/Git/NFT-market
tar -czf nft-marketplace.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  .
```

## ✅ AWS Account Setup

### 1. Create AWS Account
- [ ] Sign up at https://aws.amazon.com/free/
- [ ] Verify email
- [ ] Add payment method (won't be charged for free tier)
- [ ] Complete identity verification

### 2. Launch EC2 Instance
- [ ] Go to EC2 Dashboard
- [ ] Click "Launch Instance"
- [ ] Name: `nft-marketplace-server`
- [ ] AMI: Ubuntu Server 22.04 LTS
- [ ] Instance type: `t3.micro` (free tier)
- [ ] Create key pair: `nft-marketplace-key.pem`
- [ ] Download and save key pair securely

### 3. Configure Security Group
Add these inbound rules:
- [ ] SSH (port 22) - Your IP
- [ ] HTTP (port 80) - Anywhere
- [ ] HTTPS (port 443) - Anywhere
- [ ] Custom TCP (port 3000) - Anywhere
- [ ] Custom TCP (port 4000) - Anywhere

### 4. Storage
- [ ] Set to 30 GB (free tier max)

## ✅ Initial Server Connection

### 1. Set Key Permissions
```bash
chmod 400 ~/Downloads/nft-marketplace-key.pem
```

### 2. Connect via SSH
```bash
ssh -i ~/Downloads/nft-marketplace-key.pem ubuntu@YOUR_SERVER_IP
```

## ✅ Upload Project Files

### Option A: Direct Upload
```bash
# From local machine
scp -i ~/Downloads/nft-marketplace-key.pem \
  nft-marketplace.tar.gz \
  ubuntu@YOUR_SERVER_IP:~/

# On server
mkdir nft-marketplace
tar -xzf nft-marketplace.tar.gz -C nft-marketplace
```

### Option B: GitHub (Recommended)
```bash
# On server
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git nft-marketplace
cd nft-marketplace
```

## ✅ Environment Setup on Server

### 1. Create Backend .env
```bash
cd ~/nft-marketplace/backend
nano .env
```

Paste and edit:
```env
DATABASE_URL="postgresql://nftuser:YOUR_PASSWORD@localhost:5432/nft_marketplace?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=production
CORS_ORIGIN=http://YOUR_SERVER_IP:3000
```

### 2. Create Frontend .env.production
```bash
cd ~/nft-marketplace/frontend
nano .env.production
```

Paste and edit:
```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4000/api
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## ✅ Run Deployment Scripts

### Quick Deploy (All-in-One)
```bash
cd ~/nft-marketplace/deploy-scripts
chmod +x *.sh
./deploy-all.sh
```

### Manual Deploy (Step-by-Step)
```bash
cd ~/nft-marketplace/deploy-scripts
chmod +x *.sh

# Step 1: Server setup (15-20 mins)
./server-setup.sh

# Step 2: Database setup (2 mins)
./database-setup.sh
# Remember the password you set!

# Step 3: Backend deployment (5 mins)
./deploy-backend.sh

# Step 4: Frontend deployment (10-15 mins)
./deploy-frontend.sh

# Step 5: Nginx configuration (1 min)
./configure-nginx.sh
```

## ✅ Post-Deployment Verification

### 1. Check Services Running
```bash
pm2 status
```
Should show:
- ✅ nft-backend: online
- ✅ nft-frontend: online

### 2. Check Logs
```bash
pm2 logs nft-backend --lines 20
pm2 logs nft-frontend --lines 20
```
No errors should appear.

### 3. Test Backend API
```bash
curl http://localhost:4000/api
```
Should return JSON (not error page).

### 4. Test Frontend
```bash
curl http://localhost:3000
```
Should return HTML.

### 5. Test Nginx
```bash
sudo systemctl status nginx
```
Should show "active (running)".

### 6. Access Website
Open browser: `http://YOUR_SERVER_IP`
- [ ] Homepage loads
- [ ] Navbar visible
- [ ] No console errors
- [ ] Can navigate to /explore, /create pages

## ✅ Optional: Domain & SSL

### 1. Point Domain to Server
In your domain DNS settings:
- Type: A Record
- Name: @ (or www)
- Value: YOUR_SERVER_IP
- TTL: 3600

### 2. Install SSL Certificate
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Update Environment
Update `CORS_ORIGIN` in backend/.env:
```env
CORS_ORIGIN=https://yourdomain.com
```

Rebuild and restart:
```bash
cd ~/nft-marketplace/backend
yarn build
pm2 restart nft-backend
```

## ✅ Monitoring & Maintenance

### Daily Checks
- [ ] `pm2 status` - All services online?
- [ ] `df -h` - Disk space OK? (<80%)
- [ ] `free -h` - Memory OK?

### Weekly Tasks
- [ ] Review logs: `pm2 logs --lines 100`
- [ ] Check for updates: `sudo apt update`

### Monthly Tasks
- [ ] Backup database
- [ ] Update dependencies
- [ ] Review security

## 🔒 Security Checklist

- [ ] Changed all default passwords
- [ ] JWT secret is strong and unique
- [ ] Firewall enabled (UFW)
- [ ] SSH key-based auth only
- [ ] Regular system updates scheduled
- [ ] SSL certificate installed (if using domain)
- [ ] Database backups configured

## 🆘 Troubleshooting

### Frontend not loading
```bash
pm2 logs nft-frontend
pm2 restart nft-frontend
```

### Backend errors
```bash
pm2 logs nft-backend
cd ~/nft-marketplace/backend
yarn prisma:migrate
pm2 restart nft-backend
```

### Database connection failed
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"
```

### Out of memory
```bash
free -h
pm2 restart all
```

### Nginx errors
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

## 📊 Cost Tracking

### Free Tier (12 months)
- t3.micro: 750 hours/month ✅
- 30 GB storage ✅
- 15 GB data transfer ✅

### After Free Tier
Estimated: $10-15/month
- EC2 t3.micro: ~$8/month
- Storage: ~$2/month
- Data transfer: ~$1-5/month

### Cost Optimization
- [ ] Stop instance when not needed
- [ ] Clean old logs: `pm2 flush`
- [ ] Monitor bandwidth usage
- [ ] Use CloudFlare (free CDN)

## 📚 Resources

- AWS Console: https://console.aws.amazon.com/
- Full Guide: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- Scripts Docs: [deploy-scripts/README.md](./deploy-scripts/README.md)
- Main README: [README.md](./README.md)

---

**Status Legend:**
- [ ] Not started
- [x] Completed
- ✅ Verified working
