# API Routing & Naming Standard

เอกสารสำหรับการทำ RESTful API ให้เป็นมาตรฐานเดียวกันทั้งโปรเจกต์

---

## 1. กฎการตั้งชื่อ (Naming Rules)

| กฎ | รายละเอียด | ตัวอย่าง |
|---|---|---|
| **Noun + Plural** | ใช้คำนามพหูพจน์เสมอ | `/users`, `/bank-accounts` |
| **kebab-case** | ตัวพิมพ์เล็กคั่นด้วยขีดกลาง | `/api/v1/bank-accounts` |
| **Versioning** | ต้องระบุเวอร์ชันเสมอ | `/api/v1/...` |
| **HTTP Methods** | ใช้แทนกริยา | `GET`=Read, `POST`=Create, `PUT`=Replace, `PATCH`=Update, `DELETE`=Delete |
| **Minimal Nesting** | ซ้อนไม่เกิน 2 ระดับ | `/bank-accounts/:id/slips` |
| **Custom Actions** | ใช้กริยาต่อท้าย Resource | `POST /slips/:id/verify` |
| **Query Params** | สำหรับ Filter / Sort / Pagination เท่านั้น | `?page=1&sort=-createdAt` |

---

## 2. Health Check (Mandatory)

ทุก Service ต้องมี `GET /health` โดยคืนค่าดังนี้:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-30T03:31:51Z",
    "uptime": 1234
  }
}
```
