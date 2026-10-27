import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectTestDb, closeTestDb } from './setup.js';
import { User } from '../src/models/User.js';
import { Case } from '../src/models/Case.js';
import { InvestigationProgress } from '../src/models/InvestigationProgress.js';
import { Accusation } from '../src/models/Accusation.js';

describe('P0 Security: Strict User-Level Case Isolation Regression Suite', () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;
  let userACaseId;

  beforeAll(async () => {
    await connectTestDb();
  }, 120000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Case.deleteMany({});
    await InvestigationProgress.deleteMany({});
    await Accusation.deleteMany({});

    // Register User A
    const signupA = await request(app).post('/api/v1/auth/signup').send({
      username: 'detective_alpha',
      password: 'Password123!',
      name: 'Agent Alpha',
    });
    userAToken = signupA.body.data.token;
    userAId = signupA.body.data.user.id;

    // Register User B
    const signupB = await request(app).post('/api/v1/auth/signup').send({
      username: 'detective_bravo',
      password: 'Password123!',
      name: 'Agent Bravo',
    });
    userBToken = signupB.body.data.token;
    userBId = signupB.body.data.user.id;

    // User A creates a case
    const createCaseRes = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        scenario: 'A rare Renaissance ruby disappeared from the gallery display safe',
        category: 'theft',
        difficulty: 'medium',
        length: 'standard',
        forceFallback: true, // Uses deterministic structure for predictable test assertions
      });

    expect(createCaseRes.status).toBe(201);
    userACaseId = createCaseRes.body.data.case.id;
  });

  it('Enforces 401 UNAUTHORIZED on unauthenticated requests for all case endpoints', async () => {
    const listRes = await request(app).get('/api/v1/cases');
    expect(listRes.status).toBe(401);
    expect(listRes.body.error.code).toBe('UNAUTHORIZED');

    const getRes = await request(app).get(`/api/v1/cases/${userACaseId}`);
    expect(getRes.status).toBe(401);

    const postRes = await request(app).post('/api/v1/cases').send({
      scenario: 'An unauthenticated intrusion attempt on the executive vault',
    });
    expect(postRes.status).toBe(401);

    const deleteRes = await request(app).delete(`/api/v1/cases/${userACaseId}`);
    expect(deleteRes.status).toBe(401);

    const progressGetRes = await request(app).get(`/api/v1/cases/${userACaseId}/progress`);
    expect(progressGetRes.status).toBe(401);

    const progressPatchRes = await request(app)
      .patch(`/api/v1/cases/${userACaseId}/progress`)
      .send({ notes: 'Hacked notes' });
    expect(progressPatchRes.status).toBe(401);

    const accuseRes = await request(app)
      .post(`/api/v1/cases/${userACaseId}/accusations`)
      .send({ suspectId: 'suspect_julian' });
    expect(accuseRes.status).toBe(401);

    const resultRes = await request(app).get(`/api/v1/cases/${userACaseId}/result`);
    expect(resultRes.status).toBe(401);
  });

  it('Allows User A to access, list, and view their own private case', async () => {
    // List check
    const listRes = await request(app)
      .get('/api/v1/cases')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.cases).toHaveLength(1);
    expect(listRes.body.data.cases[0].id).toBe(userACaseId);

    // Detail check
    const detailRes = await request(app)
      .get(`/api/v1/cases/${userACaseId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.case.id).toBe(userACaseId);
    expect(detailRes.body.data.case.solution).toBeUndefined(); // Secrecy boundary
  });

  it('Prevents User B from seeing User A case in the case listing', async () => {
    const listRes = await request(app)
      .get('/api/v1/cases')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.cases).toHaveLength(0);
  });

  it('Prevents User B from retrieving User A case by ID (returns 404 CASE_NOT_FOUND)', async () => {
    const getRes = await request(app)
      .get(`/api/v1/cases/${userACaseId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body.error.code).toBe('CASE_NOT_FOUND');
  });

  it('Prevents User B from deleting User A case (returns 404 CASE_NOT_FOUND)', async () => {
    const delRes = await request(app)
      .delete(`/api/v1/cases/${userACaseId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(delRes.status).toBe(404);
    expect(delRes.body.error.code).toBe('CASE_NOT_FOUND');

    // Verify User A case remains intact in the database
    const intactCase = await Case.findById(userACaseId);
    expect(intactCase).not.toBeNull();
    expect(intactCase.ownerId).toBe(userAId);
  });

  it('Prevents User B from accessing or updating User A nested progress and notes', async () => {
    // Attempt GET progress
    const getProgRes = await request(app)
      .get(`/api/v1/cases/${userACaseId}/progress`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(getProgRes.status).toBe(404);
    expect(getProgRes.body.error.code).toBe('CASE_NOT_FOUND');

    // Attempt PATCH progress
    const patchProgRes = await request(app)
      .patch(`/api/v1/cases/${userACaseId}/progress`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ notes: 'Hostile takeover of notes', openedEvidenceId: 'ev_access_log' });
    expect(patchProgRes.status).toBe(404);
    expect(patchProgRes.body.error.code).toBe('CASE_NOT_FOUND');

    // Verify User A progress was untouched
    const userAProgress = await InvestigationProgress.findOne({ caseId: userACaseId, userId: userAId });
    expect(userAProgress.notes).toBe('');
    expect(userAProgress.openedEvidenceIds).toEqual([]);
  });

  it('Prevents User B from submitting an accusation or altering status on User A case', async () => {
    const accuseRes = await request(app)
      .post(`/api/v1/cases/${userACaseId}/accusations`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ suspectId: 'suspect_alyssa', reasoning: 'I am attacking User A case' });
    expect(accuseRes.status).toBe(404);
    expect(accuseRes.body.error.code).toBe('CASE_NOT_FOUND');

    // Verify User A case status remains active and no accusations exist
    const intactCase = await Case.findById(userACaseId);
    expect(intactCase.status).toBe('active');
    const accusations = await Accusation.find({ caseId: userACaseId });
    expect(accusations).toHaveLength(0);
  });

  it('Prevents User B from revealing the solution to User A case', async () => {
    const resultRes = await request(app)
      .get(`/api/v1/cases/${userACaseId}/result`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(resultRes.status).toBe(404);
    expect(resultRes.body.error.code).toBe('CASE_NOT_FOUND');
  });

  it('Prevents mass-assignment ownership tampering when creating a case', async () => {
    // User B attempts to create a case but supply User A's ID as ownerId
    const hostileCreate = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        scenario: 'A deceptive corporate infiltration designed to spoof ownership',
        category: 'corporate_espionage',
        ownerId: userAId, // Client attempt to inject User A
        userId: userAId,
        forceFallback: true,
      });

    expect(hostileCreate.status).toBe(201);
    const createdCaseId = hostileCreate.body.data.case.id;

    // Verify in database that the case was bound authoritatively to User B (the authenticated user)
    const storedCase = await Case.findById(createdCaseId);
    expect(storedCase.ownerId).toBe(userBId);
    expect(storedCase.ownerId).not.toBe(userAId);

    // User A cannot see this case
    const userAList = await request(app)
      .get('/api/v1/cases')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(userAList.body.data.cases.some((c) => c.id === createdCaseId)).toBe(false);

    // User B CAN see this case
    const userBList = await request(app)
      .get('/api/v1/cases')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(userBList.body.data.cases.some((c) => c.id === createdCaseId)).toBe(true);
  });

  it('Allows User B to create, investigate, and solve their own independent case', async () => {
    // User B creates case
    const bCaseRes = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        scenario: 'A high-level cryptographic key was intercepted from an alpine vault',
        category: 'cybercrime',
        difficulty: 'hard',
        forceFallback: true,
      });
    expect(bCaseRes.status).toBe(201);
    const bCaseId = bCaseRes.body.data.case.id;

    // User B updates notes
    const patchRes = await request(app)
      .patch(`/api/v1/cases/${bCaseId}/progress`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ notes: 'Discovered anomaly in packet headers', openedEvidenceId: 'ev_access_log' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.progress.notes).toBe('Discovered anomaly in packet headers');

    // User B submits accusation
    const accuseRes = await request(app)
      .post(`/api/v1/cases/${bCaseId}/accusations`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ suspectId: 'suspect_julian', reasoning: 'Keycard access logs conflict' });
    expect(accuseRes.status).toBe(201);

    // User B reveals result
    const resultRes = await request(app)
      .get(`/api/v1/cases/${bCaseId}/result`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.result.culprit).toBeDefined();

    // User A case is still active and unmodified
    const aCase = await Case.findById(userACaseId);
    expect(aCase.status).toBe('active');
  });
});
