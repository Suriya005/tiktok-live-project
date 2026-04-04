# TikTok Live Gift Tracking API

Real-time API สำหรับการติดตามของขวัญ, คอมเมนต์, และกิจกรรมต่างๆ จาก TikTok Live แบบ Real-time

## ✨ Features

- 🎁 ติดตามของขวัญแบบ Real-time
- 💬 ติดตามคอมเมนต์
- ❤️ ติดตาม Likes
- 👥 ติดตามจำนวน Viewers
- 📊 สถิติการถ่ายทอดสด
- 🔌 WebSocket สำหรับ Real-time updates
- 🌐 REST API สำหรับการจัดการ connections

## 🚀 Installation

```bash
# ติดตั้ง dependencies
npm install

# หรือใช้
npm install express cors ws tiktok-live-connector dotenv
npm install --save-dev nodemon
```

## ⚙️ Configuration

สร้างไฟล์ `.env`:
```
PORT=3001
```

## 🏃 Running

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### REST API

#### 1. Health Check
```http
GET /health
```

Response:
```json
{
  "status": "OK",
  "activeConnections": 1,
  "wsClients": 2,
  "timestamp": "2025-12-07T..."
}
```

#### 2. Connect to Live Stream
```http
POST /api/connect
Content-Type: application/json

{
  "username": "tiktok_username"
}
```

Response:
```json
{
  "success": true,
  "message": "Connected to @tiktok_username",
  "connection": {
    "username": "tiktok_username",
    "connectedAt": "2025-12-07T...",
    "stats": {
      "totalGifts": 0,
      "totalCoins": 0,
      "totalComments": 0,
      "totalLikes": 0,
      "totalViewers": 0
    }
  }
}
```

#### 3. Disconnect from Live Stream
```http
POST /api/disconnect
Content-Type: application/json

{
  "username": "tiktok_username"
}
```

#### 4. Get All Active Connections
```http
GET /api/connections
```

Response:
```json
{
  "success": true,
  "count": 1,
  "connections": [
    {
      "username": "tiktok_username",
      "connectedAt": "2025-12-07T...",
      "stats": {
        "totalGifts": 25,
        "totalCoins": 1500,
        "totalComments": 150,
        "totalLikes": 5000,
        "totalViewers": 120
      }
    }
  ]
}
```

#### 5. Get Stats for Specific Connection
```http
GET /api/stats/:username
```

#### 6. Disconnect All
```http
POST /api/disconnect-all
```

### WebSocket API

เชื่อมต่อ WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message.event, message.data);
};
```

#### WebSocket Events

**Gift Event**
```json
{
  "event": "gift",
  "data": {
    "username": "user123",
    "nickname": "User Name",
    "giftName": "Rose",
    "giftId": 5655,
    "giftPictureUrl": "https://...",
    "repeatCount": 1,
    "repeatEnd": true,
    "diamondCount": 1,
    "streamUsername": "tiktok_username",
    "timestamp": "2025-12-07T..."
  }
}
```

**Comment Event**
```json
{
  "event": "comment",
  "data": {
    "username": "user123",
    "nickname": "User Name",
    "comment": "Hello!",
    "streamUsername": "tiktok_username",
    "timestamp": "2025-12-07T..."
  }
}
```

**Like Event**
```json
{
  "event": "like",
  "data": {
    "username": "user123",
    "nickname": "User Name",
    "likeCount": 5,
    "totalLikeCount": 100,
    "streamUsername": "tiktok_username",
    "timestamp": "2025-12-07T..."
  }
}
```

**Viewer Event**
```json
{
  "event": "viewers",
  "data": {
    "viewerCount": 150,
    "streamUsername": "tiktok_username",
    "timestamp": "2025-12-07T..."
  }
}
```

**Follow Event**
```json
{
  "event": "follow",
  "data": {
    "username": "user123",
    "nickname": "User Name",
    "streamUsername": "tiktok_username",
    "timestamp": "2025-12-07T..."
  }
}
```

**Share Event**
```json
{
  "event": "share",
  "data": {
    "username": "user123",
    "nickname": "User Name",
    "streamUsername": "tiktok_username",
    "timestamp": "2025-12-07T..."
  }
}
```

## 💻 Usage Example

### JavaScript/Node.js
```javascript
// Connect to a live stream
const response = await fetch('http://localhost:3001/api/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'tiktok_username' })
});

const data = await response.json();
console.log(data);

// Listen to real-time events
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.event === 'gift') {
    console.log(`🎁 ${message.data.nickname} sent ${message.data.giftName} x${message.data.repeatCount}`);
  }
  
  if (message.event === 'comment') {
    console.log(`💬 ${message.data.nickname}: ${message.data.comment}`);
  }
};
```

### Python
```python
import requests
import websocket
import json

