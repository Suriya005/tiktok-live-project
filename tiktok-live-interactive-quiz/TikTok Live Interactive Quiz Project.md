# 🎮 TikTok Live Interactive Quiz Project

โปรเจคสร้างระบบกิจกรรมตอบคำถามบน TikTok Live แบบ Real-time ที่เชื่อมโยงการแชท (Engagement) และการส่งของขวัญ (Monetization) เพื่อเพิ่มความสนุกและการมีส่วนร่วมให้กับสตรีมเมอร์

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Express 5 |
| Database | MongoDB 6 (Native Driver — ไม่ใช้ Mongoose) |
| Real-time | Socket.io 4 |
| TikTok Integration | `tiktok-live-connector` |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
tiktok-live-interactive-quiz/
├── backend/
│   ├── src/
│   │   ├── adapters/
│   │   │   └── tiktok.adapter.js       # TikTok Live connection handler
│   │   ├── config/
│   │   │   └── database.js             # MongoDB Singleton connection
│   │   ├── middlewares/
│   │   │   └── error.middleware.js
│   │   ├── modules/
│   │   │   ├── health/
│   │   │   ├── questions/
│   │   │   │   ├── question.route.js
│   │   │   │   ├── question.controller.js
│   │   │   │   ├── question.service.js
│   │   │   │   └── question.repository.js
│   │   │   ├── quiz/
│   │   │   │   ├── quiz.route.js
│   │   │   │   ├── quiz.controller.js
│   │   │   │   ├── quiz.service.js      # In-memory quiz state
│   │   │   │   └── quiz.repository.js   # points_log, gift_log
│   │   │   └── leaderboard/
│   │   │       ├── leaderboard.route.js
│   │   │       ├── leaderboard.controller.js
│   │   │       └── leaderboard.repository.js
│   │   ├── utils/
│   │   │   ├── logger.js               # Structured logger
│   │   │   └── response.js             # Standardized response helpers
│   │   ├── app.js                      # Express + Socket.io setup
│   │   └── server.js                   # Bootstrap entry point
│   └── scripts/
│       ├── seed.js                     # Seed 5 sample questions
│       └── import-csv-questions.js     # Import questions from CSV
├── frontend/
│   └── app/
│       ├── admin/page.js
│       ├── questions/page.js
│       ├── leaderboard/page.js
│       ├── leaderboard-overlay/page.js
│       ├── overlay/page.js
│       ├── components/
│       │   ├── AdminPanel.jsx
│       │   ├── QuestionManager.jsx
│       │   └── Overlay.jsx
│       ├── contexts/SocketContext.js
│       └── services/api.js             # Axios HTTP client
└── docker-compose.yml
```

---

## 🏗 Architecture

### 4-Layer Pattern (per module)

```
Route → Controller → Service → Repository
```

- **Route:** Express router, path definitions only
- **Controller:** Parse request, call service, return response via `utils/response.js`
- **Service:** Business logic, in-memory state (quiz)
- **Repository:** MongoDB queries only, no business logic

### API Response Format (Standardized)

ทุก endpoint คืนค่าในรูปแบบเดียวกัน:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": null,
  "data": { ... }
}
```

