const fs = require('fs');
const path = require('path');

// Format files
const files = {
  'API_TikTokLiveQuiz.md': formatAPI,
  'ARCH_TikTokLiveQuiz.md': formatARCH,
  'PRD_TikTokLiveQuiz.md': formatPRD,
  'README_TikTokLiveQuiz.md': formatREADME
};

function formatAPI(content) {
  let formatted = `# 📡 API Documentation

**TikTok Live Interactive Quiz**  
**Version:** 1.0 | **Base URL:** \`https://api.yourdomain.com/v1\`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [HTTP Status Codes](#http-status-codes)
4. [Quiz Management APIs](#quiz-management-apis)
5. [Error Handling](#error-handling)

---

## Overview

RESTful API สำหรับจัดการระบบ TikTok Live Interactive Quiz

### Base Configuration

| Item | Value |
|------|-------|
| **Base URL** | \`https://api.yourdomain.com/v1\` |
| **Protocol** | HTTPS (HTTP → Redirect) |
| **Format** | JSON |
| **Auth** | Bearer JWT Token |
| **Rate Limit** | 100 requests/minute per IP |
| **Versioning** | URL Path (/v1, /v2, ...) |

---

## Authentication

ทุก Request (ยกเว้น \`/auth\`) ต้องส่ง Authorization Header:

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### Login

\`\`\`
POST /auth/login
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "tiktok_username": "string",
  "password": "string"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "username": "tiktok_user",
      "tiktok_id": "123456"
    }
  }
}
\`\`\`

### Refresh Token

\`\`\`
POST /auth/refresh
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "refresh_token": "eyJhbGci..."
}
\`\`\`

---

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | สำเร็จ |
| **201** | Created | สร้างข้อมูลสำเร็จ |
| **400** | Bad Request | ข้อมูลที่ส่งมาไม่ถูกต้อง |
| **401** | Unauthorized | ไม่มี Token หรือ Token หมดอายุ |
| **403** | Forbidden | ไม่มีสิทธิ์เข้าถึง |
| **404** | Not Found | ไม่พบข้อมูล |
| **429** | Too Many Requests | เกิน Rate Limit |
| **500** | Server Error | เกิดข้อผิดพลาดในระบบ |

---

## Quiz Management APIs

### Create Quiz

\`\`\`
POST /quizzes
Content-Type: application/json
Authorization: Bearer {token}
\`\`\`

**Request Body:**
\`\`\`json
{
  "title": "Quiz ความรู้ทั่วไป",
  "description": "ทดสอบความรู้แบบสนุกสนาน",
  "questions": [
    {
      "question": "สตรีมเมอร์คนไหนที่เก่งที่สุด?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "points": 10
    }
  ]
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "quiz_id": "uuid",
  "message": "Quiz created successfully"
}
\`\`\`

---

## Error Handling

### Error Response Format

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-04-09T10:30:00Z"
}
\`\`\`

---

**Last Updated:** April 9, 2026  
**Maintainer:** TikTok Live Quiz Team
`;
  return formatted;
}

