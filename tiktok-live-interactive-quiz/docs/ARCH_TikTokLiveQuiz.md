# 🏗 System Architecture Document

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

```
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
```

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