**List responses** มี `pagination` เพิ่มเติม:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": null,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 12565, "totalPages": 629 }
}
```

**Error responses:**
```json
{ "success": false, "code": "INVALID_PARAM", "message": "text is required", "data": null }
{ "success": false, "code": "INTERNAL_ERROR", "message": "Internal server error", "data": null }
{ "success": true,  "code": "DATA_NOT_FOUND", "message": null, "data": null }
```

---

## 📋 Core Features

### 1. ระบบจัดการคำถาม (Question CRUD)
- Create / Read / Update / Delete คำถาม
- รองรับรูปแบบ Text-only และ Multiple Choice (A, B, C, D)
- จัดหมวดหมู่ด้วย Category และ Tags
- กำหนดระดับความยาก (1–5), คะแนน (Points), และ Coin ที่ต้องใช้ปลดคำใบ้ (RequiredCoins)
- **Search & Filter:** ค้นหาด้วย text, category (multi-select), tags, difficulty พร้อม pagination 20 ข้อต่อหน้า

### 2. ระบบ Quiz Control (Admin-driven)
- Admin เลือกคำถามจาก list หรือสุ่มด้วย filter แล้วกด Start
- ระบบ broadcast `question-started` ผ่าน Socket.io ไปทุก client ทันที
- **Answer Locking:** รับคำตอบจาก chat แบบ First-correct-wins เท่านั้น ด้วย `questionAnswered` flag
  - ตั้ง `true` เมื่อมีผู้ตอบถูกครั้งแรก
  - Reset เป็น `false` เมื่อ skip หรือเริ่มคำถามใหม่
- Admin ข้ามคำถามได้ด้วย Skip หรือกำหนดผู้ชนะด้วยตนเอง (Manual Winner)

### 3. ระบบ Gift & Hint
- `tiktok.adapter.js` รับ gift event → บันทึกลง `gift_log` collection
- คำนวณ coins: `count × diamondCount` ต่อ gift
- เมื่อยอด coins รวม (นับตั้งแต่เริ่มคำถาม) ถึง `requiredCoins` → unlock hint
- ผู้ส่ง gift ได้รับ points เท่ากับ coins ที่ส่ง (บันทึกลง `points_log` source=`gift`)

### 4. ระบบ Leaderboard
- ข้อมูลคะแนนทั้งหมดเก็บใน `points_log` collection
- รองรับ filter 6 ช่วงเวลา: session / daily / weekly / monthly / yearly / all-time
- Aggregate top 100 ด้วย MongoDB pipeline จัดกลุ่มตาม `tiktokId`
- Sync filter แบบ real-time ผ่าน `filter-changed` Socket event

---

## 🗄 Database Collections

### `questions`
| Field | Type | Description |
|---|---|---|
| `text` | String | โจทย์คำถาม |
| `options` | Array | ตัวเลือกคำตอบ (A, B, C, D) — optional |
| `answer` | String | คำตอบที่ถูกต้อง (lowercase trim) |
| `hint` | String | คำใบ้เมื่อปลดล็อกแล้ว |
| `category` | String | หมวดหมู่ (general, game, knowledge, entertainment) |
| `tags` | Array | แท็ก เช่น ["geography", "thailand"] |
| `difficulty` | Number | ระดับความยาก 1–5 |
| `points` | Number | คะแนนที่ได้เมื่อตอบถูก |
| `requiredCoins` | Number | Coins รวมที่ต้องถึงเพื่อปลดคำใบ้ |
| `createdAt` | Date | วันที่สร้าง |
| `updatedAt` | Date | วันที่แก้ไขล่าสุด |

### `points_log`
*บันทึกทุกครั้งที่ผู้เล่นได้รับคะแนน — ใช้ Aggregate เพื่อ query leaderboard ตามช่วงเวลา*

| Field | Type | Description |
|---|---|---|
| `tiktokId` | String | Unique ID ของผู้เล่นบน TikTok |
| `nickname` | String | ชื่อ TikTok ณ เวลานั้น |
| `points` | Number | คะแนนที่ได้ |
| `source` | String | `answer` หรือ `gift` |
| `sessionId` | String | ID ของรอบไลฟ์ (รูปแบบ `session_${timestamp}`) |
| `timestamp` | Date | เวลาที่ได้รับคะแนน |

### `gift_log`
*บันทึกข้อมูล gift ดิบ — ใช้คำนวณ hint progress*

| Field | Type | Description |
|---|---|---|
| `tiktokId` | String | ผู้ส่ง gift |
| `nickname` | String | ชื่อผู้ส่ง |
| `giftId` | Number | ID ของ gift |
| `giftName` | String | ชื่อ gift |
| `count` | Number | จำนวนที่ส่ง |
| `coinValue` | Number | ค่า diamonds ต่อชิ้น |
| `totalCoins` | Number | `count × coinValue` |
| `timestamp` | Date | เวลาที่ส่ง |

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

### Questions (`/api/questions`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | สร้างคำถามใหม่ (`text`, `answer` required) |
| `GET` | `/` | รายการทั้งหมด (query: search, category, tags, difficulty, page, limit) |
| `POST` | `/search` | ค้นหาด้วย body filter |
| `POST` | `/random` | สุ่มคำถามตาม body filter |
| `GET` | `/random` | สุ่มคำถามตาม query tags |
| `GET` | `/stats` | สถิติคำถาม (total, byCategory, avgDifficulty) |
| `GET` | `/filter-options` | distinct categories, tags, difficulties |
| `GET` | `/category/:category` | กรองตาม category |
| `GET` | `/by-tags` | กรองตาม tags (query: `tags[]`) |
| `GET` | `/:id` | ดูคำถามทีละข้อ |
| `PUT` | `/:id` | แก้ไขคำถาม |
| `DELETE` | `/:id` | ลบคำถาม |

### Quiz Control (`/api/quiz`)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/start` | `{ questionId }` | เริ่มคำถาม — broadcast `question-started` |
| `POST` | `/answer` | `{ tiktokId, nickname, answer }` | ตรวจคำตอบ |
| `POST` | `/skip` | — | ข้ามคำถาม — broadcast `question-skipped` |
| `POST` | `/set-winner` | `{ tiktokId, nickname, sessionId }` | กำหนดผู้ชนะด้วยตนเอง |
| `GET` | `/hint` | — | เช็ค hint unlock status |

