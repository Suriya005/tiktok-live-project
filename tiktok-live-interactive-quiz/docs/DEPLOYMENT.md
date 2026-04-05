# Deployment Guide

## Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] Frontend build completes without errors
- [ ] Socket.io connection tested
- [ ] TikTok integration tested
- [ ] Database backups set up
- [ ] Error logging configured
- [ ] HTTPS/SSL certificates ready
- [ ] CORS whitelist configured

---

## Option 1: Docker Compose (Recommended for All)

### Prerequisites
- Docker & Docker Compose installed
- Ports 3000, 5000, 27017 available

### Deploy

```bash
# Clone/pull latest code
git pull origin main

# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend (optional)
docker-compose up -d --scale backend=3

# Stop all services
docker-compose down
```

### Verify Deployment
```bash
# Check services
docker-compose ps

# Test backend health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000
```

### Manage Docker Compose
```bash
# View logs for specific service
docker-compose logs -f backend

# Rebuild after code changes
docker-compose up -d --build

# Remove volumes (careful: deletes data)
docker-compose down -v

# Update to latest
docker-compose pull && docker-compose up -d
```

---

## Option 2: Production Servers (Cloud)

### Backend Deployment (Heroku/Railway/Render)

#### With Heroku
```bash
# Install Heroku CLI
# heroku login

# Create app
heroku create my-tiktok-quiz-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quiz
heroku config:set CORS_ORIGIN=https://my-frontend.vercel.app

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Scale dynos
heroku ps:scale web=2
```

#### With Railway
1. Connect GitHub repository
2. Connect MongoDB database
3. Set environment variables
4. Deploy (auto on push)

#### With Render
1. Create Web Service
2. Connect to GitHub
3. Set build command: `npm install && node scripts/seed.js`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Frontend Deployment (Vercel/Netlify)

#### With Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_BACKEND_URL=https://my-backend.herokuapp.com
# NEXT_PUBLIC_SOCKET_URL=https://my-backend.herokuapp.com
```

#### With Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

### Database (MongoDB Atlas)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Add IP to whitelist (0.0.0.0/0 for development)
4. Create database user
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/tiktok-quiz`
6. Update `MONGODB_URI` in all services

---

## Production Environment Setup

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tiktok-quiz
MONGODB_DB=tiktok-quiz
CORS_ORIGIN=https://my-domain.com
```

### Frontend (.env.production)
```
NEXT_PUBLIC_BACKEND_URL=https://api.my-domain.com
NEXT_PUBLIC_SOCKET_URL=https://api.my-domain.com
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Nginx/Apache)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d api.my-domain.com

# Auto-renew
sudo certbot renew --dry-run
```

### Using Cloudflare (Recommended)
1. Add domain to Cloudflare
2. Update nameservers
3. Enable Flexible/Full SSL
4. Use development mode for testing

### In Docker with Nginx
```docker
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl /etc/nginx/ssl

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
```

---

## Load Balancing

### Nginx Configuration
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    listen 443 ssl;
    server_name api.my-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'Upgrade';
    }
}
```

---

## Database Backup & Recovery

### MongoDB Atlas Backup
1. Enable automated backups in Atlas
2. Set retention to 30+ days
3. Test restore procedure monthly

### Manual Backup
```bash
# Local backup
mongodump --uri "mongodb://localhost:27017" -o ./backup

# Restore
mongorestore --uri "mongodb://localhost:27017" ./backup
```

### S3 Backup (AWS)
```bash
# Install AWS CLI
aws s3 sync ./mongo-backup s3://my-bucket/backups/
```

---

## Monitoring & Logging

### Application Monitoring
```bash
# PM2 (process manager)
npm install -g pm2

# Start with PM2
pm2 start backend/src/server.js --name "quiz-backend"

# Monitor
pm2 monit

# Save config
pm2 startup && pm2 save
```

### Error Tracking (Sentry)
```javascript
// In backend/src/server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.errorHandler());
```

### Logs Management
```bash
# View logs
journalctl -u quiz-backend -f

# Rotate logs
logrotate /etc/logrotate.d/quiz-backend

# CloudWatch (AWS)
aws logs tail /aws/lambda/quiz-backend --follow
```

---

## Performance Optimization

