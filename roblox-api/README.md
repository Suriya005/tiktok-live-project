# Roblox API

REST API for handling TikTok Live integration with Roblox games.

## 🚀 Features

- ✅ Receive events from Roblox games
- ✅ Connect/Disconnect TikTok Live streams
- ✅ Real-time gift and comment handling
- ✅ API key authentication
- ✅ Place ID verification
- ✅ Rate limiting
- ✅ CORS enabled

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## 🛠️ Installation

1. **Navigate to project directory**
   ```bash
   cd roblox-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   PORT=4000
   ROBLOX_API_KEY=your-secure-api-key-here
   ROBLOX_PLACE_IDS=123456789,987654321
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Endpoints

Base URL: `http://localhost:4000/api/v1/roblox`

### Authentication

All endpoints require API key in header:
```
x-api-key: your-api-key
```

Or as query parameter:
```
?apiKey=your-api-key
```

---

### 1. Health Check

**GET** `/health`

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-12-15T...",
  "uptime": 123.45
}
```

---

### 2. Receive Events

**POST** `/api/v1/roblox/events`

**Headers:**
```
x-api-key: your-api-key
roblox-place-id: 123456789
roblox-user-id: 987654321
```

**Request Body:**
```json
{
  "eventType": "gift_received",
  "data": {
    "giftId": 1,
    "giftName": "Rose",
    "senderName": "TikTokUser",
    "coins": 1
  }
}
```

**Event Types:**
- `player_joined` - Player joined the game
- `player_left` - Player left the game
- `gift_received` - TikTok gift received
- `comment_received` - TikTok comment received

**Response:**
```json
{
  "success": true,
  "message": "Event received",
  "data": {
    "eventType": "gift_received",
    "processed": true,
    "timestamp": "2025-12-15T..."
  }
}
```

---

### 3. Get Status

**GET** `/api/v1/roblox/status/:placeId`

**Response (Connected):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "placeId": "123456789",
    "tiktokUsername": "@username",
    "connectedAt": "2025-12-15T...",
    "tiktokStatus": {
      "viewers": 100,
      "likes": 500
    }
  }
}
```

**Response (Not Connected):**
```json
{
  "success": true,
  "data": {
    "connected": false,
    "placeId": "123456789"
  }
}
```

---

### 4. Connect TikTok

**POST** `/api/v1/roblox/connect`

**Headers:**
```
x-api-key: your-api-key
roblox-place-id: 123456789
```

**Request Body:**
```json
{
  "tiktokUsername": "@username"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connected to TikTok Live",
  "data": {
    "placeId": "123456789",
    "tiktokUsername": "@username",
    "connectedAt": "2025-12-15T..."
  }
}
```

---

### 5. Disconnect TikTok

**POST** `/api/v1/roblox/disconnect`

**Headers:**
```
x-api-key: your-api-key
roblox-place-id: 123456789
```

**Response:**
```json
{
  "success": true,
  "message": "Disconnected from TikTok Live",
  "data": {
    "placeId": "123456789"
  }
}
```

---

### 6. Get Gifts

**GET** `/api/v1/roblox/gifts`

**Response:**
```json
{
  "success": true,
  "data": {
    "gifts": [
      {
        "id": 1,
        "name": "Rose",
        "coins": 1,
        "image": "rose.png"
      },
      {
        "id": 2,
        "name": "Diamond",
        "coins": 100,
        "image": "diamond.png"
      }
    ],
    "total": 2
  }
}
```

---

## 🎮 Roblox Integration Example