### Leaderboard (`/api/leaderboard`)

| Method | Path | Query | Description |
|---|---|---|---|
| `GET` | `/` | `timeFilter`, `sessionId` | Top 100 leaderboard |
| `GET` | `/participants` | `sessionId` (required) | รายชื่อผู้เข้าร่วม (top 50 ตาม activity) |
| `GET` | `/stats/:tiktokId` | `timeFilter` | สถิติรายผู้เล่น |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Server + DB status |

---

## 🔄 Socket.io Events

### Frontend → Backend

| Event | Payload | Description |
|---|---|---|
| `connect-tiktok` | `{ username }` | เชื่อมต่อ TikTok Live |
| `disconnect-tiktok` | — | ตัดการเชื่อมต่อ |
| `set-session` | `{ sessionId }` | กำหนด sessionId ใหม่ (broadcast ไปทุก client) |
| `get-current-session` | — | ขอ sessionId ปัจจุบัน |
| `request-leaderboard` | `{ timeFilter, sessionId }` | ขอข้อมูล leaderboard |
| `filter-changed` | `{ timeFilter }` | เปลี่ยน filter (broadcast ไปทุก client) |
| `monitor-hint` | — | เริ่ม polling hint ทุก 5 วินาที |
| `check-tiktok-status` | — | ตรวจสอบสถานะ TikTok connection |
| `reset-hint-progress` | — | Reset hint progress bar บน overlay |

### Backend → Frontend

| Event | Payload | Description |
|---|---|---|
| `question-started` | `{ question, timestamp }` | คำถามใหม่เริ่มต้น |
| `answer-correct` | `{ tiktokId, nickname, points, answer, timestamp, manual? }` | มีผู้ตอบถูก |
| `answer-wrong` | `{ tiktokId, nickname, timestamp }` | ตอบผิด |
| `question-skipped` | `{ timestamp }` | ข้ามคำถาม |
| `hint-unlocked` | `{ questionId, hint, totalCoins, requiredCoins, timestamp }` | ปลดล็อกคำใบ้ |
| `hint-status` | `{ hintUnlocked, totalCoins, requiredCoins, progress }` | สถานะ hint progress |
| `reset-hint-progress` | — | Reset hint progress bar |
| `user-gift` | `{ tiktokId, nickname, giftName, count, coinValue, totalCoins }` | มีคนส่ง gift |
| `user-chat` | `{ tiktokId, nickname, message, timestamp }` | chat message |
| `user-follow` | `{ tiktokId, nickname, timestamp }` | มีคน follow |
| `leaderboard-update` | `[ ...players ]` | ข้อมูล leaderboard (array ตรง) |
| `session-set` | `{ sessionId }` | sessionId ถูก set แล้ว |
| `filter-changed` | `{ timeFilter }` | broadcast เมื่อ filter เปลี่ยน |
| `tiktok-connected` | `{ status, username, timestamp }` | เชื่อมต่อสำเร็จ |
| `tiktok-disconnected` | `{ username, timestamp }` | ตัดการเชื่อมต่อ |
| `tiktok-connection-result` | `{ success, error? }` | ผลการ connect (เฉพาะ socket ที่ร้องขอ) |
| `tiktok-status` | `{ status, username? }` | ผล `check-tiktok-status` |
| `tiktok-error` | `{ error }` | ข้อผิดพลาด TikTok connection |

---

## 📍 Frontend Pages

### 1. Home (`/`)
Navigation hub — ลิงก์ไปทุกหน้า

### 2. Admin Panel (`/admin`)
- เชื่อมต่อ / ตัด TikTok Live (สร้าง `sessionId` ใหม่อัตโนมัติเมื่อ connect)
- เลือกคำถามจาก list หรือสุ่มตาม filter แล้ว Start / Skip
- Manual winner selection จากรายชื่อผู้เข้าร่วม
- Mini leaderboard และ filter ตามช่วงเวลา

