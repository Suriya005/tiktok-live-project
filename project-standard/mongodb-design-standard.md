# MongoDB Design Standard

มาตรฐานการออกแบบโครงสร้าง (Schema Design) เพื่อประสิทธิภาพสูงสุดและง่ายต่อการดูแลรักษา

---

## 1. การตั้งชื่อ (Naming Convention)

ใช้รูปแบบ `snake_case` ทั้งหมดเพื่อความสอดคล้อง:

| องค์ประกอบ | รูปแบบ | ตัวอย่าง |
|---|---|---|
| Database | `snake_case` | `inventory_management_db` |
| Collection | `snake_case` | `su_agent_whitelist`, `users` |
| Field | `snake_case` | `first_name`, `is_active`, `cr_date` |
| Index (ทั่วไป) | `idx_[fields]` | `idx_user_id_status` |
| Unique Key | `uk_[fields]` | `uk_email`, `uk_username` |
| TTL Index | `ttl_[fields]` | `ttl_exp_date`, `ttl_cr_date` |

---

## 2. มาตรฐานชนิดข้อมูล (Data Types)

| ประเภทข้อมูล | กฎ |
|---|---|
| **ID / Reference** | บังคับใช้ `ObjectId` (ห้ามใช้ String เก็บ ID) |
| **Date / Time** | บังคับใช้ `Date` (ISODate) รูปแบบ UTC เสมอ |
| **Currency (เงิน)** | บังคับใช้ `Decimal128` (ห้ามใช้ `Double`) |
| **Boolean** | บังคับใช้ `true` / `false` เท่านั้น (ห้ามใช้ `0/1` หรือ `Y/N`) |
| **Enum / Status** | บังคับใช้ String ที่สื่อความหมาย (เช่น `active`, `pending`) |

---

## 3. กลยุทธ์การทำ Index (Indexing Strategy)

| ประเภท | กฎ |
|---|---|
| **Primary Key** | `_id` มี Index อัตโนมัติอยู่แล้ว |
| **Foreign Key / Relation** | ต้องสร้าง Index บนฟิลด์ที่ใช้ `$lookup` หรือ Filter บ่อยๆ |
| **Unique Constraint** | สร้าง Unique Index สำหรับข้อมูลที่ห้ามซ้ำ (เช่น `email`, `username`) |
| **Compound Index** | เรียงลำดับตาม **ESR Rule** (Equality → Sort → Range) เสมอ |
