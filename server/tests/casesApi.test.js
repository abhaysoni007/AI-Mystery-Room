import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, closeTestDb } from './setup.js';
import { User } from '../src/models/User.js';
import { Case } from '../src/models/Case.js';
import { InvestigationProgress } from '../src/models/InvestigationProgress.js';

vi.mock('../src/services/geminiService.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateMysteryCase: vi.fn().mockImplementation(async ({ scenario, category, difficulty, length }) => ({
      title: 'The Stolen Renaissance Fresco',
      summary: `Investigation into: ${scenario}`,
      category: category || 'theft',
      difficulty: difficulty || 'medium',
      length: length || 'standard',
      incident: {
        description: 'Fresco cut from wall.',
        location: 'Palazzo Medici',
        timeDescription: 'Midnight',
      },
      suspects: [
        {
          id: 'suspect_1',
          name: 'Marcello Rossi',
          occupation: 'Conservator',
          relationship: 'Advisor',
          summary: 'Gambling debts.',
          alibiPublicText: 'Was in Rome.',
          isCulprit: true,
          relatedEvidenceIds: ['ev_1'],
          relatedEventIds: ['evt_1'],
        },
        {
          id: 'suspect_2',
          name: 'Bianca Conti',
          occupation: 'Archivist',
          relationship: 'Genealogist',
          summary: 'Disputed ownership.',
          alibiPublicText: 'Was in library.',
          isCulprit: false,
          relatedEvidenceIds: ['ev_2'],
          relatedEventIds: ['evt_2'],
        },
      ],
      timeline: [
        {
          id: 'evt_1',
          timeDescription: '23:45',
          description: 'Wire saw sound.',
          displayOrder: 1,
        },
        {
          id: 'evt_2',
          timeDescription: '00:15',
          description: 'Gate opened.',
          displayOrder: 2,
        },
      ],
      evidence: [
        {
          id: 'ev_1',
          type: 'document',
          title: 'Train Ticket',
          description: 'Ticket timestamp.',
          content: { text: 'Validated next morning.' },
        },
        {
          id: 'ev_2',
          type: 'document',
          title: 'Library Ledger',
          description: 'Check out log.',
          content: { text: 'Logged at 23:30.' },
        },
        {
          id: 'ev_3',
          type: 'surveillance',
          title: 'Gate Camera',
          description: 'Gate feed.',
          content: { caption: 'Shadow seen.' },
        },
      ],
      solution: {
        culpritId: 'suspect_1',
        culpritName: 'Marcello Rossi',
        motive: 'Gambling debts',
        method: 'Diamond-wire extraction',
        rationale: 'Ticket timestamp proves alibi was false.',
        decisiveEvidenceIds: ['ev_1'],
        redHerrings: [],
      },
    })),
  };
});

