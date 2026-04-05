# 🎮 TikTok Live Interactive Quiz System

เพิ่มความสนุกให้กับสตรีมวิดีโอ TikTok Live ด้วยระบบตอบคำถามแบบ Real-time ที่เชื่อมโยง Live Chat และ Monetization!

## ✨ ความสามารถหลัก

### 🎯 Connect: เชื่อมต่อ TikTok Live
- ระบบจับแชทจาก TikTok Live แบบ Real-time
- ตรวจจับของขวัญและนับเหรียญ
- ติดตามผู้ติดตามใหม่

### 📺 Overlay: แสดงผลบนหน้าจอ
- สตรีมเมอร์ควบคุมคำถามผ่าน Admin Panel
- ผู้ชมเห็นคำถามบนหน้าจอแบบ Real-time
- ایموจิ แอนิเมชันผู้ชนะและ Notifications

### 🚀 Logic: ระบบการให้คะแนน
- ตรวจสอบความถูกต้องของคำตอบอัตโนมัติ
- คำใบ้ปลดล็อกเมื่อมีเหรียญพอ
- บันทึกคะแนนใน Database
- Leaderboard ตามช่วงเวลา (Daily/Weekly/All-time)

---

## 🚀 Quick Start (Docker Recommended)

### ขั้นตอนที่ 1: Clone & Setup
```bash
cd tiktok-live-interactive-quiz

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### ขั้นตอนที่ 2: Start Services
```bash
# ใช้ Docker (ง่ายที่สุด)
docker-compose up -d

# หรือ start ด้วย npm (ต้องมี Node.js & MongoDB)
# Backend
cd backend && npm install && npm run dev

# Frontend (terminal ใหม่)
cd frontend && npm install && npm run dev
```

### ขั้นตอนที่ 3: Access URLs
- 🎬 **Admin Panel:** http://localhost:3000/admin
- 🖥️ **Overlay:** http://localhost:3000
- 🔌 **Backend API:** http://localhost:5000
- 📊 **Health Check:** http://localhost:5000/health

### ขั้นตอนที่ 4: สำหรับการแรกครั้ง
1. ไปที่ Admin Panel (http://localhost:3000/admin)
2. สร้างคำถามสักสองสาม
3. ป้อนชื่อ TikTok username และคลิก ✅
4. เพิ่ม Browser Source ใน OBS: http://localhost:3000
5. เลือกคำถางแล กดปุ่ม "Start"

---

## 📁 โครงสร้างโปรเจค

```
├── backend/                 # Node.js Express Server
│   ├── src/
│   │   ├── server.js       # Main entry point
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # Request handlers
│   │   └── routes/         # API endpoints
│   └── scripts/seed.js     # Database seeding
│
├── frontend/               # Next.js React App
│   ├── app/
│   │   ├── page.js        # Main overlay
│   │   ├── admin/page.js  # Admin panel
│   │   ├── components/    # UI components
│   │   └── styles/        # CSS styling
│
├── docs/                  # Documentation
└── docker-compose.yml     # Container orchestration
```

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Node.js + Express | 18 + 5.0 |
| **Frontend** | Next.js + React | 14 + 18 |
| **Database** | MongoDB | 6 |
| **Real-time** | Socket.io | 4.7 |
| **TikTok** | tiktok-live-connector | 4.10 |

---

## 📚 Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** - ติดตั้งและเริ่มใช้
- **[Architecture](./docs/ARCHITECTURE.md)** - โครงสร้างระบบและ Data Flow
- **[API Reference](./docs/API_REFERENCE.md)** - รายละเอียด API Endpoints
- **[Deployment](./docs/DEPLOYMENT.md)** - Deploy ไปยัง Production

---

## 🎯 Core Features

### 📝 Question Management
- Create, Read, Update, Delete คำถาม
- หมวดหมู่และระดับความยาก
- กำหนดคะแนนและเหรียญพื้นฐาน

### 💬 Chat Monitoring
- ดึงข้อความจาก TikTok Live
- ตรวจจับคำตอบอัตโนมัติ
- ตราบ "ผู้ชนะเป็นคนแรก"

### 🎁 Gift & Coin System
- นับเหรียญรวมจากของขวัญทั้งหมด
- ปลดล็อกคำใบ้เมื่อถึงเป้าหมาย
- ให้รางวัลผ่านจำนวน Coins

### 🏆 Leaderboard
- ดูอันดับผู้เล่นตามช่วงเวลา
- Session, Daily, Weekly, Monthly, Yearly, All-time
- เก็บประวัติคะแนนอย่างถาวร

---

## 🔌 API Endpoints

### Questions
```
POST   /api/questions           - Create question
GET    /api/questions           - Get all questions
GET    /api/questions/:id       - Get one question
PUT    /api/questions/:id       - Update question
DELETE /api/questions/:id       - Delete question
```

### Quiz
```
POST   /api/quiz/start          - Start question
POST   /api/quiz/answer         - Submit answer
POST   /api/quiz/skip           - Skip question
GET    /api/quiz/hint           - Check hint status
```

### Leaderboard
```
GET    /api/leaderboard         - Get top 100 players
GET    /api/stats/:tiktokId     - Get user stats
```

[📖 API docs อื่นๆ](./docs/API_REFERENCE.md)

---

## 🔌 Socket.io Events

### Server → Client
- `question-started` - แสดงคำถาม
- `answer-correct` - ประกาศผู้ชนะ
- `hint-unlocked` - ปลดล็อกคำใบ้
- `user-gift` - ได้รับของขวัญ
- `question-skipped` - ข้ามคำถาม

### Client → Server
- `connect-tiktok` - เชื่อมต่อ TikTok
- `set-session` - กำหนด Session
- `monitor-hint` - ติดตามคำใบ้

[🔌 Socket.io docs อื่นๆ](./docs/ARCHITECTURE.md#socketio-events)

---

## 🎓 Usage Example

### สร้างคำถาม
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "text": "ฟิลิปปินส์ตั้งอยู่ที่ไหน?",
    "answer": "Southeast Asia",
    "hint": "อยู่ทางตะวันออกเฉียงใต้ของเอเชีย",
    "category": "Geography",
    "points": 10,
    "requiredCoins": 100
  }'
```

