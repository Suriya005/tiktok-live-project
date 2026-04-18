# Stack & Technology

เอกสารนี้ระบุมาตรฐาน Technology Stack และ Libraries ที่ใช้ในโปรเจกต์ เพื่อความเข้ากันได้ (Compatibility) และลดปัญหา Dependency Conflict

**Last Updated:** 2025-11-25

---

## 1. Core Runtime & Infrastructure

| Component | Version | Note |
| --- | --- | --- |
| **Runtime** | **Node.js 24.11 LTS** | ใช้ ESM (`import`/`export`) เท่านั้น |
| **Database** | **MongoDB >= 8.0** | Replica Set Configuration |
| **OS** | **Ubuntu 24.04 LTS** | Production Environment |
| **Process Manager** | **PM2 ^5.4.2** | ใช้คู่กับ `pm2-logrotate` |

---

## 2. Pinned Libraries (Production Dependencies)

ต้องใช้เวอร์ชันที่ระบุ หรือใหม่กว่า (Minor/Patch update) แต่ห้าม Major update โดยไม่ได้รับอนุญาต

| Package | Version | Purpose |
| --- | --- | --- |
| `mongodb` | `^6.6.0` | Official MongoDB Driver |
| `node-cron` | `^3.0.3` | Task Scheduling |
| `dotenv` | `^16.4.5` | Environment Variable Management |
| `pino` | `^9.2.0` | High-performance JSON Logger |
| `dayjs` | `^1.11.13` | Date & Time Manipulation (+plugins: utc, timezone) |
| `p-limit` | `^5.0.0` | Promise Concurrency Control |
| `fast-json-stable-stringify` | `^2.1.0` | Deterministic JSON stringify |
| `pm2` | `^5.4.2` | Process Manager |
| `pm2-logrotate` | `^2.7.0` | Log Rotation for PM2 |

---

## 3. Development & Testing Tools (Dev Dependencies)

| Package | Version | Purpose |
| --- | --- | --- |
| **Test Runner** | **Native `node:test`** | Built-in Node.js Test Runner (No Jest/Mocha) |
| `eslint` | `^9.12.0` | Linter (New Flat Config) |
| `prettier` | `^3.2.5` | Code Formatter |
| `cli-progress` | `^3.12.0` | Progress Bar (Optional for scripts) |

---

## 4. Configuration Standards

### 4.1 Node.js Project Setup

- **Type:** `module` (in `package.json`)
- **Engine:** `"node": ">=24.11.0"`

### 4.2 Database Connection

- Use **Connection Pooling** provided by `mongodb` driver.
- Always connect to **Replica Set** in Production.

### 4.3 Logging

- Use `pino` for all application logs.
- **Format:** JSON (Production), Pretty Print (Development only).
- **Levels:** `info` (default), `debug` (verbose), `error` (exceptions).

### 4.4 Date & Time

- Always store dates in **UTC** in Database.
- Use `dayjs.utc()` for handling time.
- Convert to Local Timezone only at Presentation Layer (Frontend/API Response).

---

## 5. Update Policy

- **Patch/Minor:** อนุญาตให้อัปเดตได้ (e.g., 1.1.0 -> 1.1.1 or 1.2.0)
- **Major:** ต้องผ่านการทดสอบ Regression Test และได้รับอนุมัติจาก Tech Lead ก่อน