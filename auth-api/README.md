# TikTok Live Auth API

Production-ready authentication microservice with JWT-based authentication, refresh token rotation, and comprehensive security features.

## 🚀 Features

- ✅ User registration with email validation
- ✅ Secure login with bcrypt password hashing
- ✅ **Google OAuth 2.0 authentication**
- ✅ JWT-based access tokens (15min expiry)
- ✅ Refresh token rotation with secure storage
- ✅ HttpOnly cookie support for web clients
- ✅ User profile management
- ✅ Role-based access control (user/admin)
- ✅ Rate limiting on authentication endpoints
- ✅ Comprehensive input validation
- ✅ Security middleware (Helmet, CORS)
- ✅ Error handling with consistent API responses
- ✅ MongoDB with Native Driver
- ✅ Automated tests with Jest

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd auth-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your configuration:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/tiktok_live_auth
   
   # Generate strong secrets (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
   
   # Google OAuth (optional - see docs/GOOGLE_OAUTH_SETUP.md)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Setup Google OAuth (Optional)**
   
   Follow the detailed guide: [docs/GOOGLE_OAUTH_SETUP.md](./docs/GOOGLE_OAUTH_SETUP.md)

5. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or use local MongoDB installation
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

Base URL: `http://localhost:3001/api/v1`

### Authentication Endpoints

#### 1. Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

---

#### 2. Login

**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

---

#### 3. Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Note:** Refresh token can also be sent via HttpOnly cookie. The endpoint will check both.

---

#### 4. Logout

**POST** `/auth/logout`

Revoke refresh token and logout user.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

### Google OAuth Endpoints

#### 5. Get Google OAuth URL

**GET** `/auth/google`

Get Google OAuth authorization URL for user to login.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3001/api/v1/auth/google
```

**Usage:**
Redirect user to the `authUrl` to start Google authentication flow.

---

#### 6. Google OAuth Callback

**GET** `/auth/google/callback`

Handles Google OAuth callback (called by Google after user authorizes).

**Query Parameters:**
- `code`: Authorization code from Google

**Response:**
Redirects to frontend with tokens:
```
http://localhost:3000/auth/callback?accessToken=xxx&refreshToken=xxx
```

**Note:** This endpoint is called automatically by Google. Don't call it directly.

---

#### 7. Authenticate with Google ID Token

**POST** `/auth/google/token`

Authenticate using Google ID token (for mobile apps / SPAs with Google Sign-In button).

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@gmail.com",
      "name": "John Doe",
      "role": "user",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/google/token \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ID_TOKEN"
  }'
```

---

### User Profile Endpoints

#### 8. Get Profile

**GET** `/me`

Get current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2025-12-07T10:30:00.000Z",
      "updatedAt": "2025-12-07T10:30:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/v1/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

#### 9. Update Profile

**PUT** `/me`

Update current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Jane Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "user",
      "createdAt": "2025-12-07T10:30:00.000Z",
      "updatedAt": "2025-12-07T11:45:00.000Z"
    }
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3001/api/v1/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

---

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": []  // Optional, for validation errors
  }
}
```

**Common Error Codes:**

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | No token or invalid token |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Token Security
- **Access Token**: 
  - JWT signed with `ACCESS_TOKEN_SECRET`
  - Expires in 15 minutes
  - Contains: userId, email, role
  
- **Refresh Token**:
  - JWT signed with `REFRESH_TOKEN_SECRET`
  - Expires in 7 days
  - Stored hashed (SHA-256) in database
  - Token rotation on refresh (old token invalidated)
  - Maximum 5 tokens per user

### Rate Limiting
- Authentication endpoints limited to 5 requests per minute per IP
- Prevents brute force attacks

### Security Headers
- Helmet.js for secure HTTP headers
- CORS configured with allowed origins
- HttpOnly cookies for refresh tokens (web clients)

### Best Practices
- Passwords hashed with bcrypt (12 salt rounds)
- Input validation and sanitization
- Secure cookie settings (secure, sameSite)
- MongoDB injection prevention via Mongoose
- Error messages don't leak sensitive information

---

## 🧪 Testing

Run tests with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

Test coverage includes:
- User registration
- Login authentication
- Token refresh flow
- Profile retrieval
- Logout functionality
- Error scenarios

---

## 📁 Project Structure

```
auth-api/
├── src/
│   ├── config/
│   │   ├── config.js          # Environment configuration
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic (register, login, refresh, logout)
│   │   └── userController.js  # User profile logic
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification, role checking
│   │   └── validation.js      # Request validation rules
│   ├── models/
│   │   └── User.js            # User schema and methods
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   └── user.js            # User routes
│   ├── utils/
│   │   └── errors.js          # Error handling utilities
│   └── app.js                 # Express app setup
├── tests/
│   └── auth.test.js           # Integration tests
├── .env.example               # Environment variables template
├── .gitignore
├── jest.config.js             # Jest configuration
├── package.json
└── README.md
```

---

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Generate strong random secrets (64+ characters recommended)
ACCESS_TOKEN_SECRET=<64-char-random-string>
REFRESH_TOKEN_SECRET=<64-char-random-string>

ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

BCRYPT_SALT_ROUNDS=12

# Enable secure cookies in production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Adjust rate limiting as needed
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5
```

