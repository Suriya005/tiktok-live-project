# MongoDB Index Standard

มาตรฐานการจัดทำดัชนี (Indexing) เพื่อเพิ่มประสิทธิภาพการสืบค้นข้อมูลและบริหารจัดการทรัพยากรฐานข้อมูล MongoDB

---

## 1. กฎการเรียง Compound Index (ESR Rule)

ต้องเรียงลำดับ Index ตามหลักการ ESR เสมอ เพื่อลดภาระ RAM:

| ลำดับ | ย่อ | ประเภท | ตัวอย่าง |
|---|---|---|---|
| 1 | **E** | Equality — ค้นหาค่าตรงตัว | `status: "active"` |
| 2 | **S** | Sort — การจัดเรียง | `cr_date: -1` |
| 3 | **R** | Range — ค้นหาช่วงข้อมูล | `price: { $gt: 100 }` |

---

## 2. เป้าหมายสูงสุด: Covered Query

อ่านข้อมูลจาก RAM จบในขั้นตอนเดียว (Index Only):

- Index ต้องครอบคลุม **ทุกฟิลด์** ที่อยู่ใน `find()` และ `project()`
- สั่ง `_id: 0` เสมอ หากไม่ได้ทำ Index บน `_id`

---

## 3. ตัวอย่างการสร้าง Index

### Compound Index (ESR)

```js
db.collection('orders').createIndex(
  { user_id: 1, cr_date: -1, total_amount: 1 },
  { name: 'idx_user_id_cr_date_total' }, // ✅ ระบุชื่อตามมาตรฐาน idx_
);
```

### Unique Index

```js
// บังคับข้อมูลไม่ให้ซ้ำกัน (เช่น email หรือ username)
db.collection('users').createIndex(
  { email: 1 },
  { name: 'uk_email', unique: true }, // ✅ ระบุชื่อ uk_ และตั้งค่า unique: true
);
```

### TTL Index (Auto-Delete)

```js
// แบบที่ 1: ลบทิ้งเมื่อถึงเวลาใน exp_date
db.collection('sessions').createIndex(
  { exp_date: 1 },
  { name: 'ttl_exp_date', expireAfterSeconds: 0 },
);

// แบบที่ 2: ลบทิ้งหลังผ่านไป 1 วัน (86400 วินาที)
db.collection('logs').createIndex(
  { cr_date: 1 },
  { name: 'ttl_cr_date', expireAfterSeconds: 86400 },
);
```

---

## 4. Aggregate Optimization (Lookup & Group)

- **`$lookup`:** บังคับมี Index ที่ `foreignField` เพื่อป้องกัน COLLSCAN
- **`$group`:** ควรทำ Index บนฟิลด์ที่จัดกลุ่ม และต้องผ่าน `$match` กรองก่อนเสมอ

```js
// ✅ $lookup: foreignField (_id) ต้องมี Index
db.collection('orders').aggregate([
  { $match: { status: 'completed' } },
  {
    $lookup: {
      from: 'products',
      localField: 'product_id',
      foreignField: '_id',
      as: 'product_details',
    },
  },
]);

// ✅ $group: กรองด้วย $match ก่อนเสมอ
db.collection('orders').aggregate([
  { $match: { cr_date: { $gte: new Date('2024-01-01') } } },
  {
    $group: {
      _id: '$status',
      totalAmount: { $sum: '$total_amount' },
    },
  },
]);
```
