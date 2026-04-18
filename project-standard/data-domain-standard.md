# Data Domain Standard

มาตรฐานโครงสร้างข้อมูลระดับโปรเจกต์ (Multi-tenancy, Audit Fields, และ Optimistic Locking)

---

## 1. Data Scoping (Tenant Isolation)

**กฎ:** ทุก Query (Read/Write) บังคับระบุ `ou_id` และ `branch_id` เสมอ เพื่อป้องกัน Data Leakage ข้ามสาขา

```js
// ✅ Correct
const products = await db.collection('products').find({
  ou_id: new ObjectId(ou_id),
  branch_id: new ObjectId(branch_id),
  status: 'active',
}).toArray();
```

---

## 2. Audit Fields (ประวัติการเปลี่ยนแปลง)

### เมื่อ Create (สร้างใหม่)

ตั้งค่าชุด `upd_` ให้มีค่าเท่ากับชุด `cr_` เสมอ เพื่อรองรับ Optimistic Locking:

```js
// ✅ Correct (Example: /api/v1/user/signup)
const now = new Date();
const payload = {
  ...data,
  cr_by: username,
  cr_date: now,
  cr_prog: '/api/v1/user/signup',
  upd_by: username,   // ⬅️ ต้อง Set มาด้วย
  upd_date: now,
  upd_prog: '/api/v1/user/signup',
};
```

### เมื่อ Update (แก้ไข)

เปลี่ยนค่าและประทับตราชุด `upd_` ใหม่เสมอ:

```js
// ✅ Correct (Example: /api/v1/user/profile)
const updatePayload = {
  ...newData,
  upd_by: username,
  upd_date: new Date(),
  upd_prog: '/api/v1/user/profile',
};
```

> **Note:** สำหรับการตั้งชื่อ `cr_prog` และ `upd_prog` ให้ยึดตาม [Program Naming Standard](./program-naming-standard.md)

---

## 3. Optimistic Locking (ป้องกันการบันทึกทับ)

บังคับใช้ `upd_date` ของข้อมูลก่อนหน้า (Original Value) เป็นเงื่อนไขตรวจสอบ Version เพื่อป้องกัน Concurrent Updates:

```js
// ✅ Correct: ห้อย upd_date เดิม มาในเงื่อนไขค้นหา
const result = await db.collection('products').updateOne(
  {
    _id: new ObjectId(id),
    upd_date: original_upd_date, // ← เช็ค Version ด้วยข้อมูลเดิม
  },
  { $set: updatePayload },
);

// หากหาไม่เจอ แปลว่ามีคนอื่นแก้ไปก่อนหน้าแล้ว (Version ไม่ตรงกัน)
if (result.matchedCount === 0) {
  throw new Error('Data has been modified by another user. Please refresh and try again.');
}
```