### Generate Secure Secrets

```bash
# Generate ACCESS_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate REFRESH_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique secrets for JWT tokens
- [ ] Enable HTTPS and set `COOKIE_SECURE=true`
- [ ] Configure proper CORS origins
- [ ] Use MongoDB Atlas or managed MongoDB service
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure reverse proxy (nginx, Apache)
- [ ] Set up monitoring and logging
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Implement rate limiting at infrastructure level

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/app.js --name "auth-api"

# View logs
pm2 logs auth-api

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## 🔄 Token Flow

### Registration/Login Flow
```
Client → POST /auth/register or /auth/login
       → Server validates credentials
       → Server generates access + refresh tokens
       → Server stores hashed refresh token in DB
       → Server returns both tokens (+ sets cookie)
       ← Client stores access token (memory/localStorage)
       ← Client stores refresh token (cookie or secure storage)
```

### API Request Flow
```
Client → GET /me with Authorization: Bearer <access_token>
       → Server validates access token
       → Server processes request
       ← Client receives response
```

### Token Refresh Flow
```
Client → POST /auth/refresh with refresh_token
       → Server validates refresh token
       → Server checks token in database
       → Server generates NEW access + refresh tokens
       → Server invalidates OLD refresh token
       → Server stores NEW hashed refresh token
       ← Client receives new tokens
```

### Logout Flow
```
Client → POST /auth/logout with refresh_token
       → Server removes refresh token from database
       → Server clears cookie
       ← Client discards tokens
```

### Google OAuth Flow
```
Client → GET /auth/google
       ← Receive authUrl
Client → Redirect to Google
User   → Authorize application
Google → Redirect to /auth/google/callback?code=xxx
Server → Exchange code for tokens
       → Get user info from Google
       → Create/update user in database
       → Generate JWT tokens
       → Redirect to frontend with tokens
Client → Parse tokens from URL
       ← Store tokens, user logged in
```

---

## 🛡️ Security Considerations

### For Production

1. **Database Security**
   - Use MongoDB authentication
   - Enable SSL/TLS for MongoDB connections
   - Regularly update MongoDB
   - Implement backup strategy

2. **Token Management**
   - Store access tokens in memory (not localStorage for XSS prevention)
   - Use HttpOnly cookies for refresh tokens
   - Implement token blacklist for compromised tokens
   - Set reasonable expiry times

3. **API Security**
   - Use HTTPS only in production
   - Implement request signing for critical operations
   - Add API key authentication for service-to-service calls
   - Monitor for suspicious activity

4. **Infrastructure**
   - Use environment variables for secrets (never commit)
   - Implement DDoS protection
   - Set up Web Application Firewall (WAF)
   - Regular security audits and penetration testing

---

## 📝 Additional Notes

### Refresh Token Storage Options

**Option 1: HttpOnly Cookie (Recommended for Web)**
```javascript
// Already implemented in the code
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,  // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

**Option 2: Response Body (For Mobile Apps)**
```javascript
// Also provided in response body
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
// Store in secure storage (Keychain/Keystore)
```

### Cleaning Expired Tokens

Run this periodically (cron job):

```javascript
const User = require('./models/User');

// Clean expired tokens
await User.cleanExpiredTokens();
```

### Role-Based Access Control

Example of protected admin route:

```javascript
router.get(
  '/admin/users',
  verifyAccessToken,
  requireRole('admin'),
  getAllUsers
);
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this in your projects!

---

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review the test files for usage examples

---

## 🎯 Next Steps

- [x] ~~Implement Google OAuth~~
- [ ] Add Facebook OAuth
- [ ] Add Apple Sign-In
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add account lockout after failed attempts
- [ ] Add audit logging
- [ ] Implement refresh token family detection
- [ ] Add user session management
- [ ] Implement GDPR compliance features
- [ ] Add GraphQL support

---

## 📚 Additional Documentation

- [Google OAuth Setup Guide](./docs/GOOGLE_OAUTH_SETUP.md) - Complete guide to setting up Google authentication

---

**Happy Coding! 🚀**