describe('Cases & Progress REST API', () => {
  let authToken;
  let testUserId;

  const buildSampleCase = (ownerId) => ({
    ownerId,
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
        relatedEvidenceIds: ['evidence_01'],
        relatedEventIds: ['event_01'],
      },
      {
        id: 'suspect_02',
        name: 'Julian Ross',
        occupation: 'Master Restorer',
        relationship: 'Conservator',
        summary: 'Restorer with laser cutter.',
        publicStatement: 'I left at 20:45.',
        alibiPublicText: 'Claims he departed at 20:45.',
        relatedEvidenceIds: ['evidence_01'],
        relatedEventIds: ['event_01'],
      },
    ],
    timeline: [
      {
        id: 'event_01',
        timeDescription: '20:00',
        description: 'Gala opens in grand atrium.',
        relatedSuspectIds: ['suspect_01'],
        relatedEvidenceIds: [],
      },
    ],
    evidence: [
      {
        id: 'evidence_01',
        type: 'document',
        title: 'Keycard Access Log',
        description: 'Audit log exported from server.',
        content: { records: [] },
        relatedSuspectIds: ['suspect_02'],
        relatedEventIds: ['event_01'],
      },
    ],
    solution: {
      culpritId: 'suspect_02',
      culpritName: 'Julian Ross',
      motive: 'Personal debt.',
      method: 'Breaker box bypass.',
      rationale: 'Access log conflicts with train schedule.',
      decisiveEvidenceIds: ['evidence_01'],
      redHerrings: [],
    },
  });

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

    const signup = await request(app).post('/api/v1/auth/signup').send({
      username: 'investigator_test',
      password: 'Password123!',
      name: 'Test Detective',
    });
    authToken = signup.body.data.token;
    testUserId = signup.body.data.user.id;
  });

  it('GET /api/v1/cases returns list of case summaries for authenticated user', async () => {
    await Case.create(buildSampleCase(testUserId));

    const res = await request(app)
      .get('/api/v1/cases')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cases).toHaveLength(1);
    expect(res.body.data.cases[0].title).toBe('The Gallery After Midnight');
    expect(res.body.data.cases[0].solution).toBeUndefined();
  });

  it('POST /api/v1/cases validates scenario length and creates new case', async () => {
    const invalidRes = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ scenario: 'Too short' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.success).toBe(false);
    expect(invalidRes.body.error.code).toBe('VALIDATION_ERROR');

    const validRes = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        scenario: 'A rare jewel was stolen from a private collector during an exhibition blackout.',
        category: 'theft',
        difficulty: 'medium',
        length: 'standard',
        forceFallback: true,
      });

    expect(validRes.status).toBe(201);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.case).toHaveProperty('id');
    expect(validRes.body.data.case.solution).toBeUndefined();

    const createdId = validRes.body.data.case.id;
    const dbCase = await Case.findById(createdId);
    expect(dbCase).not.toBeNull();
    expect(dbCase.ownerId).toBe(testUserId);
    expect(dbCase.suspects.length).toBeGreaterThanOrEqual(2);
    expect(dbCase.evidence.length).toBeGreaterThanOrEqual(3);
    expect(dbCase.timeline.length).toBeGreaterThanOrEqual(2);
    expect(dbCase.solution.culpritId).toBeTruthy();

    const dbProgress = await InvestigationProgress.findOne({ caseId: createdId, userId: testUserId });
    expect(dbProgress).not.toBeNull();
    expect(dbProgress.status).toBe('active');
  });

  it('GET /api/v1/cases/:caseId returns full public dossier without private solution', async () => {
    const created = await Case.create(buildSampleCase(testUserId));

    const res = await request(app)
      .get(`/api/v1/cases/${created._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.case.id).toBe(created._id.toString());
    expect(res.body.data.case.suspects).toHaveLength(2);
    expect(res.body.data.case.evidence).toHaveLength(1);
    expect(res.body.data.case.solution).toBeUndefined();
    expect(res.body.data.case.culpritId).toBeUndefined();
  });

  it('GET /api/v1/cases/:caseId returns 404 for non-existent case', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .get(`/api/v1/cases/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CASE_NOT_FOUND');
  });

  it('DELETE /api/v1/cases/:caseId removes case and associated progress', async () => {
    const created = await Case.create(buildSampleCase(testUserId));
    await InvestigationProgress.create({
      caseId: created._id,
      userId: testUserId,
      openedEvidenceIds: ['evidence_01'],
      notes: 'Notes to be wiped.',
    });

    const res = await request(app)
      .delete(`/api/v1/cases/${created._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkCase = await Case.findById(created._id);
    expect(checkCase).toBeNull();
    const checkProgress = await InvestigationProgress.findOne({ caseId: created._id });
    expect(checkProgress).toBeNull();
  });

  it('GET /api/v1/cases/:caseId/progress returns existing or initialized progress', async () => {
    const created = await Case.create(buildSampleCase(testUserId));

    const res = await request(app)
      .get(`/api/v1/cases/${created._id}/progress`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progress).toHaveProperty('openedEvidenceIds');
    expect(res.body.data.progress.status).toBe('active');
  });

  it('PATCH /api/v1/cases/:caseId/progress updates opened evidence and notes', async () => {
    const created = await Case.create(buildSampleCase(testUserId));

    const res = await request(app)
      .patch(`/api/v1/cases/${created._id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        openedEvidenceId: 'evidence_01',
        notes: 'Julian Ross keycard record was noted.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progress.openedEvidenceIds).toContain('evidence_01');
    expect(res.body.data.progress.notes).toBe('Julian Ross keycard record was noted.');
  });
});
