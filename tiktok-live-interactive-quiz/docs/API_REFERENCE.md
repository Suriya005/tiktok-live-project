# API Reference

**Base URL:** `http://localhost:5000/api`

---

## Questions Management

### Create Question
```
POST /questions
Content-Type: application/json

Body:
{
  "text": "What is the capital of France?",
  "answer": "Paris",
  "hint": "It's known as the City of Light",
  "category": "Geography",
  "points": 10,
  "requiredCoins": 100
}

Response:
{
  "success": true,
  "questionId": "507f1f77bcf86cd799439011"
}
```

### Get All Questions
```
GET /questions

Response:
{
  "success": true,
  "questions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "text": "What is the capital of France?",
      "answer": "paris",
      "hint": "It's known as the City of Light",
      "category": "Geography",
      "points": 10,
      "requiredCoins": 100,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Specific Question
```
GET /questions/:id

Response:
{
  "success": true,
  "question": {
    "_id": "507f1f77bcf86cd799439011",
    "text": "What is the capital of France?",
    ...
  }
}
```

### Update Question
```
PUT /questions/:id
Content-Type: application/json

Body:
{
  "text": "What is the capital of Spain?",
  "points": 15
}

Response:
{
  "success": true,
  "message": "Question updated"
}
```

### Delete Question
```
DELETE /questions/:id

Response:
{
  "success": true,
  "message": "Question deleted"
}
```

---

## Leaderboard & Stats

### Get Leaderboard
```
GET /leaderboard?timeFilter=all-time

Query Parameters:
- timeFilter: "session" | "daily" | "weekly" | "monthly" | "yearly" | "all-time" (default: all-time)
- sessionId: (optional, required for "session" filter)

Response:
{
  "success": true,
  "leaderboard": [
    {
      "_id": "user123",
      "nickname": "alice",
      "totalPoints": 150,
      "count": 5
    },
    {
      "_id": "user456",
      "nickname": "bob",
      "totalPoints": 120,
      "count": 4
    }
  ]
}
```

### Get User Statistics
```
GET /stats/:tiktokId?timeFilter=all-time

Path Parameters:
- tiktokId: TikTok user ID

Query Parameters:
- timeFilter: "session" | "daily" | "weekly" | "monthly" | "yearly" | "all-time"

Response:
{
  "success": true,
  "stats": {
    "_id": "user123",
    "nickname": "alice",
    "totalPoints": 150,
    "correctAnswers": 3,
    "giftCount": 2
  },
  "coins": {
    "totalCoins": 250,
    "giftCount": 2
  }
}
```

---

## Quiz Control

### Start Question
```
POST /quiz/start
Content-Type: application/json

Body:
{
  "questionId": "507f1f77bcf86cd799439011"
}

Response:
{
  "success": true,
  "question": {
    "_id": "507f1f77bcf86cd799439011",
    "text": "What is the capital of France?",
    "category": "Geography",
    "points": 10,
    "requiredCoins": 100
  }
}
```

### Submit Answer
```
POST /quiz/answer
Content-Type: application/json

Body:
{
  "tiktokId": "user123",
  "nickname": "alice",
  "answer": "Paris"
}

Response (Correct):
{
  "success": true,
  "correct": true,
  "points": 10
}

Response (Wrong):
{
  "success": true,
  "correct": false,
  "hint": "It's known as the City of Light"
}

Response (Already Answered):
{
  "success": false,
  "error": "User already answered"
}

Response (No Active Question):
{
  "success": false,
  "error": "No active question"
}
```

### Skip Question
```
POST /quiz/skip

Response:
{
  "success": true
}
```

### Check Hint Status
```
GET /quiz/hint

Response (Hint Unlocked):
{
  "hintUnlocked": true,
  "hint": "It's known as the City of Light"
}

Response (Hint Not Unlocked):
{
  "hintUnlocked": false,
  "totalCoins": 50,
  "requiredCoins": 100,
  "progress": "50%"
}

