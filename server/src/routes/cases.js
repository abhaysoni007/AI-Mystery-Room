import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Case } from '../models/Case.js';
import { InvestigationProgress } from '../models/InvestigationProgress.js';
import { Accusation } from '../models/Accusation.js';
import { serializePublicCase, serializePublicCaseSummary } from '../serializers/caseSerializer.js';
import { sendSuccess, sendError } from '../utils/response.js';

const casesRouter = Router();

const createCaseSchema = z.object({
  scenario: z
    .string({ required_error: 'Scenario premise is required' })
    .trim()
    .min(20, 'Scenario description must be at least 20 characters')
    .max(2000, 'Scenario description cannot exceed 2000 characters'),
  category: z
    .enum(['theft', 'murder', 'disappearance', 'corporate_espionage', 'cybercrime', 'blackmail', 'other'])
    .optional()
    .default('theft'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  length: z.enum(['short', 'standard', 'extended']).optional().default('standard'),
});

// GET /api/v1/cases - List cases
casesRouter.get('/', async (req, res, next) => {
  try {
    const filter = { ownerId: 'user_anonymous' };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const cases = await Case.find(filter).sort({ updatedAt: -1 });
    const serialized = cases.map(serializePublicCaseSummary);

    return sendSuccess(res, {
      data: { cases: serialized },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/cases - Create new mystery case
casesRouter.post('/', async (req, res, next) => {
  try {
    const validation = createCaseSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Invalid case options',
        statusCode: 400,
        fields: validation.error.flatten().fieldErrors,
      });
    }

    const { scenario, category, difficulty, length } = validation.data;
    const title = scenario.length > 40 ? scenario.slice(0, 40) + '...' : scenario;

    // Seed playable mystery structure
    const newCasePayload = {
      title,
      prompt: scenario,
      category,
      difficulty,
      length,
      status: 'active',
      summary: scenario,
      incident: {
        description: scenario,
        location: 'Crime Scene Vault',
        timeDescription: 'Estimated between 21:00 and 22:00',
      },
      suspects: [
        {
          id: 'suspect_01',
          name: 'Alex Morgan',
          occupation: 'Lead Director',
          relationship: 'Primary Keyholder',
          summary: 'Executive director with access permissions.',
          publicStatement: 'I was attending patrons in the lobby.',
          alibiPublicText: 'Claims to have remained in the lobby.',
          relatedEvidenceIds: ['evidence_log_01'],
          relatedEventIds: ['event_01'],
        },
        {
          id: 'suspect_02',
          name: 'Julian Ross',
          occupation: 'Specialist Contractor',
          relationship: 'Restoration Specialist',
          summary: 'Specialist with equipment in basement workshop.',
          publicStatement: 'I departed the building before closure.',
          alibiPublicText: 'Claims he caught an early express train.',
          relatedEvidenceIds: ['evidence_log_01'],
          relatedEventIds: ['event_01'],
        },
      ],
      timeline: [
        {
          id: 'event_01',
          timeDescription: '21:00',
          description: 'Access alarm triggered in east service wing.',
          relatedSuspectIds: ['suspect_02'],
          relatedEvidenceIds: ['evidence_log_01'],
          displayOrder: 1,
        },
      ],
      evidence: [
        {
          id: 'evidence_log_01',
          type: 'document',
          title: 'Access Telemetry Audit',
          description: 'Extracted keycard access logs.',
          sourceContext: 'Security control console.',
          content: { records: [{ timestamp: '21:28', badge: 'ID-092 (J. Ross)' }] },
          relatedSuspectIds: ['suspect_02'],
          relatedEventIds: ['event_01'],
        },
      ],
      solution: {
        culpritId: 'suspect_02',
        culpritName: 'Julian Ross',
        motive: 'Personal financial pressure.',
        method: 'Used maintenance credentials during blackout.',
        rationale: 'Access log conflicts with alibi.',
        decisiveEvidenceIds: ['evidence_log_01'],
        redHerrings: [],
      },
    };

    const created = await Case.create(newCasePayload);
    const summary = serializePublicCaseSummary(created);

    return sendSuccess(res, {
      data: { case: summary },
      message: 'Mystery created',
      statusCode: 201,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/cases/:caseId - Get public case dossier
casesRouter.get('/:caseId', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    const publicCase = serializePublicCase(caseDoc);
    return sendSuccess(res, {
      data: { case: publicCase },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/cases/:caseId - Delete case and progress
casesRouter.delete('/:caseId', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    const deleted = await Case.findByIdAndDelete(caseId);
    if (!deleted) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    await InvestigationProgress.deleteMany({ caseId });
    await Accusation.deleteMany({ caseId });

    return sendSuccess(res, {
      data: null,
      message: 'Case deleted',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/cases/:caseId/progress - Get investigation progress
casesRouter.get('/:caseId/progress', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    let progress = await InvestigationProgress.findOne({ caseId, userId: 'user_anonymous' });
    if (!progress) {
      progress = await InvestigationProgress.create({
        caseId,
        userId: 'user_anonymous',
        openedEvidenceIds: [],
        notes: '',
        status: 'active',
      });
    }

    return sendSuccess(res, {
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/cases/:caseId/progress - Update progress & notes
casesRouter.patch('/:caseId/progress', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    let progress = await InvestigationProgress.findOne({ caseId, userId: 'user_anonymous' });
    if (!progress) {
      progress = new InvestigationProgress({
        caseId,
        userId: 'user_anonymous',
        openedEvidenceIds: [],
        notes: '',
        status: 'active',
      });
    }

    const { openedEvidenceId, notes } = req.body;

    if (openedEvidenceId && !progress.openedEvidenceIds.includes(openedEvidenceId)) {
      progress.openedEvidenceIds.push(openedEvidenceId);
    }

    if (typeof notes === 'string') {
      progress.notes = notes;
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    return sendSuccess(res, {
      data: { progress },
      message: 'Progress updated',
    });
  } catch (err) {
    next(err);
  }
});

export default casesRouter;