### 3. Question Manager (`/questions`)
- Full CRUD interface สำหรับ Admin
- Create/Edit ด้วย form (text, options, answer, hint, category, tags, difficulty, points, requiredCoins)
- Filter + Search + Pagination
- แสดงสถิติคำถาม (Stats)

### 4. Leaderboard (`/leaderboard`)
- Real-time top 100 — อัพเดททุก 5 วินาที
- Filter 6 ช่วงเวลา: Live / Today / Week / Month / Year / All-Time
- Sync filter กับ overlay และ client อื่น ๆ แบบ real-time

### 5. Overlay Display (`/overlay`)
- สำหรับ OBS Browser Source — แสดงคำถาม, hint progress, winner card
- แสดง difficulty stars ⭐, category, points
- Toggle แสดง/ซ่อนตัวเลือกคำตอบ
- Gift notifications (auto-dismiss 5 วินาที, max 5 รายการ)
- Winner card พร้อมแสดงคำตอบที่ถูก (auto-dismiss 5 วินาที)
- Leaderboard Top 5

### 6. Leaderboard Overlay (`/leaderboard-overlay`)
- Top 5 เท่านั้น — สำหรับ OBS Browser Source
- Transparent background
- Sync filter กับ leaderboard page

---

## 🚀 Running Locally

### Option A: Docker (แนะนำ)

```bash
cd tiktok-live-interactive-quiz
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# MongoDB:  localhost:27017
```

### Option B: Manual (ต้องมี MongoDB รันอยู่)

**Backend:**
```bash
cd backend
cp .env.example .env        # แก้ค่าใน .env ตามต้องการ
npm install
npm run dev                 # http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

### Seed ข้อมูลคำถาม

```bash
cd backend

# Option A: Seed 5 ตัวอย่าง
npm run seed

# Option B: Import จาก CSV
npm run seed:csv
```

### Environment Variables (backend `.env`)

```env
NODE_ENV=development
PORT=5000
HOST=localhost
MONGODB_URI=mongodb://localhost:27017/tiktok-quiz
MONGODB_DB=tiktok-quiz
CORS_ORIGIN=http://localhost:3000
```

---

## 📊 Data Flow

```
TikTok Live User
      │
      ├─ Chat (ตอบคำถาม)
      │         └─ tiktok.adapter → quiz.service.processAnswer()
      │                   ├─ ถูก → points_log (source=answer) → broadcast answer-correct
      │                   └─ ผิด → broadcast answer-wrong
      │
      └─ Gift
                └─ tiktok.adapter → quiz.repository.logGift() → gift_log
                          ├─ quiz.repository.addPoints() → points_log (source=gift)
                          ├─ quiz.service.checkHintCondition() → hint-unlocked?
                          └─ broadcast user-gift

Admin
      └─ POST /api/quiz/start → quiz.service.startQuestion()
                └─ broadcast question-started → Overlay, Leaderboard updates
```

---

## 🔮 Phase 1 Status

| Feature | Status |
|---|---|
| Backend Setup (Express, MongoDB, Socket.io) | ✅ |
| Frontend Setup (Next.js App Router) | ✅ |
| Docker Compose | ✅ |
| CRUD Questions | ✅ |
| Search & Filter + Pagination | ✅ |
| CSV Import (12,565+ questions) | ✅ |
| TikTok Live Integration | ✅ |
| Chat Answer Checking | ✅ |
| Answer Locking (1 winner per question) | ✅ |
| Gift & Hint System | ✅ |
| Real-time Leaderboard (6 time filters) | ✅ |
| Overlay (OBS) | ✅ |
| Leaderboard Overlay (OBS) | ✅ |
| Session Management | ✅ |
| Manual Winner Selection | ✅ |
| Standardized API Response Format | ✅ |

---

## 📄 MC Script

สคริปต์สำหรับ MC นำเสนอเกม: **[script-for-mc.md](../../script-for-mc.md)**

---

## 🔮 Future Enhancements

1. **Analytics Dashboard** — สถิติการเล่นรายละเอียด
2. **Customizable Styling** — Admin เปลี่ยน theme/สีได้
3. **Advanced Reports** — Export leaderboard เป็น CSV/JSON
4. **Performance Metrics** — Track question difficulty vs correct rate
5. **Multi-language Support** — รองรับหลายภาษา
6. **Image/Video Questions** — เพิ่มสื่อในคำถาม
