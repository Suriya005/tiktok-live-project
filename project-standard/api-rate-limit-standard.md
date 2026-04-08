# API Rate Limit Standard

มาตรฐานการควบคุมปริมาณการเรียกใช้งาน (Rate Limiting) เพื่อป้องกัน Brute Force และ DoS

---

## 1. ค่ามาตรฐาน (Default Limits)

**Scope:** ใช้ IP Address เป็นตัวระบุ (Default) — สำหรับ Authenticated API สามารถใช้ User ID แทนได้

| ประเภท Endpoint | windowMs | Max Requests | หมายเหตุ |
|---|---|---|---|
| **General API** | 1 นาที | 100 ครั้ง | Endpoints ทั่วไปที่มี auth |
| **Auth Endpoints** | 15 นาที | 5–10 ครั้ง | Login, Register (นับเฉพาะที่ล้มเหลว) |

---

## 2. กฎการตั้งค่า (Implementation Rules)

- **Status Code:** คืนค่า `429 Too Many Requests` เมื่อเกินขีดจำกัด
- **Response:** ต้องมี `success: false`, `code: TOO_MANY_REQUESTS`, `data: null`, `requestId`
- **Headers:**
  - `standardHeaders: true` — ส่ง `X-RateLimit-Limit` และ `X-RateLimit-Remaining`
  - `legacyHeaders: false` — ปิด Header รูปแบบเก่า (เช่น `X-RateLimit-Reset`)
  - `Retry-After` (แนะนำ) — วินาทีที่ควรรอก่อนเรียกอีกครั้ง
- **Auth Strict:** ใช้ `skipSuccessfulRequests: true` (นับเฉพาะ failed attempts)
- **Trust Proxy:** หากอยู่หลัง Load Balancer ต้องตั้งค่า `app.set('trust proxy', 1)`

---

## 3. ตัวอย่างการตอบกลับ (Response 429)

```json
{
  "success": false,
  "code": "TOO_MANY_REQUESTS",
  "message": "Too many requests, please try again later.",
  "data": null,
  "requestId": "uuid-xxx-xxx"
}
```
