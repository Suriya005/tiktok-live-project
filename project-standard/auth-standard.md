# Authentication Standard

มาตรฐานสำหรับการจัดการระบบลงชื่อเข้าใช้ (Authentication) และการตรวจสอบสิทธิ์ (Authorization) เพื่อความปลอดภัยระดับ Enterprise (รองรับ Web & Mobile)

---

## 1. วิธีการเก็บ Token (Token Storage & Lifecycle)

- **เทคโนโลยีหลัก:** JWT (JSON Web Token)
- **อายุ Token:**
  - **Access Token:** สั้น (เช่น 15 นาที) เพื่อลดความเสี่ยงจากการถูกขโมย
  - **Refresh Token:** ยาว (เช่น 7–30 วัน) เก็บลง Database หรือ Redis

**การจัดเก็บฝั่ง Web:** ห้ามเก็บ JWT ใน `localStorage` — บังคับใช้ Cookie เท่านั้น:

| Cookie Option | Value | เหตุผล |
|---|---|---|
| `HttpOnly` | `true` | กัน XSS |
| `Secure` | `true` | ส่งผ่าน HTTPS เท่านั้น (ยกเว้น Local) |
| `SameSite` | `'strict'` | กัน CSRF |

```js
// ✅ ตัวอย่างตอน Login จำหน่าย Token
res.cookie('token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
});
```

---

## 2. โครงสร้าง Endpoint & Rate Limit

| Endpoint | Method | Body |
|---|---|---|
| `/api/v1/auth/register` | `POST` | `{ email, password }` |
| `/api/v1/auth/login` | `POST` | `{ email, password }` |
| `/api/v1/auth/refresh` | `POST` | `{ refreshToken }` |
| `/api/v1/auth/logout` | `POST` | `{ refreshToken }` (Optional) |

**Rate Limit:** 5–10 ครั้ง / 15 นาที ต่อ IP — ใช้ `skipSuccessfulRequests: true`

---

## 3. Middleware & Authorization (Web + Mobile)

ทุก Protected Endpoint ต้องมี `auth.middleware.js` กั้นเสมอ

**Fallback Pattern การดึง Token:**
1. ดึงจาก `Authorization: Bearer <token>` Header (สำหรับ Mobile)
2. หากไม่พบ → ดึงจาก Cookie (สำหรับ Web)

**Response Codes เมื่อตรวจสอบล้มเหลว:**

| Code | สถานการณ์ |
|---|---|
| `401 UNAUTHORIZED` | ไม่ได้แนบ Token หรือ Token ไม่ถูกต้อง |
| `401 TOKEN_EXPIRED` | Token หมดอายุ — ให้ Client เรียก `/refresh` |
| `403 MISSING_AUTHORIZATION` | มี Token แต่ไม่มีสิทธิ์ (Role) เพียงพอ |

---

## 4. การจัดการ Logout & Token Revocation

### 4.1 Access Token (Stateless Blacklist)

- **Client:** สั่ง `res.clearCookie('token')`
- **Server:** นำ Access Token ปัจจุบันใส่ตาราง `BlacklistToken` (ผูก TTL Index) จนกว่าจะหมดอายุ

### 4.2 Refresh Token (Revocation & Token Rotation)

- **Manual Revocation:** เมื่อ `/logout` รับ `refreshToken` มาใน Body → ประทับ `revokedAt` ทันที
- **Token Rotation:** ทุกครั้งที่ขอต่ออายุที่ `/refresh` → Revoke Token เดิม + แจก Token ใหม่ + บันทึก `replacedByToken` (ป้องกัน Replay Attack)

```js
// ✅ ตัวอย่าง Logout สมบูรณ์
const logout = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  // 1. Blacklist Access Token
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.exp) {
      await BlacklistToken.create({ token, expiresAt: new Date(decoded.exp * 1000) }).catch(() => {});
    }
  }

  // 2. Revoke Refresh Token
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revokedAt: new Date() });
  }

  res.clearCookie('token', { path: '/' });
  res.status(200).json({ code: 'SUCCESS' });
};
```
