import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env.js';
import { validateCaseReferences, sanitizeCaseReferences } from './caseValidator.js';
import { generateCaseWithOpenRouter } from './openRouterService.js';
import {
  buildDiversityPromptContext,
  calculateScenarioSimilarity,
} from './scenarioDiversity.js';

export { sanitizeCaseReferences };

export class AiGenerationError extends Error {
  constructor(message, originalError = null, statusCode = 502) {
    super(message);
    this.name = 'AiGenerationError';
    this.originalError = originalError;
    this.statusCode = statusCode;
  }
}

/**
 * Builds the structured JSON schema for Gemini mystery generation.
 */
function buildGeminiResponseSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      category: { type: Type.STRING },
      difficulty: { type: Type.STRING },
      incident: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          location: { type: Type.STRING },
          timeDescription: { type: Type.STRING },
        },
        required: ['description', 'location', 'timeDescription'],
      },
      suspects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            occupation: { type: Type.STRING },
            relationship: { type: Type.STRING },
            summary: { type: Type.STRING },
            background: { type: Type.STRING },
            publicStatement: { type: Type.STRING },
            alibiPublicText: { type: Type.STRING },
            relatedEvidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            relatedEventIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['id', 'name', 'occupation', 'relationship', 'summary', 'alibiPublicText'],
        },
      },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            timeDescription: { type: Type.STRING },
            description: { type: Type.STRING },
            relatedSuspectIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            relatedEvidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            displayOrder: { type: Type.INTEGER },
          },
          required: ['id', 'timeDescription', 'description'],
        },
      },
      evidence: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            timeDescription: { type: Type.STRING },
            sourceContext: { type: Type.STRING },
            content: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                documentType: { type: Type.STRING },
                cameraLocation: { type: Type.STRING },
                caption: { type: Type.STRING },
                participants: { type: Type.ARRAY, items: { type: Type.STRING } },
                messages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      sender: { type: Type.STRING },
                      timestamp: { type: Type.STRING },
                      text: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            relatedSuspectIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            relatedEventIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['id', 'type', 'title', 'description'],
        },
      },
      solution: {
        type: Type.OBJECT,
        properties: {
          culpritId: { type: Type.STRING },
          culpritName: { type: Type.STRING },
          motive: { type: Type.STRING },
          method: { type: Type.STRING },
          rationale: { type: Type.STRING },
          decisiveEvidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          redHerrings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                suspectId: { type: Type.STRING },
                evidenceId: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
            },
          },
        },
        required: ['culpritId', 'motive', 'method', 'rationale', 'decisiveEvidenceIds'],
      },
    },
    required: ['title', 'summary', 'incident', 'suspects', 'timeline', 'evidence', 'solution'],
  };
}



/**
 * Builds the complete generation prompt incorporating user specifications and diversity context.
 */
function buildGenerationPrompt({ scenario, category, difficulty, length, recentCases = [], correctiveFeedback = '' }) {
  const diversityContext = buildDiversityPromptContext({ recentCases, scenario, category });

  return `You are the Lead Mystery Architect for Mysterio, an interactive detective mystery investigation game.
Create a complete, solvable, clue-corroborated mystery case based on the following user specifications:
- User Premise/Scenario: "${scenario}"
- Mystery Category: "${category}"
- Difficulty Level: "${difficulty}"
- Case Length: "${length}"

${diversityContext}

${correctiveFeedback ? `PREVIOUS GENERATION CORRECTIONS (MUST FIX):\n${correctiveFeedback}\n` : ''}

STRICT DETECTIVE FICTION & FAIR-PLAY RULES:
1. Provide 3 or 4 suspects, each with a distinct occupation, relationship to the victim/target, plausible motive, opportunity, and public alibi.
2. Provide between 4 and 6 pieces of diverse evidence (mix of types: "chat_log", "document", "surveillance", "access_log", "image").
3. Provide at least 3 timeline events with chronological displayOrder.
4. Establish ONE true culprit whose identity is in the suspects array.
5. In the "solution" object:
   - "culpritId" MUST exactly match one of the suspect IDs.
   - "culpritName" MUST match the culprit suspect's name.
   - "decisiveEvidenceIds" MUST be an array containing 1 to 3 evidence IDs from your evidence list that conclusively refute the culprit's alibi or prove their guilt.
   - "redHerrings" must contain at least 1 innocent suspect whose suspicious behavior is explained by benign or non-culprit reasons.
6. The solution MUST be logically airtight. There must be one clear deductive contradiction or forensic proof connecting the decisive evidence to the culprit.
7. Return only valid JSON conforming strictly to the requested schema.`;
}

