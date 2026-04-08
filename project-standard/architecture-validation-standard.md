# Architecture Validation Standard

สคริปต์อัตโนมัติสำหรับตรวจสอบว่าโปรเจกต์ปฏิบัติตามมาตรฐานสถาปัตยกรรม

---

## 1. รายการสคริปต์ตรวจสอบ (Validation Scripts)

| สคริปต์ | ขอบเขตการตรวจสอบ | กฎสำคัญที่ต้องผ่าน |
|---|---|---|
| `validate-structure.js` | File/Folder Tree | บังคับ `kebab-case` และต้องครบ 4 Layer ในโมดูลฟีเจอร์ |
| `validate-routes.js` | API Routes | URL ต้องมี Versioning, `kebab-case`, และใช้ Plural |
| `check-db-standards.js` | Database Fields | บังคับ `snake_case` สำหรับฟิลด์ใน DB |

---

## 2. รายละเอียดการทำงานของสคริปต์ (Script Definitions)

### `validate-structure.js`
ตรวจสอบ **โครงสร้างโปรเจกต์** (Folders/Files) ในระดับ Top-view:
- บังคับใช้ `kebab-case` ทุกลำดับชั้น
- ตรวจสอบความสมบูรณ์ของ `.gitignore` (เช่น `node_modules`, `.env`)

### `validate-routes.js`
ตรวจสอบ **เส้นทาง API** ในโค้ดทั้งหมด:
- บังคับใช้ `kebab-case` สำหรับ URL Path
- ตรวจสอบการตั้งชื่อ Resource ให้เป็น **พหูพจน์ (Plural)**

### `check-db-standards.js`
ตรวจสอบ **มาตรฐานฐานข้อมูล**:
- ห้าม Hardcode URI
- บังคับค่า Pool Size / Timeouts
- บังคับเรียกใช้ DB ผ่านฟังก์ชันมาตรฐานเท่านั้น

---

## 3. วิธีการรัน (How to Run)

```bash
npm run structure:check
npm run routes:check
npm run db:check
```

ตั้งค่าใน `package.json`:

```json
{
  "scripts": {
    "structure:check": "node scripts/validate-structure.js",
    "routes:check": "node scripts/validate-routes.js",
    "db:check": "node scripts/check-db-standards.js"
  }
}
```