```lua
-- Roblox Script Example
local HttpService = game:GetService("HttpService")
local API_URL = "http://localhost:4000/api/v1/roblox"
local API_KEY = "your-api-key"
local PLACE_ID = game.PlaceId

-- Send event to API
function sendEvent(eventType, data)
    local success, response = pcall(function()
        return HttpService:PostAsync(
            API_URL .. "/events",
            HttpService:JSONEncode({
                eventType = eventType,
                data = data
            }),
            Enum.HttpContentType.ApplicationJson,
            false,
            {
                ["x-api-key"] = API_KEY,
                ["roblox-place-id"] = tostring(PLACE_ID),
                ["roblox-user-id"] = tostring(game.Players.LocalPlayer.UserId)
            }
        )
    end)
    
    if success then
        print("Event sent:", eventType)
    else
        warn("Failed to send event:", response)
    end
end

-- Example: Send gift received event
sendEvent("gift_received", {
    giftId = 1,
    giftName = "Rose",
    senderName = "TikTokUser",
    coins = 1
})

-- Connect to TikTok
function connectTikTok(username)
    local success, response = pcall(function()
        return HttpService:PostAsync(
            API_URL .. "/connect",
            HttpService:JSONEncode({
                tiktokUsername = username
            }),
            Enum.HttpContentType.ApplicationJson,
            false,
            {
                ["x-api-key"] = API_KEY,
                ["roblox-place-id"] = tostring(PLACE_ID)
            }
        )
    end)
    
    if success then
        print("Connected to TikTok:", username)
    else
        warn("Connection failed:", response)
    end
end
```

---

## 🔒 Security

### API Key
Generate a secure API key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Place ID Verification
Add your Roblox Place IDs to `.env`:
```env
ROBLOX_PLACE_IDS=123456789,987654321
```

Leave empty to allow all places (not recommended for production).

### Rate Limiting
- General endpoints: 100 requests/minute
- Sensitive endpoints (connect): 10 requests/minute

---

## 🧪 Testing

### cURL Examples

**Health Check:**
```bash
curl http://localhost:4000/health
```

**Send Event:**
```bash
curl -X POST http://localhost:4000/api/v1/roblox/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -H "roblox-place-id: 123456789" \
  -H "roblox-user-id: 987654321" \
  -d '{
    "eventType": "gift_received",
    "data": {
      "giftId": 1,
      "giftName": "Rose",
      "senderName": "TikTokUser",
      "coins": 1
    }
  }'
```

**Get Status:**
```bash
curl http://localhost:4000/api/v1/roblox/status/123456789 \
  -H "x-api-key: your-api-key"
```

**Connect TikTok:**
```bash
curl -X POST http://localhost:4000/api/v1/roblox/connect \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -H "roblox-place-id: 123456789" \
  -d '{
    "tiktokUsername": "@username"
  }'
```

---

## 📁 Project Structure

```
roblox-api/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration
│   ├── controllers/
│   │   └── robloxController.js    # Business logic
│   ├── middleware/
│   │   ├── errorHandler.js        # Error handling
│   │   ├── rateLimiter.js         # Rate limiting
│   │   └── robloxAuth.js          # Authentication
│   ├── routes/
│   │   ├── health.js              # Health routes
│   │   └── roblox.js              # Roblox routes
│   └── server.js                  # Express server
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔗 Integration with Other Services

### TikTok Live Connector
```env
TIKTOK_CONNECTOR_URL=http://localhost:8080
```

### Auth API
```env
AUTH_API_URL=http://localhost:3001/api/v1
```

---

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=4000
ROBLOX_API_KEY=<strong-api-key>
ROBLOX_PLACE_IDS=<your-place-ids>
ALLOWED_ORIGINS=https://roblox.com
TIKTOK_CONNECTOR_URL=https://your-connector-domain.com
```

### Using PM2

```bash
npm install -g pm2
pm2 start src/server.js --name roblox-api
pm2 save
pm2 startup
```

---

## 📝 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `NO_API_KEY` | 401 | API key not provided |
| `INVALID_API_KEY` | 401 | Invalid API key |
| `NO_PLACE_ID` | 400 | Place ID not provided |
| `UNAUTHORIZED_PLACE` | 403 | Place ID not authorized |
| `NO_USER_ID` | 400 | User ID not provided |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `ALREADY_CONNECTED` | 400 | Already connected to TikTok |
| `NOT_CONNECTED` | 400 | Not connected to TikTok |
| `CONNECTION_FAILED` | 500 | Failed to connect to TikTok |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Route not found |

---

## 📞 Support

For issues and questions, please refer to the main project documentation.

---

**Created:** December 15, 2025  
**Version:** 1.0.0