Response (No Active Question):
{
  "hintUnlocked": false
}
```

---

## Health Check

### Server Health
```
GET /health

Response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Text and answer are required"
}
```

### 404 Not Found
```json
{
  "error": "Question not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Request Examples

### Using curl

**Create a question:**
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is 2+2?",
    "answer": "4",
    "hint": "Think of basic arithmetic",
    "category": "Math",
    "points": 10,
    "requiredCoins": 100
  }'
```

**Start a question:**
```bash
curl -X POST http://localhost:5000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{"questionId": "QUESTION_ID_HERE"}'
```

**Submit an answer:**
```bash
curl -X POST http://localhost:5000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -d '{
    "tiktokId": "user123",
    "nickname": "testuser",
    "answer": "4"
  }'
```

**Get leaderboard:**
```bash
curl "http://localhost:5000/api/leaderboard?timeFilter=all-time"
```

### Using JavaScript (fetch)

```javascript
// Create a question
const response = await fetch('http://localhost:5000/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Question text?',
    answer: 'answer',
    hint: 'hint text',
    category: 'Category',
    points: 10,
    requiredCoins: 100
  })
});

const data = await response.json();
console.log(data);
```

### Using Python (requests)

```python
import requests

# Start a question
response = requests.post(
  'http://localhost:5000/api/quiz/start',
  json={'questionId': 'QUESTION_ID'}
)

print(response.json())
```

---

## Rate Limiting

Currently, no rate limiting is enforced. For production, it's recommended to add:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute for admin endpoints

---

## CORS Headers

The API includes CORS support with the following headers:
```
Access-Control-Allow-Origin: (configured value)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

---

## Socket.io Events

### Client → Server

**Connect to TikTok:**
```javascript
socket.emit('connect-tiktok', { 
  username: '@tiktok_username' 
});
```

**Set Session:**
```javascript
socket.emit('set-session', { 
  sessionId: 'session_1234567890' 
});
```

**Monitor Hint:**
```javascript
socket.emit('monitor-hint');
```

**Disconnect TikTok:**
```javascript
socket.emit('disconnect-tiktok');
```

### Server → Client

**Question Started:**
```javascript
socket.on('question-started', (data) => {
  console.log(data.question);
});
```

**Answer Correct:**
```javascript
socket.on('answer-correct', (data) => {
  console.log(`${data.nickname} won ${data.points} points!`);
});
```

**Hint Unlocked:**
```javascript
socket.on('hint-unlocked', (data) => {
  console.log(`Hint: ${data.hint}`);
});
```

**Gift Received:**
```javascript
socket.on('user-gift', (data) => {
  console.log(`${data.nickname} sent ${data.count}x ${data.giftName}`);
});
```

---

## Pagination

Currently, leaderboard returns top 100. To implement pagination in future versions:

```
GET /leaderboard?page=1&limit=20
```

---

## Filtering & Sorting

### By Time
```
GET /leaderboard?timeFilter=daily
```

Available filters:
- `current` | `session`
- `daily`
- `weekly`
- `monthly`
- `yearly`
- `all-time` (default)

### By Category (Questions)
```
GET /questions?category=Geography
```

---

## Best Practices

1. **Always validate input** before submitting
2. **Use meaningful TikTok IDs** for tracking
3. **Set a reasonable sessionId** for grouping
4. **Check answer promptly** to show results quickly
5. **Monitor hint status** regularly (5s intervals)
6. **Handle connection errors** gracefully
7. **Use WebSockets** for real-time features
8. **Cache questions locally** to reduce API calls

---

## Versioning

Current API Version: **v1.0.0**

Future versions may introduce breaking changes. The API will maintain backward compatibility where possible.

---

## Support

For issues or questions, check the [Getting Started Guide](./GETTING_STARTED.md) or [Architecture](./ARCHITECTURE.md) documentation.
