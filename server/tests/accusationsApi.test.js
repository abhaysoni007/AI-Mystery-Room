import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, closeTestDb } from './setup.js';
import { Case } from '../src/models/Case.js';
import { InvestigationProgress } from '../src/models/InvestigationProgress.js';
import { Accusation } from '../src/models/Accusation.js';

const sampleCaseSeed = {
  title: 'The Gallery After Midnight',
  prompt: 'A renaissance canvas vanished from the vault during a power blackout.',
  category: 'theft',
  difficulty: 'medium',
  length: 'standard',
  status: 'active',
  summary: 'A renaissance canvas vanished from the vault during a power blackout.',
  incident: {
    description: 'Power grid severed at circuit breaker.',
    location: 'Vanguard Modern Gallery, North Vault Room 3B',
    timeDescription: 'Between 21:30 and 21:37',
  },
  suspects: [
    {
      id: 'suspect_01',
      name: 'Alex Morgan',
      occupation: 'Chief Curator',
      relationship: 'Keyholder',
      summary: 'Senior curator.',
      publicStatement: 'I was in the VIP lounge.',
      alibiPublicText: 'Claims to have stayed in lounge.',
    },
    {
      id: 'suspect_02',
      name: 'Julian Ross',
      occupation: 'Master Restorer',
      relationship: 'Conservator',
      summary: 'Restorer with laser tools.',
      publicStatement: 'I left at 20:45.',
      alibiPublicText: 'Claims he departed at 20:45.',
    },
  ],
  timeline: [],
  evidence: [
    {
      id: 'evidence_01',
      type: 'document',
      title: 'Keycard Access Log',
      description: 'Audit log exported from server.',
    },
  ],
  solution: {
    culpritId: 'suspect_02',
    culpritName: 'Julian Ross',
    motive: 'Personal debt.',
    method: 'Breaker box bypass.',
    rationale: 'Access log conflicts with train schedule.',
    decisiveEvidenceIds: ['evidence_01'],
    redHerrings: [
      {
        suspectId: 'suspect_01',
        explanation: 'Alex Morgan was in the VIP lounge with patrons.',
      },
    ],
  },
};

describe('Accusation & Authorized Result API', () => {
  beforeAll(async () => {
    await connectTestDb();
  }, 120000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Case.deleteMany({});
    await InvestigationProgress.deleteMany({});
    await Accusation.deleteMany({});
  });

  it('rejects accusation when suspectId is missing', async () => {
    const created = await Case.create(sampleCaseSeed);

    const res = await request(app)
      .post(`/api/v1/cases/${created._id}/accusations`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when accused suspect does not exist in the case', async () => {
    const created = await Case.create(sampleCaseSeed);

    const res = await request(app)
      .post(`/api/v1/cases/${created._id}/accusations`)
      .send({ suspectId: 'suspect_nonexistent' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SUSPECT_NOT_FOUND');
  });

  it('evaluates correct accusation deterministically, records score 100, and completes case', async () => {
    const created = await Case.create(sampleCaseSeed);
    await InvestigationProgress.create({
      caseId: created._id,
      userId: 'user_anonymous',
      openedEvidenceIds: ['evidence_01'],
    });

    const res = await request(app)
      .post(`/api/v1/cases/${created._id}/accusations`)
      .send({
        suspectId: 'suspect_02', // Julian Ross is canonical culprit
        reasoning: 'Keycard access logs at 21:29 prove presence in vault tunnel.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accusation.isCorrect).toBe(true);
    expect(res.body.data.accusation.score).toBe(100);
    expect(res.body.data.resultAvailable).toBe(true);

    // Case and progress status updated to completed
    const updatedCase = await Case.findById(created._id);
    expect(updatedCase.status).toBe('completed');
    expect(updatedCase.completedAt).not.toBeNull();

    const updatedProgress = await InvestigationProgress.findOne({ caseId: created._id });
    expect(updatedProgress.status).toBe('completed');
  });

  it('evaluates incorrect accusation deterministically with score 0 and completes case', async () => {
    const created = await Case.create(sampleCaseSeed);

    const res = await request(app)
      .post(`/api/v1/cases/${created._id}/accusations`)
      .send({
        suspectId: 'suspect_01', // Alex Morgan is innocent
        reasoning: 'He was the curator.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accusation.isCorrect).toBe(false);
    expect(res.body.data.accusation.score).toBe(0);
  });

  it('rejects duplicate accusation when case is already completed', async () => {
    const created = await Case.create({
      ...sampleCaseSeed,
      status: 'completed',
    });

    const res = await request(app)
      .post(`/api/v1/cases/${created._id}/accusations`)
      .send({ suspectId: 'suspect_02' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CASE_ALREADY_COMPLETED');
  });

  it('GET /api/v1/cases/:caseId/result blocks access before case completion (security boundary)', async () => {
    const created = await Case.create(sampleCaseSeed); // status: 'active'

    const res = await request(app).get(`/api/v1/cases/${created._id}/result`);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CASE_NOT_COMPLETED');
    expect(JSON.stringify(res.body)).not.toContain('Personal debt');
  });

  it('GET /api/v1/cases/:caseId/result reveals canonical culprit, motive, and decisive clues on completed case', async () => {
    const created = await Case.create({
      ...sampleCaseSeed,
      status: 'completed',
      completedAt: new Date(),
    });

    await Accusation.create({
      caseId: created._id,
      userId: 'user_anonymous',
      selectedSuspectId: 'suspect_02',
      reasoning: 'Keycard access contradiction.',
      isCorrect: true,
      score: 100,
    });

    const res = await request(app).get(`/api/v1/cases/${created._id}/result`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const result = res.body.data.result;
    expect(result.status).toBe('completed');
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(100);
    expect(result.culprit.id).toBe('suspect_02');
    expect(result.culprit.name).toBe('Julian Ross');
    expect(result.solution.motive).toBe('Personal debt.');
    expect(result.solution.method).toBe('Breaker box bypass.');
    expect(result.solution.decisiveEvidenceIds).toContain('evidence_01');
    expect(result.solution.redHerrings).toHaveLength(1);
  });
});
