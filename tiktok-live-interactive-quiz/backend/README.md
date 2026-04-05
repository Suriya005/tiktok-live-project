# TikTok Live Quiz Backend

Node.js Express server with Socket.io for real-time communication and MongoDB for data storage.

## Requirements

- Node.js 18+
- MongoDB 5+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if local):
```bash
# macOS/Linux
mongod

# Windows
# Open Services and start MongoDB or use Docker
docker run -d -p 27017:27017 mongo:6
```

4. Seed the database (optional):
```bash
node scripts/seed.js
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Questions Management
- `POST /api/questions` - Create new question
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Leaderboard & Stats
- `GET /api/leaderboard?timeFilter=all-time` - Get leaderboard
  - `timeFilter`: session, daily, weekly, monthly, yearly, all-time
- `GET /api/stats/:tiktokId?timeFilter=all-time` - Get user stats

### Quiz Control
- `POST /api/quiz/start` - Start a question
- `POST /api/quiz/answer` - Submit answer
- `POST /api/quiz/skip` - Skip current question
- `GET /api/quiz/hint` - Check hint unlock status

## Socket.io Events

### Client → Server
- `connect-tiktok` - Connect to TikTok Live
- `disconnect-tiktok` - Disconnect from TikTok
- `set-session` - Set session ID
- `monitor-hint` - Monitor hint conditions

### Server → Client
- `tiktok-connected` - Connected to TikTok Live
- `tiktok-disconnected` - Disconnected from TikTok
- `user-chat` - New chat message
- `user-gift` - New gift received
- `user-follow` - New follow
- `question-started` - Question started
- `answer-correct` - Correct answer received
- `answer-wrong` - Wrong answer received
- `hint-unlocked` - Hint condition met
- `hint-status` - Current hint status

## Database Collections

### questions
- text: String (question text)
- answer: String (correct answer)
- hint: String (hint text)
- category: String (question category)
- points: Number (reward points)
- requiredCoins: Number (coins needed for hint)

### points_log
- tiktokId: String (TikTok user ID)
- nickname: String (TikTok username)
- points: Number (points earned/lost)
- source: String (answer or gift)
- timestamp: Date
- sessionId: String

### gift_log
- tiktokId: String
- nickname: String
- giftId: Number
- giftName: String
- count: Number (quantity sent)
- coinValue: Number (coins per gift)
- totalCoins: Number (count × coinValue)
- timestamp: Date

## Development

### Running Tests
```bash
npm test
```

### Database Queries

View leaderboard:
```javascript
db.points_log.aggregate([
  { $group: { _id: '$tiktokId', totalPoints: { $sum: '$points' } } },
  { $sort: { totalPoints: -1 } }
])
```

View user stats:
```javascript
db.points_log.find({ tiktokId: 'user123' })
```

## Troubleshooting

**Cannot connect to MongoDB**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB port (default 27017)

**TikTok connection fails**
- Ensure username exists and is streaming
- Check firewall/network settings
- Verify tiktok-live-connector compatibility

**Socket.io connection issues**
- Check CORS_ORIGIN in `.env`
- Verify frontend URL matches CORS_ORIGIN
- Check browser console for connection errors
