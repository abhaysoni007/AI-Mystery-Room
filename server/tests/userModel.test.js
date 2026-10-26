import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, closeTestDb } from './setup.js';
import { User } from '../src/models/User.js';

describe('User Model', () => {
  beforeAll(async () => {
    await connectTestDb();
    await User.init();
  }, 120000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('creates user with default walkthrough value', async () => {
    const user = await User.create({
      name: 'Sherlock Holmes',
      username: 'sherlock',
      passwordHash: 'hashed_secret_password',
    });

    expect(user._id).toBeDefined();
    expect(user.name).toBe('Sherlock Holmes');
    expect(user.username).toBe('sherlock');
    expect(user.hasCompletedWalkthrough).toBe(false);
  });

  it('normalizes username to lowercase and trims whitespace', async () => {
    const user = await User.create({
      name: 'John Watson',
      username: '  WATSON_221B  ',
      passwordHash: 'hashed_secret_password',
    });

    expect(user.username).toBe('watson_221b');
  });

  it('enforces unique username', async () => {
    await User.create({
      name: 'Agent Vance',
      username: 'vance_007',
      passwordHash: 'hash1',
    });

    let duplicateError;
    try {
      await User.create({
        name: 'Another Vance',
        username: 'vance_007',
        passwordHash: 'hash2',
      });
    } catch (err) {
      duplicateError = err;
    }

    expect(duplicateError).toBeDefined();
    expect(duplicateError.code).toBe(11000);
  });
});
