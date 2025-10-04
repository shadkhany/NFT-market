# NFT Marketplace - AWS EC2 Deployment Ready

Complete NFT marketplace platform optimized for AWS free tier deployment.

## 🚀 AWS Deployment (Beginner-Friendly)

**📖 Complete Guide:** [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

Quick overview:
1. Create AWS EC2 t3.micro instance
2. Upload project files
3. Run deployment scripts
4. Access your live marketplace!

## 📦 Project Structure

```
NFT-market/
├── backend/              # NestJS API server
│   ├── src/             # Application code
│   ├── prisma/          # Database schema
│   └── package.json
├── frontend/             # Next.js web app
│   ├── src/             # React components
│   └── package.json
├── contracts/            # Solidity smart contracts
├── deploy-scripts/       # AWS deployment automation
│   ├── server-setup.sh
│   ├── database-setup.sh
│   ├── deploy-backend.sh
│   └── deploy-frontend.sh
└── AWS_DEPLOYMENT_GUIDE.md
```

## 🛠 Tech Stack

**Backend**
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL database
- Redis for caching
- Ethers.js for blockchain

**Frontend**
- Next.js 15
- React 18
- TypeScript
- TailwindCSS
- Axios

**Smart Contracts**
- Solidity 0.8.30+
- ERC-721 (NFT standard)
- ERC-1155 (Multi-token)
- Marketplace contract

**Infrastructure**
- AWS EC2 (t3.micro free tier)
- Nginx reverse proxy
- PM2 process manager
- PostgreSQL + Redis

## ⚡ Local Development

### Prerequisites
- Node.js 18+
- Yarn
- PostgreSQL
- Redis

### 1. Clone & Install
```bash
git clone <your-repo>
cd NFT-market
yarn install:all
```

### 2. Setup Environment
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL

# Frontend  
cp frontend/.env.production.example frontend/.env
# Edit with API URL
```

### 3. Database
```bash
cd backend
yarn prisma:generate
yarn prisma:migrate:dev
cd ..
```

### 4. Run Servers
```bash
# Terminal 1 - Backend (port 4000)
yarn dev:backend

# Terminal 2 - Frontend (port 3000)
yarn dev:frontend
```

Visit: `http://localhost:3000`

## 🌐 AWS Deployment

### Upload to AWS
```bash
# Create archive (from your local machine)
cd /Users/shadkhany/Desktop/Git/NFT-market
tar -czf nft-marketplace.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.git' \
  .

# Upload to server
scp -i ~/path/to/key.pem nft-marketplace.tar.gz ubuntu@YOUR_IP:~/
```

### Deploy on Server
```bash
# SSH into server
ssh -i ~/path/to/key.pem ubuntu@YOUR_IP

# Extract files
tar -xzf nft-marketplace.tar.gz -C nft-marketplace
cd nft-marketplace

# Run deployment scripts
cd deploy-scripts
chmod +x *.sh
./server-setup.sh
./database-setup.sh
./deploy-backend.sh
./deploy-frontend.sh
```

Access at: `http://YOUR_SERVER_IP`

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nft_marketplace"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
PORT=4000
NODE_ENV=production
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4000/api
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## 📋 Features

### Current Features ✅
- User authentication
- NFT browsing & filtering
- Create/Mint NFT interface
- Individual NFT detail pages
- Collection management
- Responsive design
- RESTful API backend
- PostgreSQL database
- Redis caching

### Ready to Integrate ⚙️
- Web3 wallet connectivity
- Smart contract interaction
- IPFS file storage
- Blockchain event indexing

## 📊 Server Management

```bash
# Check status
pm2 status

# View logs
pm2 logs nft-backend
pm2 logs nft-frontend

# Restart
pm2 restart all

# Stop
pm2 stop all
```

## 🔧 Maintenance

### Update Application
```bash
git pull
cd backend && yarn install && yarn build && cd ..
cd frontend && yarn install && yarn build && cd ..
pm2 restart all
```

### Backup Database
```bash
pg_dump -U nftuser nft_marketplace > backup-$(date +%Y%m%d).sql
```

### Monitor Resources
```bash
htop                # System resources
df -h               # Disk space
free -h             # Memory usage
pm2 monit           # Application monitoring
```

## 💰 AWS Free Tier

What you get for FREE (12 months):
- ✅ 750 hours/month t3.micro EC2 (24/7 uptime)
- ✅ 30 GB storage
- ✅ 15 GB data transfer

After free tier: ~$10-15/month

## 🆘 Troubleshooting

**Port already in use?**
```bash
sudo lsof -i :3000
sudo lsof -i :4000
```

**Out of memory?**
```bash
free -h
pm2 restart all
```

**Database connection failed?**
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"
```

**Frontend not loading?**
```bash
pm2 logs nft-frontend
curl http://localhost:3000
```

**Backend errors?**
```bash
pm2 logs nft-backend
curl http://localhost:4000/api
```

## 📚 Documentation

- **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)** - Complete AWS setup (500+ lines)
- **[backend/.env.example](./backend/.env.example)** - Backend configuration
- **[frontend/.env.production.example](./frontend/.env.production.example)** - Frontend configuration

## 🔒 Security Notes

1. Never commit `.env` files
2. Use strong database passwords
3. Keep dependencies updated: `yarn upgrade`
4. Enable firewall: `sudo ufw enable`
5. Setup SSL certificate (Let's Encrypt)
6. Regular backups

## 📝 License

MIT License

---

**Need Help?** Check the [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) troubleshooting section.
