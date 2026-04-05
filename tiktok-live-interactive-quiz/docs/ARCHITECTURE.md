# Architecture Overview

## Project Structure

```
tiktok-live-interactive-quiz/
├── backend/                      # Node.js Express server
│   ├── src/
│   │   ├── server.js            # Main entry point
│   │   ├── config/
│   │   │   └── database.js      # MongoDB connection
│   │   ├── models/
│   │   │   ├── Question.js      # Question CRUD & validation
│   │   │   ├── PointsLog.js     # Score tracking
│   │   │   └── GiftLog.js       # Gift logging
│   │   ├── services/
│   │   │   ├── TiktokService.js # TikTok Live integration
│   │   │   └── QuizService.js   # Quiz game logic
│   │   ├── controllers/
│   │   │   └── quizController.js # Request handlers
│   │   └── routes/
│   │       └── api.js           # API endpoints
│   ├── scripts/
│   │   └── seed.js              # Database seeding
│   ├── Dockerfile               # Container config
│   ├── package.json             # Dependencies
│   └── README.md                # Backend docs
│
├── frontend/                     # Next.js React app
│   ├── app/
│   │   ├── page.js              # Main overlay page
│   │   ├── admin/
│   │   │   └── page.js          # Admin panel page
│   │   ├── components/
│   │   │   ├── Overlay.jsx      # Question/winner/gift display
│   │   │   └── AdminPanel.jsx   # Quiz control interface
│   │   ├── contexts/
│   │   │   └── SocketContext.js # Socket.io provider
│   │   ├── services/
│   │   │   └── api.js           # REST API client
│   │   ├── styles/
│   │   │   ├── globals.css      # Global styles
│   │   │   └── overlay.css      # Overlay styling
│   │   └── layout.js            # Root layout
│   ├── package.json
│   ├── next.config.js
│   ├── Dockerfile
│   └── README.md
│
├── docs/
│   ├── GETTING_STARTED.md       # Setup guide
│   ├── ARCHITECTURE.md          # This file
│   ├── API_REFERENCE.md         # API docs
│   └── DEPLOYMENT.md            # Deploy guide
│
├── docker-compose.yml           # Multi-container setup
└── README.md                    # Project overview

```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Server:** Express.js 5.0
- **Real-time:** Socket.io 4.7
- **Database:** MongoDB 6 (native driver)
- **TikTok Integration:** tiktok-live-connector 4.10
- **Other:** dotenv, cors

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18
- **Real-time:** Socket.io-client 4.7
- **HTTP Client:** Axios 1.6
- **Styling:** Custom CSS (no framework)

### Deployment
- **Containers:** Docker & Docker Compose
- **Database:** MongoDB Atlas (cloud) or self-hosted

---

## Data Flow Architecture

### 1. Real-time Event Flow (Socket.io)

```
┌──────────────────────┐
│  TikTok Live Stream  │
│  (Chat, Gifts, etc)  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│    TiktokService (Backend)           │
│  • Listens to TikTok events          │
│  • Emits socket events to clients    │
│  • Logs gifts/chats to DB            │
└──────────┬───────────────────────────┘
           │
        Socket.io
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────────┐ ┌──────────────┐
│  Overlay   │ │ Admin Panel  │
│  (Display) │ │  (Control)   │
└────────────┘ └──────────────┘
```

### 2. Quiz Logic Flow

```
Admin Panel
    │
    ├─ Create / Select Question
    │       │
    │       ▼
    │   questController.startQuestion()
    │       │
    │       ▼
    │   QuizService.startQuestion()
    │       │
    │       ├─ Emit 'question-started'
    │       │
    │       ▼
    │   Socket.io → Overlay displays question
    │
    ├─ TikTok Chat Monitor
    │       │
    │       ▼
    │   Chat arrives → processAnswer()
    │       │
    │       ▼
    │   QuizService.processAnswer()
    │       │
    │       ├─ Check answer vs DB
    │       │
    │       ├─ If correct:
    │       │    ├─ PointsLog.addPoints() [DB]
    │       │    └─ Emit 'answer-correct' → Overlay shows winner
    │       │
    │       └─ If wrong:
    │            └─ Emit 'answer-wrong' → Return hint?
    │
    └─ Skip Question
            │
            ▼
        QuizService.skipQuestion()
            │
            ├─ Clear current question
            └─ Emit 'question-skipped'
```

### 3. Hint System Flow

```
Gifts arrive from TikTok
    │
    ▼
GiftLog.logGift() [DB]
    │
    ▼
emit 'user-gift' [Socket.io]
    ▼
Frontend monitors (every 5s)
    │
    ▼
checkHintCondition()
    │
    ├─ Sum all gifts from current session
    │
    ├─ Compare against requiredCoins
    │
    ├─ If total >= required:
    │  │
    │  ├─ Mark hint as unlocked
    │  │
    │  └─ Emit 'hint-unlocked' [Socket.io]
    │      │
    │      ▼
    │   Overlay displays hint
    │
    └─ Send progress % anyway
```

### 4. Scoring & Leaderboard Flow

```
Events (answers, gifts) arrive
    │
    ├─ Answer: +points to PointsLog
    │
    └─ Gift: 
        ├─ Log to GiftLog
        └─ Calculate coins: count × coinValue
            │
            ▼
        PointsLog.addPoints(giftPoints)
    │
    ▼
Query: getLeaderboard(timeFilter)
    │
    ├─ Aggregate by tiktokId
    ├─ Group points
    ├─ Filter by time range (daily/weekly/all-time)
    └─ Sort descending
    │
    ▼
Return top 100 users
    │
    ▼
Display in Admin Panel leaderboard
```

