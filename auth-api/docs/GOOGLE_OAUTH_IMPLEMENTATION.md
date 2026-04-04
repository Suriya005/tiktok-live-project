# การเพิ่ม Google OAuth Login

เอกสารสรุปการทำ Google OAuth Authentication สำหรับ TikTok Live Project

---

## 📋 สิ่งที่ทำ

### 1. ติดตั้ง Dependencies

```json
{
  "axios": "^1.6.2",
  "googleapis": "^130.0.0"
}
```

```bash
npm install googleapis axios
```

---

## 2. Environment Variables

เพิ่มค่าใน `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=609287553988-7lb97n4g9juufue7jdvopvorslr4af61.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000

# CORS Configuration (เพิ่ม localhost:3000)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5500,http://127.0.0.1:5500
```

---

## 3. การตั้งค่า Google Cloud Console

### ขั้นตอน:

1. **ไปที่**: https://console.cloud.google.com/
2. **สร้าง/เลือก Project**: oauth-2-480514
3. **เปิดใช้งาน Google+ API**
4. **สร้าง OAuth 2.0 Credentials**:
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     http://localhost:3001/api/v1/auth/google/callback
     ```
5. **คัดลอก Client ID และ Client Secret** ใส่ใน `.env`

---

## 4. อัพเดท Configuration

**ไฟล์: `src/config/config.js`**

เพิ่ม:

```javascript
// Google OAuth
google: {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
},

// Frontend
frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
```

---

## 5. อัพเดท User Model

**ไฟล์: `src/models/User.js`**

เพิ่มฟิลด์ใหม่:

```javascript
// เพิ่มใน create method
const { email, password, name, role = 'user', googleId, avatar } = userData;

