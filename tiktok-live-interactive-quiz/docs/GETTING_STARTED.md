# Getting Started Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- MongoDB 5+
- Git

### Option 1: Local Development

#### 1. Start MongoDB
```bash
# Using Docker (easiest)
docker run -d -p 27017:27017 mongo:6

# Or use local MongoDB
mongod
```

#### 2. Start Backend
```bash
cd backend
cp .env.example .env
npm install
node scripts/seed.js    # Seed sample questions
npm run dev             # Starts on http://localhost:5000
```

#### 3. Start Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev             # Starts on http://localhost:3000
```

#### 4. Access URLs
- **Overlay:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Backend API:** http://localhost:5000/api

### Option 2: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Option 3: Production Deployment

#### Deploy Backend (Heroku/Railway)
```bash
cd backend
# Push to your git repo and connect to Heroku/Railway
# Set environment variables:
# - MONGODB_URI=your_mongodb_connection
# - CORS_ORIGIN=your_frontend_url
```

#### Deploy Frontend (Vercel/Netlify)
```bash
cd frontend
# Connect repo to Vercel/Netlify
# Set environment variables:
# - NEXT_PUBLIC_BACKEND_URL=your_backend_url
# - NEXT_PUBLIC_SOCKET_URL=your_backend_url
```

---

## First Quiz Setup

### Step 1: Add Questions
1. Go to http://localhost:3000/admin
2. Scroll to "Create Question"
3. Fill in:
   - Question text
   - Correct answer
   - Hint
   - Points (e.g., 10)
   - Coins needed for hint (e.g., 100)
4. Click "Create"

### Step 2: Connect to TikTok Live
1. In Admin Panel, enter your TikTok username
2. Click the ✅ button
3. Status should show 🟢 Connected

### Step 3: Start Broadcasting
1. Keep admin panel visible (or open in separate monitor)
2. Share overlay URL with OBS:
   - Add Browser source: http://localhost:3000
   - Size: 1920x1080 (or match your stream resolution)

### Step 4: Run Your First Question
1. In Admin Panel, select a question
2. Click "Start"
3. Question appears on overlay
4. Viewers answer in chat, winners shown in real-time
5. Gifts tracked automatically

---

## API Testing

### Create a Question
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is 2+2?",
    "answer": "4",
    "hint": "Think of basic math",
    "category": "Math",
    "points": 10,
    "requiredCoins": 100
  }'
```

### Get All Questions
```bash
curl http://localhost:5000/api/questions
```

### Start a Question
```bash
curl -X POST http://localhost:5000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{"questionId": "YOUR_QUESTION_ID"}'
```

### Submit an Answer
```bash
curl -X POST http://localhost:5000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -d '{
    "tiktokId": "user123",
    "nickname": "testuser",
    "answer": "4"
  }'
```

### Check Leaderboard
```bash
curl "http://localhost:5000/api/leaderboard?timeFilter=all-time"
```

---

## Common Issues & Fixes

### MongoDB Connection Error
**Problem:** Cannot connect to MongoDB
**Solution:**
```bash
# Check if MongoDB is running
# For Docker: docker ps | grep mongo
# For local: mongod should be running

# Or start MongoDB with Docker:
docker run -d -p 27017:27017 mongo:6
```

### Socket.io Not Connecting
**Problem:** Overlay shows 🔴 Disconnected
**Solution:**
- Ensure backend is running: http://localhost:5000/health
- Check browser console for errors (F12)
- Verify NEXT_PUBLIC_SOCKET_URL in frontend .env.local

### TikTok Connection Fails
**Problem:** Cannot connect to TikTok Live
**Solution:**
- Verify TikTok username is correct
- Ensure user is actively streaming
- Check tiktok-live-connector library compatibility
- View backend logs for detailed error

### Questions Not Loading in Admin
**Problem:** Empty question list
**Solution:**
- Seed database: `node backend/scripts/seed.js`
- Check MongoDB: `mongosh mongodb://localhost:27017`
- Run: `use tiktok-quiz` then `db.questions.find()`

---

## Next Steps

1. ✅ Test with sample questions
2. ✅ Customize styling in `/frontend/app/styles/`
3. ✅ Add your own questions
4. ✅ Configure rewards and points
5. ✅ Set up your TikTok stream integration
6. ✅ Deploy to production

---

## Need Help?

1. Check logs: `docker-compose logs -f`
2. View browser console: F12 / Cmd+Option+I
3. Check database: `mongosh mongodb://localhost:27017`
4. Verify ports: 3000, 5000, 27017 are available

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           TikTok Live Stream                 │
│    (Chat, Gifts, Follows captured here)      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│      Node.js Backend (port 5000)            │
│  • Express API                               │
│  • Socket.io Real-time                       │
│  • MongoDB Connection                        │
│  • TikTok Live Connector                     │
│  • Quiz Logic & Scoring                      │
└─────────────────────────────────────────────┘
        │                          │
        │ REST API                 │ Socket.io
        ▼                          ▼
┌──────────────────────────────────────────┐
│      Next.js Frontend (port 3000)        │
│  • Overlay Display                        │
│  • Admin Panel                            │
│  • Real-time Updates                      │
│  • OBS Browser Source Compatible          │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│         OBS Studio                       │
│    (Embed overlay in stream)              │
└──────────────────────────────────────────┘
```

---

## Configuration Reference

### Backend Environment Variables
```
NODE_ENV=development        # development, production
PORT=5000                   # Server port
MONGODB_URI=mongodb://...   # DB connection
CORS_ORIGIN=http://...      # Frontend URL
```

### Frontend Environment Variables
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

Ready to run your first quiz! 🎮🚀
