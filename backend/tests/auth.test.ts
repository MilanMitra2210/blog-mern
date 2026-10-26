import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Auth Integration Tests', () => {
  setupTestDB();
  const app = createApp();

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully with hashed password', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({
          name: 'Alice Developer',
          email: 'alice@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('alice@example.com');
      expect(res.body.data.password).toBeUndefined(); // ensure password is not exposed
    });

    it('should reject registration if email is already taken', async () => {
      await request(app)
        .post('/api/v1/users/register')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'Password123',
        });

      const res = await request(app)
        .post('/api/v1/users/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.detail).toContain('already exists');
    });
  });

  describe('POST /api/v1/users/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/users/register')
        .send({
          name: 'Bob Tester',
          email: 'bob@example.com',
          password: 'Password123',
        });
    });

    it('should login successfully with correct credentials and return JWT tokens', async () => {
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'bob@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('bob@example.com');
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'bob@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
