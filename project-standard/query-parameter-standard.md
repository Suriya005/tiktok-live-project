# Query Parameter Standard

การส่งและจัดการพารามิเตอร์สำหรับการร้องขอข้อมูล (Filters & Pagination)

---

## 1. การแบ่งหน้า (Pagination Standards)

| Parameter | Type | Default | Limit | Auto-Correction |
|---|---|---|---|---|
| `page` | Number | `1` | Min: 1 | `< 1` → ปรับเป็น `1` |
| `limit` | Number | `10` | Max: 100 | `> 100` → ปรับเป็น `100` |

---

## 2. มาตรฐานการส่งข้อมูลแบบรายการ (Array Parameters)

หากต้องการส่งรายการข้อมูล ให้ใช้การ **ซ้ำชื่อ Key** ต่อท้ายกัน:

```
✅ Do:   ?status=pending&status=active     → รวมเป็น Array ['pending', 'active']
❌ Don't: ?status=pending,active           → ห้ามใช้ comma
❌ Don't: ?status[]=active                → ห้ามใส่ [] ในชื่อ Key
```

---

## 3. ขีดจำกัดความยาว (URL Length Limits)

- **Max Length:** URL ทั้งหมด (Domain + Query) ต้องไม่เกิน **2,048 ตัวอักษร**
- **Solution:** หาก Filters ซับซ้อนเกิน ให้เปลี่ยนเป็น `POST` (พร้อม JSON Body) แทน `GET`

---

## 4. มาตรฐานวันที่และเวลา (Date & Time)

- **UTC Only:** บังคับส่งเป็นเวลาสากล ลงท้ายด้วย `Z` เสมอ
- **DateTime (ISO 8601):** `YYYY-MM-DDTHH:mm:ss.sssZ`
- **Date Only:** `YYYY-MM-DD` (เช่น `2026-12-31`)
- **Range Params:** ใช้คู่คีย์ `dateFrom` และ `dateTo`

---

## 5. การจัดการพารามิเตอร์ที่ไม่ใช้งาน (Optional Fields)

**กฎ:** หากไม่ต้องการค้นหาตามเงื่อนไขนั้น — **ไม่ต้องส่ง Key มาเลย**

```
✅ Do (Clean):    /deposits?status=active
❌ Don't (Noisy): /deposits?status=active&acc_no=&dateFrom=
```
