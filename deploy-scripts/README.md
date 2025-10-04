# AWS Deployment Scripts

Automated scripts for deploying the NFT Marketplace to AWS EC2.

## 📋 Scripts Overview

| Script | Description |
|--------|-------------|
| `server-setup.sh` | Installs Node.js, PostgreSQL, Redis, PM2, Nginx |
| `database-setup.sh` | Creates database and user |
| `deploy-backend.sh` | Builds and starts backend API |
| `deploy-frontend.sh` | Builds and starts frontend app |
| `configure-nginx.sh` | Configures Nginx reverse proxy |
| `deploy-all.sh` | Runs all scripts in order (recommended) |

## 🚀 Quick Start

### Option 1: Run All at Once (Recommended)
```bash
cd deploy-scripts
chmod +x *.sh
./deploy-all.sh
```

### Option 2: Run Step by Step
```bash
cd deploy-scripts
chmod +x *.sh

# Step 1: Setup server
./server-setup.sh

# Step 2: Create database
./database-setup.sh

# Step 3: Deploy backend
./deploy-backend.sh

# Step 4: Deploy frontend
./deploy-frontend.sh

# Step 5: Configure Nginx
./configure-nginx.sh
```

## ⚠️ Prerequisites

Before running these scripts:

1. **AWS EC2 instance** running Ubuntu 22.04
2. **SSH access** to the server
3. **Project files** uploaded to `~/nft-marketplace/`
4. **Environment files** created:
   - `backend/.env`
   - `frontend/.env.production`

## 📝 Environment Setup

### Backend .env
Create `backend/.env`:
```env
DATABASE_URL="postgresql://nftuser:your_password@localhost:5432/nft_marketplace?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=production
CORS_ORIGIN=http://YOUR_SERVER_IP:3000
```

### Frontend .env.production
Create `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4000/api
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## 🔄 What Each Script Does

### server-setup.sh
- Updates system packages
- Installs Node.js 18
- Installs Yarn
- Installs PostgreSQL
- Installs Redis
- Installs PM2
- Installs Nginx
- Creates 2GB swap file
- Configures firewall

### database-setup.sh
- Creates `nft_marketplace` database
- Creates `nftuser` with encrypted password
- Grants all privileges
- Tests connection

### deploy-backend.sh
- Installs backend dependencies
- Generates Prisma client
- Runs database migrations
- Builds backend
- Starts with PM2
- Saves PM2 configuration

### deploy-frontend.sh
- Installs frontend dependencies
- Builds Next.js app (with memory optimization)
- Starts with PM2
- Saves PM2 configuration

### configure-nginx.sh
- Detects server IP
- Creates Nginx configuration
- Enables reverse proxy for frontend (port 3000)
- Enables reverse proxy for backend API (port 4000)
- Adds security headers
- Tests and restarts Nginx

## 📊 Post-Deployment

### Check Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs nft-backend
pm2 logs nft-frontend
pm2 logs --lines 100
```

### Restart Services
```bash
pm2 restart nft-backend
pm2 restart nft-frontend
pm2 restart all
```

### Stop Services
```bash
pm2 stop all
```

### Monitor Resources
```bash
htop
pm2 monit
```

## 🔧 Troubleshooting

### Script fails with permission denied
```bash
chmod +x *.sh
```

### Database connection fails
Check password in `backend/.env` matches what you set in `database-setup.sh`

### Frontend build fails with memory error
The script includes memory optimization. If still failing:
```bash
cd ~/nft-marketplace/frontend
NODE_OPTIONS="--max-old-space-size=4096" yarn build
```

### PM2 doesn't restart after reboot
```bash
pm2 startup
# Run the command it outputs
pm2 save
```

### Nginx configuration error
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Port already in use
```bash
sudo lsof -i :3000
sudo lsof -i :4000
# Kill process: sudo kill -9 PID
```

## 🔄 Update Application

After making code changes:
```bash
cd ~/nft-marketplace

# Pull changes (if using Git)
git pull

# Update backend
cd backend
yarn install
yarn build
pm2 restart nft-backend

# Update frontend
cd ../frontend
yarn install
yarn build
pm2 restart nft-frontend
```

## 🔒 Security Recommendations

1. **Change default passwords** in all .env files
2. **Enable firewall**: Already done by `server-setup.sh`
3. **Setup SSL**: Use Let's Encrypt (free)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```
4. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
5. **Backup database**:
   ```bash
   pg_dump -U nftuser nft_marketplace > backup.sql
   ```

## 📚 Additional Resources

- Main deployment guide: `../AWS_DEPLOYMENT_GUIDE.md`
- Backend docs: `../backend/README.md`
- Frontend docs: `../frontend/README.md`

## 💡 Tips

- Run `deploy-all.sh` for first-time deployment
- Individual scripts can be re-run if a step fails
- All scripts are idempotent (safe to run multiple times)
- Check logs if something goes wrong: `pm2 logs`
- The frontend build takes 5-10 minutes - be patient!

## 🆘 Need Help?

1. Check logs: `pm2 logs`
2. Check Nginx: `sudo systemctl status nginx`
3. Check PostgreSQL: `sudo systemctl status postgresql`
4. Check Redis: `redis-cli ping`
5. Review main guide: `../AWS_DEPLOYMENT_GUIDE.md`