/**
 * Generates an interactive mystery case using Gemini with OpenRouter Nemotron fallback and diversity guarantees.
 * Throws AiGenerationError on failure; never silently falls back to a static case.
 *
 * @param {Object} options
 * @param {string} options.scenario - User-provided premise
 * @param {string} options.category - Mystery genre/category
 * @param {string} options.difficulty - Difficulty level
 * @param {string} options.length - Case duration
 * @param {Array} options.recentCases - Recent user cases for diversity comparison
 * @param {Object} options.modelClient - Injectable GenAI client for testing Gemini
 * @param {Function} options.openRouterClient - Injectable fetch client for testing OpenRouter
 */
export async function generateMysteryCase({
  scenario = 'An unexplained theft in an executive penthouse',
  category = 'theft',
  difficulty = 'medium',
  length = 'standard',
  recentCases = [],
  modelClient = null,
  openRouterClient = null,
} = {}) {
  const geminiApiKey = env.GEMINI_API_KEY;
  let geminiError = null;

  // 1. Attempt Primary Generation via Google Gemini
  if (geminiApiKey || modelClient) {
    const modelName = env.GEMINI_MODEL || 'gemini-3.8-flash';
    const ai = modelClient || new GoogleGenAI({ apiKey: geminiApiKey });

    const maxAttempts = 2;
    let correctiveFeedback = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const prompt = buildGenerationPrompt({
          scenario,
          category,
          difficulty,
          length,
          recentCases,
          correctiveFeedback,
        });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: buildGeminiResponseSchema(),
          },
        });

        const rawText = response.text || (typeof response === 'string' ? response : null);
        if (!rawText || !rawText.trim()) {
          throw new Error('Empty response received from Gemini API');
        }

        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (jsonErr) {
          throw new Error(`Model output was not valid JSON: ${jsonErr.message}`);
        }

        const sanitized = sanitizeCaseReferences(parsed);
        const validation = validateCaseReferences(sanitized);

        if (!validation.valid) {
          throw new Error(`Case failed detective reference integrity validation: ${validation.errors.join('; ')}`);
        }

        // Check scenario diversity against user's recent cases
        if (recentCases.length > 0) {
          const similarity = calculateScenarioSimilarity(sanitized, recentCases);
          if (similarity > 0.75) {
            throw new Error(
              `Generated case is too similar to recent cases (similarity score: ${similarity.toFixed(2)}). Must use a different culprit and evidence mechanic.`
            );
          }
        }

        // Gemini generation succeeded!
        return sanitized;
      } catch (err) {
        geminiError = err;
        correctiveFeedback = err.message;
        console.warn(`[GeminiService] Attempt ${attempt} failed: ${err.message}`);

        // If error is an unrecoverable auth/quota/not-found error, don't loop
        const msg = err.message || '';
        if (
          msg.includes('API_KEY_INVALID') ||
          msg.includes('PERMISSION_DENIED') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('quota')
        ) {
          break;
        }
      }
    }
  } else {
    geminiError = new Error('Gemini API key is not configured.');
  }

  // 2. Attempt Fallback Generation via OpenRouter with Nvidia Nemotron
  const openRouterApiKey = env.OPENROUTER_API_KEY;
  if (openRouterApiKey || openRouterClient) {
    console.info(
      `[AI Generation] Gemini API unavailable or failed (${geminiError?.message || 'Unknown error'}). Activating OpenRouter (${env.OPENROUTER_MODEL}) fallback...`
    );
    try {
      const openRouterCase = await generateCaseWithOpenRouter({
        scenario,
        category,
        difficulty,
        length,
        recentCases,
        fetchClient: openRouterClient,
      });

      return openRouterCase;
    } catch (openRouterErr) {
      console.warn(`[AI Generation] OpenRouter fallback failed: ${openRouterErr.message}`);
      throw new AiGenerationError(
        `Failed to generate a genuine AI mystery case. Gemini error: ${geminiError?.message || 'Model unavailable'}. OpenRouter (${env.OPENROUTER_MODEL}) fallback error: ${openRouterErr.message}. Please try again.`,
        openRouterErr,
        502
      );
    }
  }

  // 3. Both providers exhausted / OpenRouter not configured: Throw user-facing error
  throw new AiGenerationError(
    `Failed to generate a genuine AI mystery case: ${geminiError?.message || 'Model unavailable'}. Please set OPEN_ROUTER_API or verify GEMINI_API_KEY.`,
    geminiError,
    502
  );
}

