import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, closeTestDb } from './setup.js';
import { User } from '../src/models/User.js';
import { OtpVerification } from '../src/models/OtpVerification.js';
import { generateOtpCode, sendOtpEmail } from '../src/services/emailService.js';

describe('User Model, OtpVerification, & Email Service', () => {
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

  it('creates user with default verification and walkthrough values', async () => {
    const user = await User.create({
      name: 'Sherlock Holmes',
      email: 'sherlock@bakerstreet.co.uk',
      passwordHash: 'hashed_secret_password',
    });

    expect(user._id).toBeDefined();
    expect(user.name).toBe('Sherlock Holmes');
    expect(user.email).toBe('sherlock@bakerstreet.co.uk');
    expect(user.isVerified).toBe(false);
    expect(user.hasCompletedWalkthrough).toBe(false);
  });

  it('normalizes email to lowercase and trims whitespace', async () => {
    const user = await User.create({
      name: 'John Watson',
      email: '  WATSON@BakerStreet.CO.UK  ',
      passwordHash: 'hashed_secret_password',
    });

    expect(user.email).toBe('watson@bakerstreet.co.uk');
  });

  it('creates and validates OtpVerification record', async () => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otpRecord = await OtpVerification.create({
      email: 'sherlock@bakerstreet.co.uk',
      otpHash: 'hashed_otp_code',
      purpose: 'signup',
      expiresAt,
    });

    expect(otpRecord._id).toBeDefined();
    expect(otpRecord.purpose).toBe('signup');
    expect(otpRecord.attempts).toBe(0);
    expect(otpRecord.expiresAt).toEqual(expiresAt);
  });

  it('generateOtpCode returns a 6-digit numeric string', () => {
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{6}$/);
    const num = parseInt(code, 10);
    expect(num).toBeGreaterThanOrEqual(100000);
    expect(num).toBeLessThanOrEqual(999999);
  });

  it('sendOtpEmail sends or logs OTP successfully without error', async () => {
    const result = await sendOtpEmail({
      email: 'investigator@agency.com',
      otp: '482910',
      purpose: 'signup',
    });

    expect(result).toBeDefined();
    expect(result.delivered).toBe(true);
  });
});
