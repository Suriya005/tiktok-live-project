# 📖 TikTok Live Interactive Quiz

> 🎮 Real-time Interactive Quiz System สำหรับ TikTok Live Streaming

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/yourrepo)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node](https://img.shields.io/badge/node-20.x-brightgreen)](https://nodejs.org)

---

## 📌 About This Project

ระบบ Interactive Quiz สำหรับ TikTok Live แบบ Real-time ที่ช่วยให้:

- 🎯 **Streamer** สามารถสร้างและควบคุม Quiz ระหว่าง Live ได้
- 💬 **Viewers** ตอบ Quiz ผ่าน Comment โดยพิมพ์ A/B/C/D
- 🏆 **Leaderboard** แสดงผลผู้ชนะแบบ Real-time บน OBS Overlay
- ⚡ **Engagement** เพิ่มความมีส่วนร่วมของผู้ชม

---

## 🚀 Quick Start

### Prerequisites

| Software | Version | Link |
|----------|---------|------|
| **Node.js** | 20.x LTS | https://nodejs.org |
| **npm** | 10.x+ | Built-in with Node.js |
| **Docker** | 24.x+ | https://docker.com |
| **Git** | 2.x+ | https://git-scm.com |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourrepo/tiktok-live-quiz.git
cd tiktok-live-quiz

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Run with Docker
docker-compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# API Docs: http://localhost:5000/api/docs
```

---

## 📁 Project Structure

```
tiktok-live-quiz/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── api/               # Express Routes
│   │   ├── services/          # Business Logic
│   │   │   ├── quizEngine.js  # Quiz Logic
│   │   │   └── tiktokBridge.js# TikTok Integration
│   │   ├── models/            # Database Models
│   │   ├── middleware/        # Auth & Validation
│   │   └── config/            # Configuration
│   ├── prisma/                # Database Schema
│   └── package.json           # Dependencies
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── pages/             # React Pages
│   │   ├── components/        # UI Components
│   │   ├── services/          # API Services
│   │   └── styles/            # Styling
│   ├── public/                # Static Assets
│   └── package.json
│
├── docs/                       # Documentation
│   ├── API_REFERENCE.md       # API Docs
│   ├── ARCHITECTURE.md        # System Design
│   └── SETUP_GUIDE.md         # Setup Instructions
│
├── docker-compose.yml         # Docker Configuration
└── README.md                  # This file
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI Framework
- **TailwindCSS** - Styling
- **Socket.io-client** - Real-time Communication
- **Vite** - Build Tool

### Backend
- **Node.js 20** - Runtime
- **Express.js** - Web Framework
- **Socket.io** - WebSocket Server
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Cache

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration

---

## 📚 Features

### ✅ Streamer Features
- 📝 Create Quiz & Questions
- ⏱️ Start / Stop / Next Question
- 👥 View Real-time Leaderboard
- 📊 Analytics Dashboard
- 🔄 Live Question Management

### ✅ Viewer Features
- 💬 Answer via TikTok Comment
- 🎯 Instant Score Display
- 🏆 Leaderboard Position
- ⭐ Rank & Points Tracking

### ✅ System Features
- 🔐 JWT Authentication
- ⚡ Real-time WebSocket Communication
- 📱 OBS Browser Source Integration
- 🚀 Auto-scaling Ready
- 🛡️ Rate Limiting & Security

---

## 📖 Documentation

- 📡 [API Reference](./docs/API_REFERENCE.md) - Complete API Documentation
- 🏗️ [System Architecture](./docs/ARCHITECTURE.md) - Detailed System Design
- 📋 [Product Requirements](./docs/PRD.md) - Product Specification
- 🔧 [Setup Guide](./docs/SETUP_GUIDE.md) - Detailed Installation

---

## 🔗 API Endpoints

### Quiz Management
- `POST /api/quizzes` - Create Quiz
- `GET /api/quizzes` - Get All Quizzes
- `GET /api/quizzes/:id` - Get Specific Quiz
- `PUT /api/quizzes/:id` - Update Quiz
- `DELETE /api/quizzes/:id` - Delete Quiz

### Leaderboard
- `GET /api/leaderboard` - Get Leaderboard
- `GET /api/leaderboard/:id` - Get User Stats

### Health
- `GET /api/health` - Server Health Check

---

## 🌐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_db

# Redis
REDIS_URL=redis://localhost:6379

# TikTok
TIKTOK_API_KEY=your_api_key
TIKTOK_ROOM_ID=your_room_id

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=1h

# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📱 OBS Integration

1. ✅ Open OBS Studio
2. ✅ Add new Browser Source
3. ✅ URL: `http://localhost:3000/overlay`
4. ✅ Width: 1280px, Height: 720px
5. ✅ Enable transparency

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- 🐛 **Issues:** [GitHub Issues](https://github.com/yourrepo/issues)
- 💬 **Discord:** [Join Our Server](https://discord.gg/yourserver)
- 📧 **Email:** support@example.com

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- ✅ Basic Quiz System
- ✅ TikTok Integration
- ✅ Leaderboard
- ✅ OBS Overlay

### Phase 2 (Q2 2026)
- 🔲 Payment System
- 🔲 Rewards Management
- 🔲 Advanced Analytics
- 🔲 Mobile App

### Phase 3 (Q3 2026)
- 🔲 Multi-platform Support
- 🔲 AI-powered Recommendations
- 🔲 Social Sharing

---

## 📊 Stats

- ⭐ **Stars:** TBD
- 🍴 **Forks:** TBD
- 👥 **Contributors:** TBD
- 📦 **Versions:** 1.0.0

---

**Last Updated:** April 9, 2026  
**Maintained by:** TikTok Live Quiz Team  
**Status:** 🟢 Active Development
