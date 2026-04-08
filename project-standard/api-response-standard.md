# API Response Standard

มาตรฐานโครงสร้างและรหัสการตอบกลับของ API

---

## 1. รหัสผลลัพธ์ (Result Codes)

**กฎเหล็ก:**
- ใช้ HTTP Status Code จริงเสมอผ่าน `res.status()` (ห้ามส่ง `200` แต่ `code` เป็น Error)
- `code` ใน Response Body ต้องเป็นรูปแบบ `UPPER_SNAKE_CASE` เท่านั้น

| HTTP | Result Code | Meaning |
|---|---|---|
| `200` | `SUCCESS` | Success |
| `200` | `DATA_NOT_FOUND` | Data not found |
| `400` | `INVALID_PARAM` | Invalid parameter |
| `400` | `INVALID_HEADER` | Invalid header content type |
| `401` | `UNAUTHORIZED` | Unauthorized |
| `401` | `TOKEN_EXPIRED` | Access token is expired |
| `403` | `MISSING_ORIGIN` | Missing `Origin` header |
| `403` | `MISSING_AUTHORIZATION` | Missing `Authorization` header |
| `403` | `MISSING_CONTENT_TYPE` | Missing `Content-Type` header |
| `405` | `METHOD_NOT_ALLOWED` | Method not allowed |
| `409` | `CONFLICT` | Conflict (Used / Unique / Duplicate) |
| `426` | `REQUEST_NOT_SECURE` | Request is not secure |
| `429` | `TOO_MANY_REQUESTS` | Too many requests |
| `500` | `INTERNAL_ERROR` | Internal server error |

---

## 2. มาตรฐานโครงสร้าง (Response Structure)

**ลำดับฟิลด์:** `success` → `code` → `message` → `data` → `pagination` / `requestId`

| ประเภท | รูปแบบ `data` | หมายเหตุ |
|---|---|---|
| **List** | Array | ต้องมี `pagination` ถ้าแบ่งหน้า |
| **Detail** | Object | รายการเดียว |
| **Error / No Data** | `null` | ต้องมี `requestId` จาก `x-request-id` |

### ✅ Pagination Format

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": null,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### ✅ Error Format

```json
{
  "success": false,
  "code": "INVALID_PARAM",
  "message": "Invalid parameter",
  "data": null,
  "requestId": "uuid-xxx-xxx"
}
```

---

## 3. มาตรฐานชนิดข้อมูล (Data Types)

| ประเภทข้อมูล | กฎ | ตัวอย่าง |
|---|---|---|
| **DateTime** | ISO 8601 String เท่านั้น (ห้ามส่ง Timestamp) | `"2026-12-31T23:59:59.000Z"` |
| **Empty / Missing** | ส่ง `null` อย่างชัดเจน (ห้ามตัด Key ทิ้ง หรือส่ง `""`) | `"field": null` |
| **Boolean** | `true` / `false` เท่านั้น (ห้ามใช้ `"true"`, `1`, `0`) | `"isActive": true` |
| **IDs** | String เสมอ แม้ DB จะเก็บเป็นตัวเลข | `"id": "100021"` |
| **ค่าเงิน (Money)** | String เสมอ (ป้องกัน Floating-point precision loss) | `"amount": "1250.50"` |
| **ตัวเลขทั่วไป** | Number ได้ | `"count": 42` |
