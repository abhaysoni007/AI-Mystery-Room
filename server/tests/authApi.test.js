import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { connectTestDb, closeTestDb } from './setup.js';
import { User } from '../src/models/User.js';
import { OtpVerification } from '../src/models/OtpVerification.js';

describe('Auth REST API & Middleware', () => {
  beforeAll(async () => {
    await connectTestDb();
  }, 120000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await OtpVerification.deleteMany({});
  });

  it('POST /api/v1/auth/signup creates unverified user and dispatches OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Detective Dupin',
        email: 'dupin@rue-morgue.fr',
        password: 'Password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('dupin@rue-morgue.fr');

    const user = await User.findOne({ email: 'dupin@rue-morgue.fr' });
    expect(user).not.toBeNull();
    expect(user.isVerified).toBe(false);

    const otpRecord = await OtpVerification.findOne({ email: 'dupin@rue-morgue.fr', purpose: 'signup' });
    expect(otpRecord).not.toBeNull();
  });

  it('POST /api/v1/auth/verify-otp marks user verified and returns JWT token', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);
    const user = await User.create({
      name: 'Detective Dupin',
      email: 'dupin@rue-morgue.fr',
      passwordHash,
      isVerified: false,
    });

    const rawOtp = '736291';
    const otpHash = await bcrypt.hash(rawOtp, 10);
    await OtpVerification.create({
      email: 'dupin@rue-morgue.fr',
      otpHash,
      purpose: 'signup',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        email: 'dupin@rue-morgue.fr',
        otp: rawOtp,
        purpose: 'signup',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('dupin@rue-morgue.fr');
    expect(res.body.data.user.isVerified).toBe(true);

    const updated = await User.findById(user._id);
    expect(updated.isVerified).toBe(true);

    // Otp record should be removed after successful consumption
    const checkOtp = await OtpVerification.findOne({ email: 'dupin@rue-morgue.fr' });
    expect(checkOtp).toBeNull();
  });

  it('POST /api/v1/auth/verify-otp rejects wrong code and rate limits after 5 attempts', async () => {
    const rawOtp = '736291';
    const otpHash = await bcrypt.hash(rawOtp, 10);
    await OtpVerification.create({
      email: 'dupin@rue-morgue.fr',
      otpHash,
      purpose: 'signup',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 4,
    });

    // 5th attempt with wrong code
    const res1 = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        email: 'dupin@rue-morgue.fr',
        otp: '000000',
        purpose: 'signup',
      });
    expect(res1.status).toBe(400);

    // 6th attempt should be locked out
    const res2 = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        email: 'dupin@rue-morgue.fr',
        otp: '000000',
        purpose: 'signup',
      });
    expect(res2.status).toBe(429);
  });

  it('POST /api/v1/auth/login validates password and rejects unverified account', async () => {
    const passwordHash = await bcrypt.hash('Password123', 10);
    await User.create({
      name: 'Unverified Detective',
      email: 'unverified@agency.com',
      passwordHash,
      isVerified: false,
    });

    const unverifiedRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'unverified@agency.com',
        password: 'Password123',
      });
    expect(unverifiedRes.status).toBe(403);
    expect(unverifiedRes.body.error.code).toBe('ACCOUNT_NOT_VERIFIED');

    // Now test with verified user
    await User.updateOne({ email: 'unverified@agency.com' }, { $set: { isVerified: true } });

    const verifiedRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'unverified@agency.com',
        password: 'Password123',
      });
    expect(verifiedRes.status).toBe(200);
    expect(verifiedRes.body.success).toBe(true);
    expect(verifiedRes.body.data).toHaveProperty('token');
  });

  it('POST /api/v1/auth/forgot-password and /reset-password resets password via OTP', async () => {
    const passwordHash = await bcrypt.hash('OldPassword123', 10);
    await User.create({
      name: 'Agent Fox',
      email: 'fox@agency.com',
      passwordHash,
      isVerified: true,
    });

    // Request reset
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'fox@agency.com' });
    expect(forgotRes.status).toBe(200);

    // Seed known OTP for reset_password
    const rawOtp = '112233';
    const otpHash = await bcrypt.hash(rawOtp, 10);
    await OtpVerification.updateOne(
      { email: 'fox@agency.com', purpose: 'reset_password' },
      { $set: { otpHash } },
      { upsert: true }
    );

    // Reset password with OTP
    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        email: 'fox@agency.com',
        otp: rawOtp,
        newPassword: 'BrandNewPassword999',
      });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // Login with new password should now succeed
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'fox@agency.com',
        password: 'BrandNewPassword999',
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  it('GET /api/v1/auth/me and PATCH /api/v1/auth/walkthrough', async () => {
    const passwordHash = await bcrypt.hash('Password123', 10);
    const user = await User.create({
      name: 'Agent Mulder',
      email: 'mulder@agency.com',
      passwordHash,
      isVerified: true,
      hasCompletedWalkthrough: false,
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'mulder@agency.com',
        password: 'Password123',
      });
    const token = loginRes.body.data.token;

    // GET /me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('mulder@agency.com');
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
