# Architecture Standard

มาตรฐานสถาปัตยกรรมและการจัดโครงสร้างโปรเจกต์ Backend

---

## 1. การแบ่งชั้นความรับผิดชอบ (Layer Responsibilities)

สถาปัตยกรรมแบบ **4-Layer Pattern** เพื่อการแยกหน้าที่ (Separation of Concerns)

| Layer | หน้าที่หลัก | กฎสำคัญ |
|---|---|---|
| **Route** | รับ Request & Routing | ห้ามใส่ Logic — เรียก Middleware ที่นี่ |
| **Controller** | Orchestrator & Response | Validate Input, เรียก Service, ส่ง Response กลับ |
| **Service** | Business Logic | ห้ามมี DB Query โดยตรง — เป็นที่อยู่ของ Logic แท้ๆ |
| **Repository** | Data Access (DAL) | ใช้ MongoDB Driver เท่านั้น — ห้ามเรียก Service อื่น |

---

## 2. การตั้งชื่อและโครงสร้างไฟล์ (Naming & Structure)

**กฎเหล็ก (Mandatory Rules):**

- **Case:** ใช้ `kebab-case` (ตัวเล็กทั้งหมด คั่นด้วยขีดกลาง) สำหรับโฟลเดอร์และไฟล์ทั้งหมด
- **Suffix:** ต้องมีคำระบุประเภทไฟล์เสมอ เช่น `.controller.js`, `.service.js`

### 2.1 โครงสร้างโฟลเดอร์หลัก (`src/`)

| โฟลเดอร์ | หน้าที่ |
|---|---|
| `adapters/` | เชื่อมต่อ Third-party API (เช่น Line, Payment Gateway) |
| `config/` | การตั้งค่าระบบ (Database, Environment) |
| `middlewares/` | การตรวจสอบกลาง (Auth, Rate Limit) |
| `modules/` | Feature-Based Logic (รวม 4 ชั้นไว้ในโฟลเดอร์เดียว) |
| `utils/` | ฟังก์ชันตัวช่วยส่วนกลาง (DateFormat, Validation) |
| `app.js` | ศูนย์รวมการตั้งค่า Express Instance, Middleware กลาง และการเชื่อมต่อ Routes |
| `server.js` | จุดเริ่มต้นของแอปพลิเคชัน (Start Server) |

### 2.2 โครงสร้างไฟล์มาตรฐาน (Project Directory Tree)

ตัวอย่างโครงสร้างมาตรฐานสำหรับ 1 Service:

```
deposit-service/                        ← Root ของ Service
├── .github/
│   └── workflows/
│       └── ci.yml                      # GitHub Actions สำหรับ CI/CD Pipeline
├── scripts/
│   ├── validate-db-standards.js        # สคริปต์ตรวจสอบมาตรฐานฐานข้อมูล
│   ├── validate-structure.js           # สคริปต์ตรวจสอบโครงสร้างไฟล์/โฟลเดอร์
│   └── validate-routes.js              # สคริปต์ตรวจสอบ URL naming convention
├── src/
│   ├── adapters/                       # เชื่อมต่อระบบภายนอก (Cashflow, Line, etc.)
│   ├── config/                         # ไฟล์ตั้งค่า (Database, Env Config)
│   ├── middlewares/                    # Middleware กลาง (Auth, Logging, Error Handler)
│   ├── modules/
│   │   └── health/                     # โมดูลตรวจสอบสถานะ (Standard Health Check)
│   │       ├── health.route.js
│   │       ├── health.validator.js
│   │       ├── health.controller.js
│   │       ├── health.service.js
│   │       ├── health.repository.js
│   │       └── tests/
│   │           └── unit-test/          # ทดสอบ Logic รายหน่วย
│   ├── utils/                          # ฟังก์ชันตัวช่วยส่วนกลาง
│   ├── app.js                          # Express Instance & Middleware Configuration
│   └── server.js                       # Entry Point (Bootstrap DB → Listen Port)
├── CHANGELOG.md                        # บันทึกการเปลี่ยนแปลง (Version History)
├── .env.example                        # Template สำหรับ Environment Variables
├── .gitignore
├── .prettierignore
├── .prettierrc                         # การตั้งค่าจัดรูปแบบโค้ด (Prettier)
├── pull_request_template.md            # Template สำหรับสร้าง PR ใน GitHub
├── ecosystem.config.js                 # PM2 Process Manager Config
├── eslint.config.js                    # ESLint Rules
└── package.json                        # ข้อมูลโปรเจกต์และ Scripts มาตรฐาน
```

---

## 3. มาตรฐานสคริปต์การทำงาน (Standard Scripts)

ทุกโปรเจกต์ต้องมีชุดคำสั่งเหล่านี้ใน `package.json` เพื่อรองรับระบบ Automation:

| Command | สำหรับ | หน้าที่ |
|---|---|---|
| `npm run dev` | Development | รันแอปพลิเคชันในโหมด Watch |
| `npm run lint` | Code Quality | ตรวจสอบคุณภาพโค้ดด้วย ESLint |
| `npm run format` | Formatting | จัดรูปแบบไฟล์ด้วย Prettier |
| `npm run test` | Testing | รันการทดสอบทั้งหมด |
| `npm run test:unit` | Testing | รันเฉพาะ Unit Test |
| `npm run test:integration` | Testing | รันเฉพาะ Integration Test |
| `npm run audit:check` | Security | ตรวจสอบช่องโหว่ของ Dependencies |

---

## 4. มาตรฐานไฟล์เริ่มต้น (Entry Points)

| ไฟล์ | บทบาทหน้าที่ |
|---|---|
| `server.js` | Bootstrap: เริ่มต้นเชื่อมต่อ Database และเริ่มรัน Server (listen) |
| `app.js` | Configuration: สร้าง Express Instance, ติดตั้ง Middleware และเชื่อมต่อ Routes |
| `health.js` | (ใน `modules/health/`) จัดการ Availability Check ของ Service |