// Prepare user document
const userDoc = {
  email: email.toLowerCase().trim(),
  password: hashedPassword, // อนุญาตให้เป็น null
  name: name.trim(),
  role: role,
  googleId: googleId || null,      // ← เพิ่ม
  avatar: avatar || null,          // ← เพิ่ม
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

**เปลี่ยน validation**:
- `password` เป็น optional (สำหรับ OAuth users)
- ถ้ามี `googleId` ไม่ต้องมี `password`

---

## 6. สร้าง Google Auth Controller

**ไฟล์: `src/controllers/googleAuthController.js`**

```javascript
const { google } = require('googleapis');
const config = require('../config/config');
const User = require('../models/User');

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.callbackUrl
);
```

### Controllers:

#### 1. `getGoogleAuthUrl` - GET /api/v1/auth/google
รับ URL สำหรับ redirect ไป Google Login

#### 2. `googleCallback` - GET /api/v1/auth/google/callback
รับ callback จาก Google, สร้าง/อัพเดท user, generate tokens, redirect กลับ frontend

#### 3. `googleTokenAuth` - POST /api/v1/auth/google/token
Authenticate ด้วย Google ID Token (สำหรับ Mobile/SPA)

**Logic Flow:**
```
1. รับ authorization code จาก Google
2. แลก code เป็น access token
3. ดึงข้อมูล user จาก Google
4. ตรวจสอบว่ามี user ในระบบหรือไม่
5. ถ้ามี: อัพเดท googleId และ avatar
6. ถ้าไม่มี: สร้าง user ใหม่
7. Generate JWT tokens
8. Redirect กลับ frontend พร้อม tokens
```

---

## 7. เพิ่ม Routes

**ไฟล์: `src/routes/auth.js`**

```javascript
const googleAuthController = require('../controllers/googleAuthController');

// Google OAuth routes
router.get('/google', googleAuthController.getGoogleAuthUrl);
router.get('/google/callback', googleAuthController.googleCallback);
router.post('/google/token', authLimiter, googleAuthController.googleTokenAuth);
```

---

## 8. สร้าง Frontend

### โครงสร้าง:

```
auth-api/
├── frontend-server.js          # Express server (port 3000)
└── public/
    ├── index.html             # หน้า Login
    ├── callback.html          # รับ callback จาก Google
    └── dashboard.html         # Dashboard
```

### Frontend Server:

**ไฟล์: `frontend-server.js`**

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/auth/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'callback.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend running on http://localhost:${PORT}`);
});
```

เพิ่ม script ใน `package.json`:

```json
"scripts": {
  "frontend": "node frontend-server.js"
}
```

---

## 9. API Endpoints

### GET `/api/v1/auth/google`

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

### GET `/api/v1/auth/google/callback?code=xxx`

**Redirect to:**
```
http://localhost:3000/auth/callback?accessToken=xxx&refreshToken=xxx
```

### POST `/api/v1/auth/google/token`

**Request:**
```json
{
  "idToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@gmail.com",
      "name": "User Name",
      "role": "user",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

## 10. วิธีใช้งาน

### เริ่มต้น:

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

### ทดสอบ:

1. เปิด browser: **http://localhost:3000**
2. คลิก "Continue with Google"
3. เลือก Google account
4. Authorize
5. ระบบ redirect ไป Dashboard

---

## 11. User Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User คลิก "Login with Google"                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend เรียก GET /api/v1/auth/google              │
│    ← Response: { authUrl: "..." }                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Redirect ไป Google Login                           │
│    (accounts.google.com)                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. User เลือก account และ authorize                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Google redirect กลับมาที่:                          │
│    /api/v1/auth/google/callback?code=xxx               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Backend:                                            │
│    - แลก code เป็น access token                        │
│    - ดึงข้อมูล user จาก Google                         │
│    - สร้าง/อัพเดท user ใน database                     │
│    - Generate JWT tokens                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Redirect ไป Frontend:                              │
│    http://localhost:3000/auth/callback                 │
│    ?accessToken=xxx&refreshToken=xxx                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 8. Frontend (callback.html):                          │
│    - เก็บ tokens ใน localStorage                       │
│    - เรียก GET /api/v1/me เพื่อดึงข้อมูล user         │
│    - Redirect ไป Dashboard                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 9. แสดง Dashboard พร้อมข้อมูล user                     │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Database Schema

User document หลัง login ด้วย Google:

```javascript
{
  "_id": ObjectId("693590948e51db62b64bea1c"),
  "email": "user@gmail.com",
  "password": null,                    // ← null สำหรับ OAuth users
  "name": "User Name",
  "role": "user",
  "googleId": "109876543210",         // ← Google user ID
  "avatar": "https://lh3.googleusercontent.com/...",  // ← รูปโปรไฟล์
  "refreshTokens": [
    {
      "token": "hashed_token",
      "createdAt": ISODate("..."),
      "expiresAt": ISODate("...")
    }
  ],
  "createdAt": ISODate("2025-12-07T..."),
  "updatedAt": ISODate("2025-12-07T...")
}
```

---

## 13. Security Features

✅ **Token Rotation**: Refresh token ถูกเปลี่ยนทุกครั้งที่ refresh
✅ **Hashed Storage**: Refresh token เก็บแบบ hashed (SHA-256) ใน database
✅ **HttpOnly Cookies**: รองรับ HttpOnly cookies สำหรับ web clients
✅ **Token Expiry**: Access token หมดอายุใน 15 นาที, Refresh token 7 วัน
✅ **CORS Protection**: กำหนด allowed origins
✅ **Rate Limiting**: จำกัดการเรียก API

---

## 14. Error Handling

### Common Errors:

| Error | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| `redirect_uri_mismatch` | Redirect URI ไม่ตรงกับที่ตั้งค่าใน Google Console | เพิ่ม URL ใน Google Console |
| `CORS error` | Origin ไม่อยู่ใน allowed list | เพิ่ม origin ใน `ALLOWED_ORIGINS` |
| `NO_AUTH_CODE` | ไม่มี code จาก Google | ตรวจสอบ Google OAuth setup |
| `INVALID_GOOGLE_TOKEN` | ID token ไม่ถูกต้อง | ตรวจสอบ Client ID |

---

## 15. Testing

### ด้วย Frontend:

1. เปิด http://localhost:3000
2. Login ด้วย Google
3. ตรวจสอบ Dashboard

### ด้วย cURL:

```bash
# 1. ขอ Google Auth URL
curl http://localhost:3001/api/v1/auth/google

# 2. คัดลอก authUrl แล้ววางใน browser
# ... login และ authorize ...

# 3. หลัง redirect กลับมาจะได้ tokens
# ใช้ access token เรียก API
curl http://localhost:3001/api/v1/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 16. ไฟล์ที่สร้าง/แก้ไข

### ไฟล์ใหม่:
- ✅ `src/controllers/googleAuthController.js`
- ✅ `frontend-server.js`
- ✅ `public/index.html`
- ✅ `public/callback.html`
- ✅ `public/dashboard.html`
- ✅ `docs/GOOGLE_OAUTH_SETUP.md`

### ไฟล์ที่แก้ไข:
- ✅ `package.json` - เพิ่ม dependencies และ script
- ✅ `.env` - เพิ่ม Google OAuth config
- ✅ `.env.example` - เพิ่ม Google OAuth template
- ✅ `src/config/config.js` - เพิ่ม Google และ Frontend config
- ✅ `src/models/User.js` - เพิ่ม googleId และ avatar
- ✅ `src/routes/auth.js` - เพิ่ม Google OAuth routes
- ✅ `README.md` - อัพเดทเอกสาร

---

## 17. Troubleshooting

### ปัญหา: redirect_uri_mismatch

**แก้ไข:**
1. ไปที่ Google Cloud Console
2. เลือก OAuth 2.0 Client ID
3. เพิ่ม URL: `http://localhost:3001/api/v1/auth/google/callback`
4. Save และรอสักครู่

### ปัญหา: CORS error

**แก้ไข:**
1. เพิ่ม origin ใน `.env`:
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,...
   ```
2. รีสตาร์ทเซิร์ฟเวอร์

### ปัญหา: Cannot GET /auth/callback

**แก้ไข:**
ตรวจสอบ `FRONTEND_URL` ให้ตรงกับ port ที่ frontend รันอยู่:
```env
FRONTEND_URL=http://localhost:3000
```

---

## 18. Next Steps

- [ ] เพิ่ม Facebook OAuth
- [ ] เพิ่ม Apple Sign-In
- [ ] Link multiple OAuth providers กับ account เดียว
- [ ] เพิ่ม email verification
- [ ] เพิ่ม 2FA

---

## 📚 เอกสารเพิ่มเติม

- [Google OAuth Setup Guide](./docs/GOOGLE_OAUTH_SETUP.md)
- [API Documentation](./README.md)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)

---

**สร้างเมื่อ:** 7 ธันวาคม 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