function formatARCH(content) {
  return `# 🏗 System Architecture Document

**TikTok Live Interactive Quiz**  
**Version:** 1.0 | **Date:** April 9, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)

---

## Architecture Overview

ระบบออกแบบด้วย **Microservices Architecture** โดยแบ่งออกเป็น 3 Layer หลัก:

- **Presentation Layer** - Frontend UI
- **Application Layer** - Business Logic
- **Data Layer** - Database & Cache

### Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│  ┌──────────────┐        ┌──────────────────────────┐   │
│  │ Streamer     │        │ OBS Overlay              │   │
│  │ Dashboard    │        │ (Browser)                │   │
│  │ (React.js)   │        │ ws://overlay.domain      │   │
│  └────┬─────────┘        └────────────┬─────────────┘   │
└───────┼────────────────────────────────┼─────────────────┘
        │ REST API / WebSocket           │ WebSocket
┌───────▼────────────────────────────────▼─────────────────┐
│              APPLICATION LAYER                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Quiz    │  │ API      │  │ TikTok WebSocket     │   │
│  │ Engine  │  │ Gateway  │  │ Bridge               │   │
│  │(Node.js)│  │(Express) │  │(tiktok-live-conn)    │   │
│  └────┬────┘  └────┬─────┘  └────────┬─────────────┘   │
└───────┼────────────┼─────────────────┼─────────────────┘
        │ Socket.io  │ REST API        │ WebSocket
┌───────▼────────────▼─────────────────▼─────────────────┐
│                  DATA LAYER                            │
│  ┌──────────────┐       ┌──────────────────────────┐   │
│  │ PostgreSQL   │       │ Redis Cache              │   │
│  │ (Persistent) │       │ (Session/Leaderboard)    │   │
│  └──────────────┘       └──────────────────────────┘   │
└────────────────────────────────────────────────────────┘
\`\`\`

---

## System Components

### Frontend

#### Streamer Dashboard (React.js)
- ✅ สร้าง/แก้ไข Quiz และ Question
- ✅ กด Start / Stop / Next Question
- ✅ ดู Real-time Analytics และ Leaderboard
- ✅ Socket.io Integration
- **Tech Stack:** React 18, TailwindCSS, Socket.io-client

#### OBS Browser Source Overlay
- ✅ แสดงคำถามแบบ Overlay บน Stream
- ✅ Real-time Leaderboard Top 10
- ✅ Animation Effects
- **Tech Stack:** HTML/CSS/Vanilla JS, WebSocket

### Backend

#### API Gateway (Express.js)
- ✅ REST API Management
- ✅ JWT Authentication
- ✅ Rate Limiting
- ✅ Request Routing
- **Tech Stack:** Express.js, helmet, cors, express-rate-limit

#### Quiz Engine (Node.js)
- ✅ Quiz Session Management
- ✅ Answer Processing & Scoring
- ✅ Timer Management
- ✅ WebSocket Broadcasting
- **Tech Stack:** Node.js, Socket.io, Bull Queue

#### TikTok WebSocket Bridge
- ✅ Real-time Comment Monitoring
- ✅ Answer Detection
- ✅ Event Publishing

### Database

#### PostgreSQL (Persistent Storage)
- ✅ Quiz & Question Data
- ✅ User Profile & Leaderboard
- ✅ Score History

#### Redis (Cache)
- ✅ Session Management
- ✅ Real-time Leaderboard
- ✅ Message Queue

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI Framework |
| **Frontend** | Socket.io | Real-time Communication |
| **Backend** | Node.js 20 | Runtime |
| **Backend** | Express.js | Web Framework |
| **Backend** | Socket.io | WebSocket Server |
| **Database** | PostgreSQL 15 | Primary DB |
| **Cache** | Redis 7 | In-Memory Store |
| **DevOps** | Docker | Containerization |
| **DevOps** | Docker Compose | Orchestration |

---

## Data Flow

1. **User Interaction:** Streamer กด "Start Quiz" ใน Dashboard
2. **Backend Processing:** Quiz Engine ประมวลผล Quiz Session
3. **Real-time Broadcast:** Socket.io broadcast ไปยัง Overlay
4. **TikTok Integration:** Monitor comments จาก TikTok Live
5. **Answer Processing:** Validate คำตอบและอัปเดท Leaderboard
6. **Database Update:** บันทึกผลลัพธ์ลง PostgreSQL

---

**Last Updated:** April 9, 2026  
**Architecture Version:** 1.0
`;
}

