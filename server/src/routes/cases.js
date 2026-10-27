import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Case } from '../models/Case.js';
import { InvestigationProgress } from '../models/InvestigationProgress.js';
import { Accusation } from '../models/Accusation.js';
import { generateMysteryCase, AiGenerationError } from '../services/geminiService.js';
import { serializePublicCase, serializePublicCaseSummary } from '../serializers/caseSerializer.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const casesRouter = Router();

// Enforce strict authentication on all case operations
casesRouter.use(requireAuth);

const createCaseSchema = z.object({
  scenario: z
    .string({ required_error: 'Scenario premise is required' })
    .trim()
    .min(20, 'Scenario description must be at least 20 characters')
    .max(2000, 'Scenario description cannot exceed 2000 characters'),
  category: z
    .enum([
      'theft',
      'murder',
      'disappearance',
      'corporate_espionage',
      'corporate',
      'cybercrime',
      'blackmail',
      'general',
      'other',
    ])
    .optional()
    .default('theft'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  length: z.enum(['short', 'standard', 'extended']).optional().default('standard'),
  forceFallback: z.boolean().optional().default(false),
});

// GET /api/v1/cases - List authenticated user's private cases
casesRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const filter = { ownerId: userId };

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

// POST /api/v1/cases - Create new mystery case for authenticated user
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

    const { scenario, category, difficulty, length, forceFallback } = validation.data;
    const userId = req.user._id.toString();

    // Query user's recent cases to inject diversity context
    const recentCases = await Case.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Generate genuine AI mystery case
    let generatedCase;
    try {
      generatedCase = await generateMysteryCase({
        scenario,
        category,
        difficulty,
        length,
        recentCases,
        forceFallback,
      });
    } catch (aiErr) {
      if (aiErr instanceof AiGenerationError) {
        return sendError(res, {
          code: 'AI_GENERATION_FAILED',
          message: aiErr.message,
          statusCode: aiErr.statusCode || 502,
        });
      }
      throw aiErr;
    }

    // Authoritative ownership binding (never trust client payload for ownerId/userId)
    const newCasePayload = {
      ...generatedCase,
      prompt: scenario,
      ownerId: userId,
      status: 'active',
    };

    const created = await Case.create(newCasePayload);

    // Initialize progress record for active investigation
    await InvestigationProgress.create({
      caseId: created._id.toString(),
      userId,
      openedEvidenceIds: [],
      notes: '',
      status: 'active',
    });

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

// GET /api/v1/cases/:caseId - Get public case dossier (owner-scoped)
casesRouter.get('/:caseId', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    // Scope query strictly by case ID and authenticated owner ID
    const caseDoc = await Case.findOne({ _id: caseId, ownerId: userId });
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

// DELETE /api/v1/cases/:caseId - Delete case and progress (owner-scoped)
casesRouter.delete('/:caseId', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    // Strictly scope delete by ownerId
    const deleted = await Case.findOneAndDelete({ _id: caseId, ownerId: userId });
    if (!deleted) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    await InvestigationProgress.deleteMany({ caseId, userId });
    await Accusation.deleteMany({ caseId, userId });

    return sendSuccess(res, {
      data: null,
      message: 'Case deleted',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/cases/:caseId/progress - Get investigation progress (owner-scoped)
casesRouter.get('/:caseId/progress', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    // Verify authenticated user owns the parent case
    const caseDoc = await Case.findOne({ _id: caseId, ownerId: userId });
    if (!caseDoc) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    let progress = await InvestigationProgress.findOne({ caseId, userId });
    if (!progress) {
      progress = await InvestigationProgress.create({
        caseId,
        userId,
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

// PATCH /api/v1/cases/:caseId/progress - Update progress & notes (owner-scoped)
casesRouter.patch('/:caseId/progress', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    // Verify authenticated user owns the parent case
    const caseDoc = await Case.findOne({ _id: caseId, ownerId: userId });
    if (!caseDoc) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    let progress = await InvestigationProgress.findOne({ caseId, userId });
    if (!progress) {
      progress = new InvestigationProgress({
        caseId,
        userId,
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

// POST /api/v1/cases/:caseId/accusations - Server-authoritative accusation evaluation (owner-scoped)
casesRouter.post('/:caseId/accusations', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    // Verify authenticated user owns the parent case
    const caseDoc = await Case.findOne({ _id: caseId, ownerId: userId });
    if (!caseDoc) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    if (caseDoc.status === 'completed') {
      return sendError(res, {
        code: 'CASE_ALREADY_COMPLETED',
        message: 'An accusation has already been finalized for this case dossier',
        statusCode: 409,
      });
    }

    const { suspectId, reasoning } = req.body;
    if (!suspectId || typeof suspectId !== 'string') {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: 'suspectId is required to submit an indictment',
        statusCode: 400,
      });
    }

    const matchingSuspect = caseDoc.suspects.find((s) => s.id === suspectId);
    if (!matchingSuspect) {
      return sendError(res, {
        code: 'SUSPECT_NOT_FOUND',
        message: 'Accused suspect does not exist in this case dossier',
        statusCode: 404,
      });
    }

    // Deterministic server-authoritative evaluation
    const isCorrect = suspectId === caseDoc.solution.culpritId;
    const score = isCorrect ? 100 : 0;
    const submittedAt = new Date();

    const accusation = await Accusation.create({
      caseId,
      userId,
      selectedSuspectId: suspectId,
      reasoning: reasoning || '',
      isCorrect,
      score,
      submittedAt,
    });

    // Finalize case lifecycle
    caseDoc.status = 'completed';
    caseDoc.completedAt = submittedAt;
    await caseDoc.save();

    // Finalize progress
    await InvestigationProgress.updateOne(
      { caseId, userId },
      { $set: { status: 'completed', completedAt: submittedAt, lastActivityAt: submittedAt } },
      { upsert: true }
    );

    return sendSuccess(res, {
      data: {
        accusation: {
          id: accusation._id.toString(),
          caseId,
          selectedSuspectId: suspectId,
          isCorrect,
          score,
          submittedAt,
        },
        resultAvailable: true,
      },
      message: 'Accusation submitted',
      statusCode: 201,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/cases/:caseId/result - Authorized solution reveal (owner-scoped)
casesRouter.get('/:caseId/result', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    // Verify authenticated user owns the parent case
    const caseDoc = await Case.findOne({ _id: caseId, ownerId: userId });
    if (!caseDoc) {
      return sendError(res, {
        code: 'CASE_NOT_FOUND',
        message: 'Case dossier not found',
        statusCode: 404,
      });
    }

    // Security boundary: solution is ONLY accessible after authorized completion
    if (caseDoc.status !== 'completed') {
      return sendError(res, {
        code: 'CASE_NOT_COMPLETED',
        message: 'Case investigation must be completed before solution can be revealed',
        statusCode: 409,
      });
    }

    const accusation = await Accusation.findOne({ caseId, userId }).sort({ submittedAt: -1 });

    const culpritSuspect = caseDoc.suspects.find((s) => s.id === caseDoc.solution.culpritId);
    const culpritName = caseDoc.solution.culpritName || culpritSuspect?.name || 'Culprit';

    return sendSuccess(res, {
      data: {
        result: {
          caseId,
          status: 'completed',
          selectedSuspectId: accusation?.selectedSuspectId || null,
          reasoning: accusation?.reasoning || '',
          isCorrect: accusation?.isCorrect ?? false,
          score: accusation?.score ?? 0,
          culprit: {
            id: caseDoc.solution.culpritId,
            name: culpritName,
          },
          solution: {
            motive: caseDoc.solution.motive,
            method: caseDoc.solution.method,
            rationale: caseDoc.solution.rationale,
            decisiveEvidenceIds: caseDoc.solution.decisiveEvidenceIds || [],
            redHerrings: caseDoc.solution.redHerrings || [],
          },
          completedAt: caseDoc.completedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default casesRouter;