### เริ่มสอบถาม
```bash
curl -X POST http://localhost:5000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{"questionId": "YOUR_QUESTION_ID"}'
```

### ตำนวนตัดสิน
```bash
curl -X POST http://localhost:5000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -d '{
    "tiktokId": "user123",
    "nickname": "username",
    "answer": "Southeast Asia"
  }'
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📋 Requirements

- **Node.js:** 18+
- **MongoDB:** 5+ (or use MongoDB Atlas)
- **Docker:** (optional, for containerization)
- **TikTok Account:** (for live streaming)

---

## ⚙️ Environment Setup

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tiktok-quiz
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 mongo:6
```

### Socket.io Not Connecting
- Check if backend is running: http://localhost:5000/health
- Verify CORS_ORIGIN matches frontend URL
- Check browser console for errors (F12)

### Questions Not Loading
```bash
# Seed sample questions
cd backend && node scripts/seed.js
```

[📖 Troubleshooting docs อื่นๆ](./docs/GETTING_STARTED.md#common-issues--fixes)

---

## 📈 Performance

- ⚡ Real-time updates via Socket.io
- 🚀 Database indexes optimized
- 📦 Frontend optimized with Next.js
- 🔄 Auto-reconnection on disconnect

---

## 🔒 Security

Current implementation supports:
- Input validation
- MongoDB connection security
- CORS configuration
- Environment variable protection

For production, add:
- Authentication (JWT)
- Rate limiting
- HTTPS/SSL
- Enhanced validation

[🔒 Security details](./docs/DEPLOYMENT.md#security-hardening)

---

## 📄 License

MIT © 2024

---

## 🙏 Support

Need help? Check out:
- [Getting Started Guide](./docs/GETTING_STARTED.md)
- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)

---

## 🎉 Features Coming Soon

- 👥 User authentication & profiles
- 🎨 Custom themes & branding
- 📊 Advanced analytics & reports
- 🏅 Achievement system
- 💰 Payment integration
- 📱 Mobile app
- 🌍 Multi-language support

---

## 💡 Tips for Streaming

1. **Test First:** ทดลองด้วย localhost ก่อนดำเนินการสด
2. **Prepare Questions:** เตรียมคำถามมากมายก่อนสตรีม
3. **Engage Viewers:** ขอให้ผู้ชมตอบคำถามในแชท
4. **Track Points:** จดหมายเหตุคะแนนผู้นำแล้วประกาศ
5. **Have Fun:** ความสนุกกระจายไปหา Viewers!

---

**สมัครเรียนสำหรับการพยากรณ์อัปเดต!** 🎮✨

---

**Made with ❤️ for TikTok Live Streamers**