function formatPRD(content) {
  return `# 📋 Product Requirements Document

**TikTok Live Interactive Quiz**  
**Version:** 1.0 | **Date:** April 9, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Personas](#user-personas)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Success Criteria](#success-criteria)

---

## Project Overview

### Purpose

TikTok Live Interactive Quiz คือระบบ Quiz แบบ Real-time สำหรับ TikTok Live ที่ช่วยให้:

- 👤 **Streamer** สามารถสร้างและจัดการ Quiz ระหว่าง Live ได้
- 👥 **Viewers** ตอบคำถามผ่าน Comment ได้ทันที
- 🏆 **Community** มีความสนุกและมีส่วนร่วมมากขึ้น

### Scope

✅ ระบบสร้างและจัดการ Quiz สำหรับ Streamer  
✅ การรับ Comment จาก TikTok Live แบบ Real-time  
✅ การประมวลผลคำตอบและแสดงผลคะแนน  
✅ Leaderboard แสดงผลผู้ชนะ  
✅ Dashboard สำหรับ Streamer ควบคุม Quiz  

### Out of Scope

❌ ระบบ Payment / รางวัลเงินสด (Phase 2)  
❌ Mobile Application (Phase 2)  
❌ Platform อื่นนอกจาก TikTok  

---

## User Personas

### 1. Streamer (Host)

**Profile:**
- วัยทำงาน 18-40 ปี
- ทำ TikTok Live อย่างสม่ำเสมอ
- ต้องการเพิ่ม Engagement

**Goals:**
- ✅ สร้าง Quiz ได้ง่าย
- ✅ ควบคุม Quiz แบบ Real-time
- ✅ เห็นสถิติผู้ชม
- ✅ Leaderboard ชัดเจน

**Pain Points:**
- ❌ ไม่ต้องการ Setup ซับซ้อน
- ❌ ต้องการ UI สวยและเข้าใจง่าย
- ❌ ต้องการ Support ดี

### 2. Viewer (ผู้ชม)

**Profile:**
- Follower ของ Streamer
- มี Smartphone + TikTok Account
- ต้องการส่วนร่วมในการ Live

**Goals:**
- ✅ ตอบ Quiz ได้ง่าย
- ✅ เห็นคะแนนของตัวเอง
- ✅ เห็น Leaderboard

**Pain Points:**
- ❌ ไม่ต้องติดตั้งแอปเพิ่มเติม
- ❌ ต้องการ UX ที่ชัดเจน

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-----------|---------|----|
| FR-01 | Streamer สร้าง Quiz ก่อน Live | Must | Dashboard Feature |
| FR-02 | Multiple Choice Questions | Must | 4 ตัวเลือก (A/B/C/D) |
| FR-03 | Real-time Comment Monitor | Must | TikTok Integration |
| FR-04 | Answer Processing | Must | Auto-validate & Score |
| FR-05 | Leaderboard Display | Should | Real-time Update |
| FR-06 | Export Leaderboard | Nice | CSV Format |

---

## Non-Functional Requirements

| ID | Requirement | Metric |
|----|-----------|--------|
| NFR-01 | Response Time | < 500ms |
| NFR-02 | Uptime | 99.9% |
| NFR-03 | Concurrent Users | 10,000+ |
| NFR-04 | Data Security | JWT + HTTPS |
| NFR-05 | UI Responsiveness | < 100ms |

---

## Success Criteria

✅ 100% Quiz สร้างได้สำเร็จ  
✅ 95%+ Answer Processing Accuracy  
✅ < 500ms Leaderboard Update  
✅ 4.5+ ⭐ User Satisfaction  
✅ Zero Data Loss  

---

**Last Updated:** April 9, 2026  
**Status:** Draft  
**Next Review:** May 9, 2026
`;
}

function formatREADME(content) {
  return `# 📖 TikTok Live Interactive Quiz

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

\`\`\`bash
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
\`\`\`

---

## 📁 Project Structure

\`\`\`
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
\`\`\`

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
- \`POST /api/quizzes\` - Create Quiz
- \`GET /api/quizzes\` - Get All Quizzes
- \`GET /api/quizzes/:id\` - Get Specific Quiz
- \`PUT /api/quizzes/:id\` - Update Quiz
- \`DELETE /api/quizzes/:id\` - Delete Quiz

### Leaderboard
- \`GET /api/leaderboard\` - Get Leaderboard
- \`GET /api/leaderboard/:id\` - Get User Stats

### Health
- \`GET /api/health\` - Server Health Check

---

## 🌐 Environment Variables

\`\`\`env
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
\`\`\`

---

## 🧪 Testing

\`\`\`bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
\`\`\`

---

## 📱 OBS Integration

1. ✅ Open OBS Studio
2. ✅ Add new Browser Source
3. ✅ URL: \`http://localhost:3000/overlay\`
4. ✅ Width: 1280px, Height: 720px
5. ✅ Enable transparency

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push to branch (\`git push origin feature/amazing-feature\`)
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
`;
}

async function formatAllFiles() {
  console.log('🎨 Starting markdown formatting process...\n');
  
  let count = 0;
  for (const [filename, formatter] of Object.entries(files)) {
    try {
      const filepath = path.join(__dirname, filename);
      const content = fs.readFileSync(filepath, 'utf8');
      const formatted = formatter(content);
      
      fs.writeFileSync(filepath, formatted, 'utf8');
      console.log(`✅ Formatted: ${filename}`);
      count++;
    } catch (error) {
      console.error(`❌ Error formatting ${filename}:`, error.message);
    }
  }
  
  console.log(`\n✨ Formatting complete! ${count}/${Object.keys(files).length} files formatted.`);
}

formatAllFiles();
