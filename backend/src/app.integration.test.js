// backend/src/app.integration.test.js
// Integration tests: HTTP API against the Express app with a real in-memory MongoDB.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from './app.js';
import { User } from './models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests';
  }
}, 30_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('App integration', () => {
  describe('GET /health', () => {
    it('returns 200 with ok and version', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('ok', true);
      expect(res.body).toHaveProperty('version');
      expect(typeof res.body.version).toBe('string');
    });
  });

  describe('GET /me', () => {
    it('returns 401 when Authorization header is missing', async () => {
      await request(app)
        .get('/me')
        .expect(401)
        .expect((res) => {
          expect(res.body.error).toMatch(/Bearer|Authorization/i);
        });
    });

    it('returns 401 when token is invalid', async () => {
      await request(app)
        .get('/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('returns current user when valid JWT is provided', async () => {
      const user = await User.create({
        googleId: 'google-123',
        email: 'test@example.com',
        name: 'Test User',
        photoUrl: '',
      });

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const res = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(user._id.toString());
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.name).toBe('Test User');
    });
  });
});
