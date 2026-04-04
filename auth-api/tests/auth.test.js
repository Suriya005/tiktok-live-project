const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'Test1234',
  name: 'Test User',
};

// Store tokens for testing
let accessToken;
let refreshToken;

// Connect to test database before running tests
beforeAll(async () => {
  const mongoUri =
    process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/tiktok_live_auth_test';
  await mongoose.connect(mongoUri);
});

// Clear database after each test
afterEach(async () => {
  await User.deleteMany({});
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      // First registration
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Second registration with same email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();

      // Store tokens for other tests
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    beforeEach(async () => {
      // Register and login to get refresh token
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      refreshToken = res.body.data.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(refreshToken); // Token rotation
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('GET /api/v1/me', () => {
    beforeEach(async () => {
      // Register and login to get access token
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      accessToken = res.body.data.accessToken;
    });

    it('should get user profile successfully', async () => {
      const res = await request(app)
        .get('/api/v1/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('should fail without access token', async () => {
      const res = await request(app).get('/api/v1/me').expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should fail with invalid access token', async () => {
      const res = await request(app)
        .get('/api/v1/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    beforeEach(async () => {
      // Register to get tokens
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      refreshToken = res.body.data.refreshToken;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
    });

    it('should fail to refresh token after logout', async () => {
      // Logout
      await request(app).post('/api/v1/auth/logout').send({ refreshToken });

      // Try to use the same refresh token
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