---

## Database Schema

### Collections

#### 1. questions
```json
{
  "_id": ObjectId,
  "text": "What is 2+2?",
  "answer": "4",
  "hint": "Basic arithmetic",
  "category": "Math",
  "points": 10,
  "requiredCoins": 100,
  "createdAt": ISODate
}
```
**Indexes:** category

#### 2. points_log
```json
{
  "_id": ObjectId,
  "tiktokId": "user123",
  "nickname": "alice",
  "points": 10,
  "source": "answer",
  "timestamp": ISODate,
  "sessionId": "session_1234567890"
}
```
**Indexes:** tiktokId, timestamp, sessionId

#### 3. gift_log
```json
{
  "_id": ObjectId,
  "tiktokId": "user123",
  "nickname": "alice",
  "giftId": 123,
  "giftName": "Rose",
  "count": 5,
  "coinValue": 1,
  "totalCoins": 5,
  "timestamp": ISODate
}
```
**Indexes:** tiktokId, timestamp

---

## API Endpoints

### Questions
- `POST /api/questions` - Create
- `GET /api/questions` - List all
- `GET /api/questions/:id` - Get one
- `PUT /api/questions/:id` - Update
- `DELETE /api/questions/:id` - Delete

### Leaderboard
- `GET /api/leaderboard?timeFilter=all-time` - Get top 100
- `GET /api/stats/:tiktokId?timeFilter=all-time` - User stats

### Quiz Control
- `POST /api/quiz/start` - Start question
- `POST /api/quiz/answer` - Submit answer
- `POST /api/quiz/skip` - Skip question
- `GET /api/quiz/hint` - Check hint status

---

## Socket.io Events

### Client → Server
| Event | Data | Purpose |
|-------|------|---------|
| `connect-tiktok` | `{ username }` | Connect to TikTok Live |
| `disconnect-tiktok` | - | Disconnect from TikTok |
| `set-session` | `{ sessionId }` | Set quiz session |
| `monitor-hint` | - | Start monitoring hints |

### Server → Client
| Event | Data | Purpose |
|-------|------|---------|
| `question-started` | `{ question }` | New question display |
| `answer-correct` | `{ tiktokId, nickname, points }` | Winner announcement |
| `answer-wrong` | `{ tiktokId, nickname }` | Wrong answer |
| `hint-unlocked` | `{ hint, totalCoins }` | Hint displayed |
| `hint-status` | `{ progress, totalCoins }` | Hint progress bar |
| `question-skipped` | - | Clear current question |
| `user-chat` | `{ tiktokId, nickname, message }` | Chat message |
| `user-gift` | `{ tiktokId, giftName, count }` | Gift received |
| `user-follow` | `{ tiktokId, nickname }` | New follower |
| `tiktok-connected` | - | TikTok connected |
| `tiktok-disconnected` | - | TikTok disconnected |

---

## Component Hierarchy

### Frontend
```
RootLayout
├── SocketProvider
│   ├── Page (Overlay)
│   │   └── Overlay
│   │       ├── Question Display
│   │       ├── Winner Notification
│   │       ├── Gift Notification
│   │       └── Coin Progress Bar
│   └── Page (Admin)
│       ├── Overlay
│       └── AdminPanel
│           ├── TikTok Connection
│           ├── Create Question Form
│           ├── Questions List
│           └── Leaderboard
```

---

## Authentication & Security

### Current Implementation
- No authentication required
- All endpoints publicly accessible
- Socket.io unprotected

### Production Recommendations
1. Add JWT authentication
2. Implement rate limiting
3. Validate all inputs on backend
4. Use HTTPS/WSS for socket.io
5. Add CORS whitelist
6. Validate TikTok user IDs

---

## Performance Considerations

### Database Queries
- **Leaderboard:** Aggregation pipeline (efficient)
- **User Stats:** Indexed on tiktokId, timestamp
- **Hint Check:** Session gift aggregation (7-10 docs typical)

### Real-time Updates
- Socket.io efficient for low-latency events
- Frontend monitors hint every 5 seconds (adjustable)
- Backend processes answers immediately

### Scaling Improvements
1. Add Redis for session caching
2. Implement database connection pooling
3. Add load balancer for backend instances
4. Use CDN for static frontend assets
5. Consider message queue for gift processing

---

## Deployment Considerations

### Development
- All services on localhost
- MongoDB local or Docker
- Hot reload enabled

### Production
- Containerized deployment (Docker)
- MongoDB Atlas or managed database
- Environment variables for secrets
- HTTPS with SSL certificates
- Separate backend/frontend servers
- Optional: CDN, load balancer, auto-scaling

---

## Error Handling

### Backend
- Try-catch in all controllers
- Standardized error responses
- Console logging for debugging
- MongoDB connection error handling

### Frontend
- Socket.io reconnection automatic
- API error logging to console
- User-friendly error messages
- Graceful degradation

---

## Future Enhancements

1. **User Accounts:** Registration, login, profile
2. **Team Scoring:** Groups compete together
3. **Daily/Weekly Events:** Scheduled quizzes
4. **Custom Themes:** Branding support
5. **Analytics:** Detailed stats and reports
6. **Moderation:** Ban/approve users
7. **Multiple Streams:** Parallel quizzes
8. **Mobile App:** Native viewers
9. **Payment Integration:** Monetization
10. **Advanced Scoring:** Difficulty multipliers

---

This architecture is designed to be scalable, maintainable, and easily extensible for future features.
