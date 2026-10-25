import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { connectTestDb, closeTestDb } from './setup.js';
import { Case } from '../src/models/Case.js';
import { InvestigationProgress } from '../src/models/InvestigationProgress.js';
import { Accusation } from '../src/models/Accusation.js';
import { serializePublicCase, serializePublicCaseSummary } from '../src/serializers/caseSerializer.js';

const mockCasePayload = {
  title: 'The Gallery After Midnight',
  prompt: 'A priceless renaissance canvas vanished from the vault during a power blackout.',
  category: 'theft',
  difficulty: 'medium',
  length: 'standard',
  status: 'active',
  summary: 'A priceless renaissance canvas vanished from the high-security vault.',
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
      relationship: 'Keyholder and curator',
      summary: 'Distinguished art historian.',
      publicStatement: 'I was in the VIP lounge.',
      alibiPublicText: 'Claims to have stayed in VIP lounge.',
      relatedEvidenceIds: ['evidence_log_01'],
      relatedEventIds: ['event_01'],
    },
    {
      id: 'suspect_02',
      name: 'Julian Ross',
      occupation: 'Master Restorer',
      relationship: 'Contracted conservator',
      summary: 'Art restorer with laser tools.',
      publicStatement: 'I left at 20:45.',
      alibiPublicText: 'Claims he departed at 20:45.',
      relatedEvidenceIds: ['evidence_img_01'],
      relatedEventIds: ['event_02'],
    },
  ],
  timeline: [
    {
      id: 'event_01',
      timeDescription: '20:00',
      description: 'Gala opens in grand atrium.',
      relatedSuspectIds: ['suspect_01'],
      relatedEvidenceIds: [],
      displayOrder: 1,
    },
  ],
  evidence: [
    {
      id: 'evidence_log_01',
      type: 'document',
      title: 'Keycard Access Log',
      description: 'Audit log exported from access server.',
      sourceContext: 'Security server database.',
      content: { records: [{ timestamp: '20:42', badge: 'ID-092' }] },
      relatedSuspectIds: ['suspect_02'],
      relatedEventIds: ['event_01'],
    },
  ],
  solution: {
    culpritId: 'suspect_02',
    culpritName: 'Julian Ross',
    motive: 'Heavy debt to overseas syndicates.',
    method: 'Bypassed breaker box and laser cut the vitrine.',
    rationale: 'Keycard access conflicts with stated train departure.',
    decisiveEvidenceIds: ['evidence_log_01'],
    redHerrings: [
      {
        suspectId: 'suspect_01',
        explanation: 'Alex Morgan insured the catalog per city regulations.',
      },
    ],
  },
};

describe('Mongoose Models & Serialization Boundary', () => {
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

  it('persists a complete Case document with embedded subdocuments', async () => {
    const caseDoc = await Case.create(mockCasePayload);

    expect(caseDoc._id).toBeDefined();
    expect(caseDoc.title).toBe('The Gallery After Midnight');
    expect(caseDoc.suspects).toHaveLength(2);
    expect(caseDoc.solution.culpritId).toBe('suspect_02');
  });

  it('fails validation when required fields are missing', async () => {
    await expect(Case.create({ title: 'Only Title' })).rejects.toThrow();
  });

  it('serializePublicCase strictly strips solution and private fields', async () => {
    const caseDoc = await Case.create(mockCasePayload);
    const publicData = serializePublicCase(caseDoc);

    // Public properties present
    expect(publicData.id).toBe(caseDoc._id.toString());
    expect(publicData.title).toBe('The Gallery After Midnight');
    expect(publicData.suspects).toHaveLength(2);
    expect(publicData.evidence).toHaveLength(1);
    expect(publicData.timeline).toHaveLength(1);

    // Private solution fields completely omitted
    expect(publicData.solution).toBeUndefined();
    expect(publicData.culpritId).toBeUndefined();
    expect(publicData.culprit).toBeUndefined();
    expect(JSON.stringify(publicData)).not.toContain('Heavy debt to overseas syndicates');
  });

  it('serializePublicCaseSummary returns compact dashboard summary', async () => {
    const caseDoc = await Case.create(mockCasePayload);
    const summary = serializePublicCaseSummary(caseDoc);

    expect(summary.id).toBe(caseDoc._id.toString());
    expect(summary.title).toBe(caseDoc.title);
    expect(summary.category).toBe('theft');
    expect(summary.difficulty).toBe('medium');
    expect(summary.status).toBe('active');
    expect(summary.suspectCount).toBe(2);
    expect(summary.evidenceCount).toBe(1);
    expect(summary.solution).toBeUndefined();
  });

  it('persists InvestigationProgress linked to a case', async () => {
    const caseDoc = await Case.create(mockCasePayload);
    const progress = await InvestigationProgress.create({
      caseId: caseDoc._id,
      userId: 'user_anonymous',
      openedEvidenceIds: ['evidence_log_01'],
      notes: 'Initial detective notes.',
      status: 'active',
      startedAt: new Date(),
      lastActivityAt: new Date(),
    });

    expect(progress._id).toBeDefined();
    expect(progress.caseId.toString()).toBe(caseDoc._id.toString());
    expect(progress.openedEvidenceIds).toContain('evidence_log_01');
  });

  it('persists Accusation record with score and verdict', async () => {
    const caseDoc = await Case.create(mockCasePayload);
    const accusation = await Accusation.create({
      caseId: caseDoc._id,
      userId: 'user_anonymous',
      selectedSuspectId: 'suspect_02',
      reasoning: 'Access logs prove presence at 21:29.',
      isCorrect: true,
      score: 100,
      submittedAt: new Date(),
    });

    expect(accusation._id).toBeDefined();
    expect(accusation.isCorrect).toBe(true);
    expect(accusation.score).toBe(100);
  });
});