### Frontend (Next.js)
```javascript
// Enable static generation for pages
export const revalidate = 3600; // ISR: 1 hour

// Image optimization
import Image from 'next/image';

// Code splitting (automatic)
```

### Backend Optimization
```javascript
// Use connection pooling
const pool = new MongoClient(uri, { maxPoolSize: 10 });

// Cache endpoints
app.use(cacheMiddleware);

// Gzip compression
app.use(compression());
```

### Database Optimization
```bash
# Create indexes
db.questions.createIndex({ category: 1 })
db.points_log.createIndex({ timestamp: 1 })
db.gift_log.createIndex({ tiktokId: 1, timestamp: 1 })

# Analyze query plans
db.points_log.find({ tiktokId: 'xxx' }).explain()
```

---

## Security Hardening

### Environment Secrets
```bash
# Use .env files (never commit)
# Or use secret management:
# - GitHub Secrets
# - Vercel Secrets
# - Railway Variables
# - AWS Secrets Manager

# Rotate secrets regularly (monthly recommended)
```

### API Security
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

// Input validation
const { body, validationResult } = require('express-validator');

app.post('/api/questions', [
  body('text').notEmpty().trim(),
  body('answer').notEmpty().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... handle request
});

// CORS whitelist
var whitelist = ['https://my-domain.com']
var cors = require('cors')
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))
```

### Database Security
```bash
# Enable MongoDB authentication
use admin
db.createUser({ user: 'admin', pwd: 'strong_password', roles: ['root'] });

# Bind to private network only
# In MongoDB config: net.bindIp: 127.0.0.1,10.0.0.5

# Enable encryption
--enableEncryption
```

---

## Troubleshooting Deployment

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Check MongoDB connection
mongostat --uri "your_connection_string"

# Validate config
node -c backend/src/server.js
```

### Frontend Blank Page
```
// Check browser console (F12)
// Verify NEXT_PUBLIC_BACKEND_URL env var
// Check Network tab for API calls
```

### Socket.io Not Connecting
```javascript
// Enable debug
const socket = io(url, {
  reconnection: true,
  debug: true
});

// Check CORS origins
// Verify WSS port (443 for HTTPS)
```

### Database Connection Timeouts
```bash
# Check network connectivity
ping mongodb.atlas.mongodb.net

# Increase timeout
MONGODB_TIMEOUT=10000

# Use connection pooling
maxPoolSize: 10
```

---

## Zero-Downtime Deployment

### Strategy: Blue-Green Deployment
```bash
# Deploy new version to "green" environment
docker-compose -f docker-compose.green.yml up -d

# Test green environment
curl http://localhost:3001

# Switch traffic to green
# Update load balancer or DNS

# Keep blue running for quick rollback
# After verification, shut down blue
docker-compose -f docker-compose.blue.yml down
```

### Rolling Updates with Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quiz-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

---

## Cost Optimization

### Reduce Database Costs
- Use MongoDB Atlas Serverless (pay per request)
- Archive old data regularly
- Clean up unused indexes

### Reduce Compute Costs
- Use auto-scaling (start low, scale as needed)
- Schedule off-hours shutdown (dev/staging only)
- Use cheaper regions

### Monitoring Costs
```bash
# AWS
aws ce get-cost-and-usage --service "EC2" | jq '.ResultsByTime[].Total.UnblendedCost'
```

---

## Rollback Procedure

If deployment fails:

```bash
# Heroku rollback
heroku releases
heroku rollback v42

# Docker rollback
docker-compose down
git checkout previous_commit
docker-compose build && docker-compose up -d

# Database rollback
mongorestore /path/to/backup
```

---

## Maintenance Schedule

- **Daily:** Monitor error logs, check uptime
- **Weekly:** Review performance metrics
- **Monthly:** Update dependencies, test backups
- **Quarterly:** Security audit, capacity planning
- **Yearly:** Major version updates, disaster recovery drill

---

## Next Steps

1. Set up monitoring dashboard
2. Configure automated backups
3. Test recovery procedures
4. Document runbooks
5. Train operations team
6. Schedule maintenance windows
7. Set up alerting

---

For questions, refer to [Getting Started](./GETTING_STARTED.md) or [Architecture](./ARCHITECTURE.md).
