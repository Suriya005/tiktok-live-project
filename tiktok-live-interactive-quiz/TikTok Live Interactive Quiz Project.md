# 🎮 TikTok Live Interactive Quiz Project

โปรเจคสร้างระบบกิจกรรมตอบคำถามบน TikTok Live แบบ Real-time ที่เชื่อมโยงการแชท (Engagement) และการส่งของขวัญ (Monetization) เพื่อเพิ่มความสนุกและการมีส่วนร่วมให้กับสตรีมเมอร์

---

## 🛠 Tech Stack
- **Frontend:** Next.js (App Router)
- **Backend:** Node.js (Express)
- **Database:** MongoDB
- **Real-time:** Socket.io (สำหรับส่งข้อมูลไปยัง Overlay)
- **Integration:** `tiktok-live-connector` (Node.js)

---

## 📋 Core Features

### 1. ระบบจัดการคำถาม (Question CRUD Management)
- **Create:** สร้างคำถามใหม่โดย Admin
- **Read:** ดูรายชื่อคำถามทั้งหมดหรือค้นหาตามเงื่อนไข
- **Update:** แก้ไขคำถาม คำตอบ, คำใบ้, แท็ก, และคะแนน
- **Delete:** ลบคำถามออกจากระบบ
- รองรับคำถามรูปแบบ **Text-only** เท่านั้น
- จัดหมวดหมู่ได้ (Category) เช่น ทั่วไป, เกม, ความรู้รอบตัว
- ใช้ **Tags** เพื่อจำแนกประเภทคำถาม (เช่น #ภูมิศาสตร์ #ประวัติศาสตร์ #วิทยาศาสตร์)
- กำหนดระดับความยาก (Difficulty Level)
- กำหนดคะแนนพื้นฐานสำหรับข้อนั้นๆ (Base Points)

### 2. ระบบเลือกและสุ่มคำถาม (Question Selection)
- **Random:** สุ่มคำถามจากทั้งระบบโดยไม่มีเงื่อนไข
- **Tag-based:** เลือกคำถามจากแท็กเฉพาะที่ต้องการ (เช่น "เลือกเฉพาะคำถาม #ภูมิศาสตร์")
- **Search & Filter:** ค้นหาโดย text content, category, tags, difficulty ด้วย AND logic (ต้องตรงทั้งหมด)
- **Pagination:** โหลดคำถามแบบ 20 ข้อต่อครั้ง เพื่อประสิทธิภาพ
- ไม่ให้ซ้ำคำถามที่เล่นไปแล้วในรอบเดียวกัน

### 3. ระบบแสดงระดับความยากและคำตอบ (Difficulty & Answer Display)
- **Difficulty Stars:** แสดง ⭐⭐⭐ บนหน้า Overlay เพื่อให้ผู้ชมรู้ว่าคำถามนี้ยากแค่ไหน
- **Difficulty Points:** คะแนนที่ได้จะขึ้นอยู่กับระดับความยาก (ยากเท่าไหร่ = แต้มก็เยอะขึ้น)
- **Answer Display in Winner Card:** แสดงคำตอบที่ถูกต้องเมื่อมีผู้ชนะ โดยใช้ fallback chain: `winner.answer || currentQuestionData?.answer || 'N/A'`

### 4. ระบบตรวจสอบคำตอบและป้องกันการลอก (Chat Monitoring & Answer Locking)
- ดึงข้อมูลแชทจาก TikTok Live แบบ Real-time (Mock ขณะนี้)
- **Answer Locking Mechanism:** ระบบบันทึก `questionAnswered = true` เมื่อมีผู้ตอบถูก ป้องกันหลายคนตอบได้ในคำถามข้อเดียวกัน
  - Backend เช็ก `if (questionAnswered)` ก่อนอนุญาตให้ตอบ
  - Manual winner selection ด้วยตรวจสอบเดียวกัน
  - Reset `questionAnswered = false` เมื่อข้ามไปคำถามข้อต่อไป
- ตรวจหาผู้ชนะ: คนแรกที่พิมพ์คำตอบได้ถูกต้องจะได้รับคะแนนไป

### 5. ระบบคำใบ้และของขวัญ (Gift & Hint System)
- **Coin Accumulation:** ระบบจะนับยอด Coin รวมจากของขวัญทุกประเภท (ไม่เจาะจงชนิด)
- **Hint Trigger:** เมื่อยอด Coin รวมถึงเป้าหมายที่ตั้งไว้ ระบบจะแสดงคำใบ้ (Hint) บนหน้าจอทันที
- **Gift Reward:** คนส่งของขวัญจะได้รับแต้มด้วย โดยคำนวณจาก `จำนวน Coin x ตัวคูณ (Default *1)`
- **Hint Content:** แสดง `hint` field ของคำถามปัจจุบัน เพื่อช่วยให้ผู้ชมตอบได้แม่นยำขึ้น

### 6. ระบบคะแนนและ Leaderboard (Advanced Scoring)
- **Persistent Storage:** เก็บแต้มถาวรลง Database
- **Time-based Filtering:** สามารถดูอันดับคะแนนแยกตามช่วงเวลาได้:
  - รอบไลฟ์ (Current Session)
  - รายวัน (Daily)
  - รายสัปดาห์ (Weekly)
  - รายเดือน (Monthly)
  - รายปี (Yearly)
  - คะแนนรวมทั้งหมด (All-time)

---

## 🗄 Database Schema Design

### Questions Collection
| Field | Type | Description |
|---|---|---|
| text | String | โจทย์คำถาม |
| options | Array | ตัวเลือกคำตอบ (A, B, C, D) |
| answer | String | คำตอบที่ถูกต้อง (เก็บไว้สำหรับแสดงผล) |
| hint | String | คำใบ้ |
| category | String | หมวดหมู่ |
| tags | Array | แท็กเพื่อจำแนกประเภท (เช่น ["ภูมิศาสตร์", "ยาก"]) |
| difficulty | Number | ระดับความยาก (1-5) |
| points | Number | คะแนนที่จะได้รับเมื่อตอบถูก |
| requiredCoins | Number | จำนวน Coin ที่ต้องมียอดรวมถึงเพื่อปลดคำใบ้ |
| createdAt | Date | วันที่สร้าง |
| updatedAt | Date | วันที่แก้ไขล่าสุด |

### PointsLog Collection
*ใช้สำหรับเก็บประวัติเพื่อให้ Query Leaderboard ตามช่วงเวลาได้แม่นยำ*
| Field | Type | Description |
|---|---|---|
| tiktokId | String | ID ของผู้เล่น |
| nickname | String | ชื่อใน TikTok ณ ตอนนั้น |
| points | Number | จำนวนแต้มที่ได้ (+/-) |
| source | String | แหล่งที่มา (answer / gift) |
| timestamp | Date | วันที่และเวลาที่ได้รับแต้ม |
| sessionId | String | ID ของรอบการไลฟ์นั้นๆ |

---

## 🚀 Phase 1: MVP Goals (เป้าหมายแรก)
1. ✅ **Backend Setup:** Express server, MongoDB connection, Socket.io
2. ✅ **Frontend Setup:** Next.js with App Router
3. ✅ **Docker:** All services containerized and running
4. ✅ **CRUD Questions:** Create, Read, Update, Delete คำถาม
5. ✅ **Question Selection:** Random, Tag-based, Search & Filter, Pagination
6. ✅ **Frontend Pages:** Home, Admin Panel, Question Manager, Leaderboard
7. ✅ **Chat Monitoring:** ตรวจคำตอบและบันทึกแต้ม
8. ✅ **Answer Checking:** ตรวจคำตอบและบันทึกแต้ม
9. ✅ **Answer Locking:** ป้องกันหลายคนตอบถูกข้อเดียวกัน (1 winner per question)
10. ✅ **Real-time Leaderboard:** Socket.io with time-based filtering
11. ✅ **Overlay Support:** Top 5 leaderboard widget สำหรับ OBS integration (แสดง/ซ่อนตัวเลือกคำตอบได้)
12. ✅ **Difficulty Display:** แสดง ⭐ ระดับความยากบนหน้า Overlay
13. ✅ **Answer Display:** แสดงคำตอบที่ถูกต้องในการ์ดผู้ชนะ
14. ✅ **Gift Point System:** บันทึก Gift scores พร้อม sessionId
15. ✅ **Session Management:** Auto-generate sessionId on TikTok connect
16. ✅ **MC Script:** สคริปต์เต็มสำหรับ MC ในการนำเสนอเกม

## 📍 Frontend Pages

### 1. **Home Page** (`/`)
- Navigation hub สำหรับเข้าถึงหน้าต่าง ๆ
- Feature showcase
- Quick links to Overlay, Admin Panel, Leaderboard, Leaderboard Overlay

### 2. **Overlay Display** (`/overlay`)
- แสดงคำถามปัจจุบัน (Current Question) พร้อมระดับความยาก ⭐
- **Toggle ตัวเลือกคำตอบ:** ปุ่ม "แสดง/ซ่อนตัวเลือกคำตอบ" บนหน้า Overlay
- แสดงคำตอบและคะแนนหลังมีผู้ชนะ (Winner notification) พร้อม auto-dismiss ใน 5 วินาที
- Hint display with coin progress bar
- Gift notifications with 5-second auto-dismiss (max 5 visible)
- Category and points display
- Connection status indicator (Connected/Disconnected)

### 3. **Admin Panel** (`/admin`)
- TikTok Live connection control (generates new sessionId on connect)
- Session management and display
- Question list & quiz control
- Start/skip question functionality
- Hint monitoring and control
- Top 5 mini leaderboard display
- TikTok connection status indicator with disconnect notification
- Top 100 leaderboard display with time-based filtering
- Split-screen layout for efficient management

### 4. **Question Manager** (`/questions`)
- Full CRUD interface for questions
- Create new questions with:
  - Text content
  - Multiple choice options (A, B, C, D)
  - Categories (General, Game, Knowledge, Entertainment)
  - Tags for organization
  - Difficulty levels (1-5)
  - Points and coin requirements
  - Hints
- Edit existing questions
- Delete questions with confirmation
- Filter by category and tags
- Display question statistics

### 5. **Leaderboard Page** (`/leaderboard`)
- Real-time leaderboard with 6 time-based filters:
  - 🔴 Live (Current session)
  - 📅 Today (Daily ranking)
  - 📊 Week (Weekly ranking)
  - 📈 Month (Monthly ranking)
  - 📗 Year (Yearly ranking)
  - 🏆 All-Time (Historical ranking)
- Auto-clears and refreshes when changing filters
- Auto-update every 5 seconds
- Display columns:
  - Rank (#1, #2, etc.)
  - Player nickname
  - Total points (sum of answer + gift scores)
  - Questions answered count
- Connected clients sync filter changes in real-time

### 6. **Leaderboard Overlay** (`/leaderboard-overlay`)
- Top 5 display only
- Transparent background for OBS Browser Source integration
- Semi-transparent dark background with blur effect
- Synchronized filter with main leaderboard page
- Real-time updates every 5 seconds
- Minimal design to avoid covering main stream content
- Gold/Silver/Bronze styling for top 3 ranks
- High visibility emojis and icons
- Perfect for Stream Deck or OBS integration

---

## 🔄 Real-time Features

### Socket.io Events

**Frontend → Backend:**
- `connect-tiktok`: เชื่อมต่อ TikTok Live (`{ username }`)
- `disconnect-tiktok`: ตัดการเชื่อมต่อ TikTok Live
- `set-session`: กำหนด sessionId ใหม่ (`{ sessionId }`) → broadcast ไปทุก client
- `get-current-session`: ขอ sessionId ปัจจุบัน (สำหรับ Overlay ตอน load)
- `request-leaderboard`: ขอข้อมูล leaderboard พร้อม filter (`{ timeFilter, sessionId }`)
- `filter-changed`: ส่งการเปลี่ยน filter จาก leaderboard page (`{ timeFilter }`)
- `monitor-hint`: เริ่ม polling ตรวจสอบ hint unlock ทุก 5 วินาที
- `check-tiktok-status`: ตรวจสอบสถานะการเชื่อมต่อ TikTok Live

**Backend → Frontend:**
- `session-set`: แจ้ง sessionId ใหม่ (`{ sessionId }`) — broadcast หรือ to socket
- `leaderboard-update`: ส่งข้อมูล leaderboard ที่อัพเดท
- `filter-changed`: แจ้งเมื่อมีการเปลี่ยน filter (broadcast ไปทุก client)
- `question-started`: เมื่อคำถามใหม่เริ่มต้น (`{ question: { text, category, points, requiredCoins, options, difficulty, hint, answer }, timestamp }`)
- `answer-correct`: เมื่อตรวจคำตอบถูกต้อง (`{ tiktokId, nickname, points, answer, timestamp, manual? }`)
- `answer-wrong`: เมื่อตรวจคำตอบผิด (`{ tiktokId, nickname, timestamp }`)
- `user-gift`: เมื่อมีคนส่งของขวัญ (`{ tiktokId, nickname, giftName, count, coinValue, totalCoins }`)
- `user-chat`: เมื่อมี chat message จาก TikTok Live
- `user-follow`: เมื่อมีคนกด Follow
- `hint-unlocked`: เมื่อปลดล็อกคำใบ้ (`{ questionId, hint, totalCoins, requiredCoins, timestamp }`)
- `hint-status`: ส่งสถานะ hint progress (`{ hintUnlocked, totalCoins, requiredCoins, progress }`)
- `question-skipped`: เมื่อข้ามคำถาม (`{ timestamp }`)
- `reset-hint-progress`: เมื่อเริ่มคำถามใหม่หรือมีผู้ชนะ ให้ reset hint progress bar
- `tiktok-connected`: เมื่อเชื่อมต่อ TikTok Live สำเร็จ (`{ status, username, timestamp }`)
- `tiktok-disconnected`: เมื่อตัดการเชื่อมต่อ TikTok Live (`{ timestamp }`)
- `tiktok-connection-result`: ผลลัพธ์การ connect (`{ success, error? }`) — ส่งเฉพาะ socket ที่ร้องขอ
- `tiktok-status`: สถานะ TikTok Live ตอบกลับ `check-tiktok-status` (`{ status, username? }`)
- `tiktok-error`: เมื่อเกิด error ในการเชื่อมต่อ TikTok Live

### Session Management
- **Auto-generate sessionId:** เมื่อ admin กด "Connect TikTok Live" ระบบจะสร้าง `session_${Date.now()}` ใหม่
- **Broadcast to all:** sessionId ถูก broadcast ไปให้ทุก connected clients รู้
- **Per-socket filter:** Backend เก็บ `currentTimeFilter` แยกต่อ socket connection
- **Gift points tracking:** ทุก gift score ถูกบันทึกพร้อม sessionId เพื่อให้สามารถフィルต์ได้

### Filter Synchronization
- **Leaderboard page** เมื่อเปลี่ยน filter → emit `filter-changed` event
- **Backend broadcast:** รับแล้ว broadcast ให้ทุก clients รู้
- **Overlay sync:** listen `filter-changed` → update `timeFilter` state → ส่ง request ใหม่ → display Top 5 ตามเลือก

---

## ✨ Key Improvements & Architecture

### State Management
- **Global TikTok Status:** Backend เก็บ `tiktokStatus` สำหรับทุก socket ให้รู้สถานะการเชื่อมต่อ
- **Question Answer State:** Backend เก็บ `questionAnswered` flag เพื่อป้องกันหลายคนตอบถูกข้อเดียวกัน
  - ตั้ง `true` เมื่อมีผู้ตอบถูก
  - ตั้ง `false` เมื่อเริ่มคำถามใหม่ (skipQuestion)
- **Current Question Data:** Frontend Frontend เก็บ `currentQuestionData` เพื่อเข้าถึง difficulty, hint, answer แม้หลัง currentQuestion ถูก reset
- **Per-socket Filter:** แต่ละ socket ที่เชื่อมต่อมี filter state เป็นของตัวเอง
- **Session-based grouping:** ข้อมูลจัดกลุ่มตาม sessionId เพื่อให้ query ได้เฉพาะรอบไลฟ์นั้นๆ

### Performance Optimizations
- **5-second polling:** Leaderboard และ overlay update ทุก 5 วินาที (ปรับได้)
- **Socket cleanup:** ใช้ named handler functions เพื่อ proper cleanup ป้องกัน memory leaks
- **Early returns:** Skip processing เมื่อ socket ยังไม่พร้อมหรือ sessionId ยังไม่ได้รับ
- **Selective broadcasting:** เฉพาะ filter-changed events ถูก broadcast ไปทุก client

### Data Persistence
- **MongoDB schemas:** Questions, PointsLog (with sessionId), GiftLog
- **Index on sessionId:** เร็วในการ filter ข้อมูลตام session
- **Timestamp tracking:** ทุก event บันทึก timestamp เพื่อให้ filter ตามช่วงเวลาได้

### API Endpoints (`/api/`)

**Questions:**
- `POST /questions` — สร้างคำถามใหม่ (text, answer required)
- `GET /questions` — ดูรายการทั้งหมดพร้อม query filter (search, category, tags, difficulty, page, limit)
- `POST /questions/search` — ค้นหาด้วย body filter
- `POST /questions/random` — สุ่มคำถามตาม filter
- `GET /questions/stats` — สถิติคำถาม (จำนวน, by category, avg difficulty)
- `GET /questions/filter-options` — ดึง distinct categories, tags, difficulties
- `GET /questions/by-tags` — กรองตาม tags
- `GET /questions/category/:category` — กรองตาม category
- `GET /questions/:id` — ดูคำถามทีละข้อ
- `PUT /questions/:id` — แก้ไขคำถาม
- `DELETE /questions/:id` — ลบคำถาม

**Quiz Control:**
- `POST /quiz/start` — เริ่มคำถาม (`{ questionId }`)
- `POST /quiz/answer` — ส่งคำตอบ (`{ tiktokId, nickname, answer }`)
- `POST /quiz/skip` — ข้ามคำถาม
- `GET /quiz/hint` — เช็ค hint unlock status
- `POST /quiz/set-winner` — กำหนดผู้ชนะด้วยตนเอง (`{ tiktokId, nickname, sessionId }`)

**Leaderboard & Stats:**
- `GET /leaderboard` — อันดับ top 100 (`?timeFilter=&sessionId=`)
- `GET /stats/:tiktokId` — สถิติรายผู้เล่น
- `GET /participants` — รายชื่อผู้เข้าร่วมใน session (`?sessionId=`)

**Health:**
- `GET /health` — ตรวจสอบสถานะ server

---

## 🚀 Deployment & Usage

### Running the Project
```bash
# Start all services with Docker
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Pages URLs
- **Home:** `http://localhost:3000/`
- **Admin Panel:** `http://localhost:3000/admin`
- **Questions:** `http://localhost:3000/questions`
- **Leaderboard:** `http://localhost:3000/leaderboard`
- **Leaderboard Overlay:** `http://localhost:3000/leaderboard-overlay`
- **Overlay Display:** `http://localhost:3000/overlay`

### OBS Integration (Leaderboard Overlay)
1. Open OBS
2. Add Browser Source
3. URL: `http://localhost:3000/leaderboard-overlay`
4. Resolution: 400x300 (recommended)
5. Enable transparency support
6. Position as widget on stream

---

## 📊 Data Flow Diagram

```
TikTok Live User
        ↓
   Gift / Chat
        ↓
tiktok-live-connector (Backend)
        ↓
    Socket.io Event
        ↓
    Backend Processing
        ↓
    MongoDB Storage (PointsLog)
        ↓
    Real-time Broadcast
        ↓
   Frontend Updates (Socket.io)
        ↓
  Display: Leaderboard / Overlay
```

## 📄 MC Script for Broadcast

เอกสารสคริปต์เต็มสำหรับ MC ในการนำเสนอเกมบน TikTok Live หาได้ที่:
**[script-for-mc.md](../../script-for-mc.md)**

### Script Contents:
- **Opening & Closing Speech:** ต้อนรับปิดท้ายเกม
- **How to Play:** ชี้แจงกติกากับผู้ชม
- **Pre-Game Hype:** สร้าง Excitement ก่อนเริ่ม
- **During Question:** ประโยคเสริมขณะถามคำถาม
- **Winner Moment:** ประโยคเมื่อมีผู้ชนะ
- **Hint Unlock:** คำอธิบายการปลดล็อกคำใบ้ผ่านของขวัญ
- **Ad-libs:** ประโยคเสริมเพื่อเพิ่มความสนุก

### Key Points in Script:
- ⭐ **Difficulty Stars:** อธิบายว่าดาวเท่าไหร่ = ยากเท่าไหร่
- ✅ **Answer Format:** ผู้ชมต้องพิมคำตอบจริง ไม่ใช่ตัวเลือก (ก ข ค ง)
- 🎁 **Gift System:** การส่งของขวัญช่วยปลดล็อกคำใบ้
- 📊 **Leaderboard Tracking:** ติดตามคะแนนผู้ชมอยู่ตลอด

---

## 🔮 Future Enhancements

1. **Analytics Dashboard:** ดูสถิติการเล่นรายละเอียด
2. **Customizable Styling:** ให้ admin เปลี่ยน theme และสี
3. **Mobile App:** Cross-platform quiz playing
4. **Rewards System:** ใจ้กำหนดรางวัลสำหรับผู้ชนะ
5. **Advanced Reports:** Export leaderboard เป็น CSV/JSON
6. **Performance Metrics:** Track question difficulty vs correct rate
7. **Multi-language Support:** รองรับหลายภาษา
8. **Video Integration:** เพิ่มภาพ/วิดีโอในคำถาม