import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { connectTestDb, closeTestDb } from './setup.js';
import { User } from '../src/models/User.js';

describe('Auth REST API & Middleware (ID & Password)', () => {
  beforeAll(async () => {
    await connectTestDb();
  }, 120000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('POST /api/v1/auth/signup registers user and immediately returns JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Detective Dupin',
        username: 'dupin_c',
        password: 'Password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.username).toBe('dupin_c');
    expect(res.body.data.user.name).toBe('Detective Dupin');

    const user = await User.findOne({ username: 'dupin_c' });
    expect(user).not.toBeNull();
    expect(user.hasCompletedWalkthrough).toBe(false);
  });

  it('POST /api/v1/auth/signup rejects duplicate username with 409', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);
    await User.create({
      name: 'Detective Dupin',
      username: 'dupin_c',
      passwordHash,
    });

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Another Dupin',
        username: 'dupin_c',
        password: 'Password456',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('USERNAME_ALREADY_EXISTS');
  });

  it('POST /api/v1/auth/login validates credentials and issues JWT token', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('SecretCode123', salt);
    await User.create({
      name: 'Agent Vance',
      username: 'vance_01',
      passwordHash,
    });

    // Valid login
    const validRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'vance_01',
        password: 'SecretCode123',
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data).toHaveProperty('token');
    expect(validRes.body.data.user.username).toBe('vance_01');

    // Invalid password
    const wrongPassRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'vance_01',
        password: 'WrongPassword',
      });

    expect(wrongPassRes.status).toBe(401);
    expect(wrongPassRes.body.error.code).toBe('INVALID_CREDENTIALS');

    // Nonexistent user
    const noUserRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'unknown_agent',
        password: 'SecretCode123',
      });

    expect(noUserRes.status).toBe(401);
    expect(noUserRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/v1/auth/me and PATCH /api/v1/auth/walkthrough', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);
    const user = await User.create({
      name: 'Agent Fox',
      username: 'fox_mulder',
      passwordHash,
      hasCompletedWalkthrough: false,
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'fox_mulder',
        password: 'Password123',
      });
    const token = loginRes.body.data.token;

    // GET /me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.username).toBe('fox_mulder');
    expect(meRes.body.data.user.hasCompletedWalkthrough).toBe(false);

    // PATCH /walkthrough
    const tourRes = await request(app)
      .patch('/api/v1/auth/walkthrough')
      .set('Authorization', `Bearer ${token}`)
      .send({ hasCompletedWalkthrough: true });
    expect(tourRes.status).toBe(200);
    expect(tourRes.body.data.user.hasCompletedWalkthrough).toBe(true);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.hasCompletedWalkthrough).toBe(true);
  });
});
