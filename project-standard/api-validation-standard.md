# API Validation Standard

ข้อกำหนดการตรวจสอบข้อมูล (Validation) สำหรับ Backend API

---

## 1. มาตรฐานและโครงสร้าง (Standard & Structure)

- **Library:** ใช้ `Joi` เป็นมาตรฐานหลัก
- **Naming:** ใช้ชื่อไฟล์รูปแบบ `*.validator.js` (เช่น `user.validator.js`)
- **Location:** เก็บไว้ใน Module โฟลเดอร์ตาม Architecture Standard

```
src/modules/<module-name>/
├── <module-name>.route.js
├── <module-name>.validator.js    ← File Location
├── <module-name>.controller.js
├── <module-name>.service.js
└── <module-name>.repository.js
```

---

## 2. ตัวอย่างการใช้งาน (Validation Examples)

### ✅ Min / Max

```js
const schema = Joi.object({
  amount: Joi.number().min(1).max(500000).required(),   // ช่วงตัวเลข
  username: Joi.string().min(3).max(50).required(),     // ความยาวตัวอักษร
  items: Joi.array().min(1).max(10).required(),         // จำนวนใน Array
});
```

### ✅ MongoDB ObjectId

```js
const schema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid MongoDB ObjectId format' }),
});
```