# Connect to live stream
response = requests.post('http://localhost:3001/api/connect', 
    json={'username': 'tiktok_username'})
print(response.json())

# WebSocket listener
def on_message(ws, message):
    data = json.loads(message)
    if data['event'] == 'gift':
        print(f"🎁 {data['data']['nickname']} sent {data['data']['giftName']}")

ws = websocket.WebSocketApp('ws://localhost:3001',
    on_message=on_message)
ws.run_forever()
```

### cURL
```bash
# Connect
curl -X POST http://localhost:3001/api/connect \
  -H "Content-Type: application/json" \
  -d '{"username": "tiktok_username"}'

# Get stats
curl http://localhost:3001/api/stats/tiktok_username

# Get all connections
curl http://localhost:3001/api/connections

# Disconnect
curl -X POST http://localhost:3001/api/disconnect \
  -H "Content-Type: application/json" \
  -d '{"username": "tiktok_username"}'
```

## 🌐 Web Dashboard Example

สร้างไฟล์ `dashboard.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>TikTok Live Gift Tracker</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .gift { background: #ff0050; color: white; padding: 10px; margin: 5px; border-radius: 5px; }
        .comment { background: #00f2ea; color: black; padding: 10px; margin: 5px; border-radius: 5px; }
        .stats { background: #25f4ee; padding: 20px; margin: 20px 0; border-radius: 10px; }
    </style>
</head>
<body>
    <h1>🎁 TikTok Live Gift Tracker</h1>
    
    <div>
        <input type="text" id="username" placeholder="TikTok Username">
        <button onclick="connect()">Connect</button>
        <button onclick="disconnect()">Disconnect</button>
    </div>
    
    <div class="stats" id="stats">
        <h3>Statistics</h3>
        <p>Gifts: <span id="giftCount">0</span></p>
        <p>Coins: <span id="coinCount">0</span></p>
        <p>Comments: <span id="commentCount">0</span></p>
        <p>Viewers: <span id="viewerCount">0</span></p>
    </div>
    
    <div id="events"></div>

    <script>
        let ws;
        let currentUsername = '';
        let stats = { gifts: 0, coins: 0, comments: 0, viewers: 0 };

        async function connect() {
            const username = document.getElementById('username').value;
            if (!username) return alert('Please enter username');
            
            currentUsername = username;
            
            // Connect via REST API
            const response = await fetch('http://localhost:3001/api/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            
            const data = await response.json();
            console.log(data);
            
            // Connect WebSocket
            ws = new WebSocket('ws://localhost:3001');
            
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleEvent(message);
            };
        }

        async function disconnect() {
            if (!currentUsername) return;
            
            const response = await fetch('http://localhost:3001/api/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUsername })
            });
            
            if (ws) ws.close();
        }

        function handleEvent(message) {
            const eventsDiv = document.getElementById('events');
            
            if (message.event === 'gift') {
                const gift = message.data;
                stats.gifts++;
                stats.coins += gift.diamondCount * gift.repeatCount;
                updateStats();
                
                eventsDiv.innerHTML = `
                    <div class="gift">
                        🎁 ${gift.nickname} sent ${gift.giftName} x${gift.repeatCount} (${gift.diamondCount * gift.repeatCount} coins)
                    </div>
                ` + eventsDiv.innerHTML;
            }
            
            if (message.event === 'comment') {
                const comment = message.data;
                stats.comments++;
                updateStats();
                
                eventsDiv.innerHTML = `
                    <div class="comment">
                        💬 ${comment.nickname}: ${comment.comment}
                    </div>
                ` + eventsDiv.innerHTML;
            }
            
            if (message.event === 'viewers') {
                stats.viewers = message.data.viewerCount;
                updateStats();
            }
        }

        function updateStats() {
            document.getElementById('giftCount').textContent = stats.gifts;
            document.getElementById('coinCount').textContent = stats.coins;
            document.getElementById('commentCount').textContent = stats.comments;
            document.getElementById('viewerCount').textContent = stats.viewers;
        }
    </script>
</body>
</html>
```

## 📝 Notes

- ต้องมี TikTok username ที่กำลัง Live อยู่
- API จะทำงานได้ต่อเมื่อมีการถ่ายทอดสดอยู่
- WebSocket จะส่งข้อมูล Real-time ทันทีที่มีเหตุการณ์เกิดขึ้น
- สามารถติดตามหลาย Live streams พร้อมกันได้

## 🔧 Troubleshooting

**Connection Failed**: ตรวจสอบว่า username ถูกต้องและกำลัง Live อยู่

**WebSocket Disconnected**: ลอง reconnect อีกครั้ง

**Rate Limiting**: TikTok อาจจำกัดการเชื่อมต่อบ่อยเกินไป

## 📄 License

ISC
