# Program Naming Standard

มาตรฐานการกำหนดรูปแบบของ `cr_prog` และ `upd_prog` เพื่อให้ระบุแหล่งที่มาของข้อมูล (Source Traceability) ได้อย่างง่ายดายและแม่นยำ

---

## 1. รูปแบบพื้นฐาน (Core Patterns)

แบ่งประเภทตามแหล่งที่มาของการแก้ไขข้อมูล ดังนี้:

### A. ช่องทาง API (RESTful API)

ใช้รูปแบบ API Path ตรงตัว เพื่อให้ทราบทันทีว่าข้อมูลถูกแก้ไขผ่าน Route ไหน

- **Format:** `[path]`

```
/api/v1/bank-accounts
/api/v1/user/profile
/api/v1/orders/123/status
```

### B. ช่องทางตั้งเวลา (Scheduled Job / Cron)

ใช้ชื่อ Service Name หรือ Job Name โดยตรงในรูปแบบ `kebab-case`

- **Format:** `[service-name]`

```
daily-sales-report
calculate-commission
sync-exchange-rate
```

---

## 2. ตัวอย่างการเก็บข้อมูลลง Database

เมื่อมีการสร้างหรือแก้ไขข้อมูล ให้เก็บลงฟิลด์ Audit ดังนี้:

```js
// กรณี API (Create Bank Account)
const auditFields = {
  cr_prog: '/api/v1/bank-accounts',
  upd_prog: '/api/v1/bank-accounts',
  // ... อื่นๆ
};

// กรณี Job (Calculate Commission)
const auditFields = {
  upd_prog: 'calculate-commission',
  // ... อื่นๆ
};
```

---

## 3. สรุปข้อกำหนด (Guidelines)

| หัวข้อ | กฎ |
|---|---|
| **Case Format** | Path ให้ใช้ตามระบบจริง / Job ให้ใช้ `kebab-case` |
| **Explicit Path** | ต้องใส่ Version (ถ้ามี) และ Path เต็มรูปแบบ |
| **Traceability** | เห็นชื่อใน Database แล้วต้องสามารถหาจุดที่รันใน Code ได้ทันที |
