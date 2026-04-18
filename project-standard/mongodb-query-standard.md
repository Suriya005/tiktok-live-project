# MongoDB Query Standard

มาตรฐานการเขียน Query ให้มีประสิทธิภาพ (Performance) — ดึงเฉพาะข้อมูลที่ใช้ และเหมาะสมกับ Database Engine

---

## 1. Tenant Isolation (ระบุระดับสาขาเสมอ)

**กฎ:** ทุก Query (Read/Write/Aggregate) ต้องระบุ `ou_id` และ `branch_id` เป็นเงื่อนไขแรก เพื่อป้องกัน Data Leakage

```js
// Find / Update
const users = await db.collection('users').find({
  ou_id: currentOuId,
  branch_id: currentBranchId,
  status: 'active',
}).toArray();

// Aggregate: กรองที่ $match ตัวแรกสุดเสมอ
const summary = await db.collection('orders').aggregate([
  { $match: { ou_id: currentOuId, branch_id: currentBranchId, status: 'completed' } },
  { $group: { _id: '$payment_method', total: { $sum: '$amount' } } },
]).toArray();
```

---

## 2. จัดลำดับเงื่อนไขตามหลัก ESR

เขียน Query โดยเรียงลำดับ **Equality → Sort → Range** เสมอ เพื่อลด In-memory Sort:

```js
db.collection('orders')
  .find({
    status: 'completed',           // (E) Equality
    price: { $gte: 100, $lt: 500 }, // (R) Range
  })
  .sort({ createdAt: -1 });        // (S) Sort
```

---

## 3. Projection (ควบคุมข้อมูลขาออก)

ดึงเฉพาะฟิลด์ที่ใช้งานจริง — ห้าม Over-fetching:

```js
// ✅ Correct
const users = await db.collection('users').find(
  { role: 'member' },
  { projection: { username: 1, email: 1, _id: 0 } },
).toArray();

// ❌ Incorrect (Over-fetching)
// const users = await db.collection('users').find({ role: 'member' }).toArray();
```

---

## 4. Detail Retrieval (สืบค้นรายการเดียว)

บังคับใช้ `findOne` เท่านั้น — Database จะหยุดทันทีที่เจอรายการแรก:

```js
// ✅ Correct
const userDetail = await db.collection('users').findOne({ _id: userId });

// ❌ Incorrect
// const user = await db.collection('users').find({ _id: userId }).toArray();
// return user[0];
```
