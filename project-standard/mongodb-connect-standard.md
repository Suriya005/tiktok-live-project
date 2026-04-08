# MongoDB Connection Standard

มาตรฐานการเชื่อมต่อ MongoDB แบบ Singleton ด้วย Native Driver เพื่อรักษาสมรรถนะและลดภาระฐานข้อมูล

---

## 1. กฎข้อบังคับหลัก (Core Rules)

- **ห้ามใช้ Mongoose:** ใช้งานผ่าน `mongodb` (`^6.x.x`) เท่านั้น
- **ต้องพึ่งพา ENV:** ห้าม Hardcode เด็ดขาด — ใช้ `MONGODB_URI`, `DB_NAME`
- **Replica Set:** ใน `MONGODB_URI` ต้องระบุทุกโหนดเสมอ

```
mongodb://host1:27017,host2:27017,...
```

---

## 2. สิทธิการอ่าน (Read Preference)

| Read Preference | ใช้สำหรับ |
|---|---|
| `primaryPreferred` | ระบบบริการทั่วไป (Default) |
| `primary` | ธุรกรรมการเงิน (Wallet, การตัดเครดิต) |
| `secondary` / `secondaryPreferred` | Report หรือดูชุดข้อมูลจำนวนมาก (Read-only) |

```js
// Override ระดับ Query ชั่วคราว
return db.collection('users').findOne({ _id: id }, { readPreference: 'secondaryPreferred' });
```

---

## 3. โค้ดต้นแบบ (Implementation Template)

`src/config/database.js` — จุดเชื่อมต่อกลางแบบ Singleton:

```js
const { MongoClient } = require('mongodb');

const DB_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 },
  readPreference: 'primaryPreferred',
};

let client = null;
let db = null;

async function connectDatabase() {
  if (db) return db;

  if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
    throw new Error('[Database] Missing MONGODB_URI or DB_NAME config.');
  }

  client = new MongoClient(process.env.MONGODB_URI, DB_OPTIONS);
  await client.connect();
  db = client.db(process.env.DB_NAME);

  return db;
}

function getDatabase() {
  if (!db) throw new Error('[Database] Call connectDatabase() first.');
  return db;
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connectDatabase, getDatabase, closeDatabase };
```

---

## 4. ตัวอย่างการนำไปใช้งาน (Repository Pattern)

```js
const { getDatabase } = require('../../config/database');

// ✅ Correct: เรียกใช้ Instance ที่เชื่อมต่อแล้ว
const db = getDatabase();
return db.collection('users').findOne({ _id: id });

// ❌ Incorrect: ห้ามสร้าง Connection ใหม่เองเด็ดขาด
// const client = new MongoClient(uri);
```
