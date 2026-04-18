# 📡 API Documentation

**TikTok Live Interactive Quiz**  
**Version:** 1.0 | **Base URL:** `https://api.yourdomain.com/v1`

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
| **Base URL** | `https://api.yourdomain.com/v1` |
| **Protocol** | HTTPS (HTTP → Redirect) |
| **Format** | JSON |
| **Auth** | Bearer JWT Token |
| **Rate Limit** | 100 requests/minute per IP |
| **Versioning** | URL Path (/v1, /v2, ...) |

---

## Authentication

ทุก Request (ยกเว้น `/auth`) ต้องส่ง Authorization Header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Login

```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "tiktok_username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
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
```

### Refresh Token

```
POST /auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGci..."
}
```

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

```
POST /quizzes
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
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
```

**Response (201 Created):**
```json
{
  "success": true,
  "quiz_id": "uuid",
  "message": "Quiz created successfully"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-04-09T10:30:00Z"
}
```

---

**Last Updated:** April 9, 2026  
**Maintainer:** TikTok Live Quiz Team
