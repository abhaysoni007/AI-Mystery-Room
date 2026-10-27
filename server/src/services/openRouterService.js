import { env } from '../config/env.js';
import { sanitizeCaseReferences, validateCaseReferences } from './caseValidator.js';
import { selectArchetypeBlueprint, calculateScenarioSimilarity } from './scenarioDiversity.js';

/**
 * Builds system prompt for OpenRouter case generation.
 */
export function buildOpenRouterSystemPrompt() {
  return `You are an expert detective fiction author and forensic case architect.
Your task is to design a high-quality, playable, fair-play detective mystery case.
Fair-play rules strictly require:
1. Every suspect must have a plausible motive, established opportunity, and declared alibi.
2. The culprit's alibi must be mathematically or physically broken by verifiable timestamps or forensic evidence.
3. The decisive evidence must definitively refute the culprit's claims without ambiguity.
4. Output MUST be ONLY valid JSON matching the exact schema specified.
5. Do NOT include markdown code fences (like \`\`\`json), explanations, or notes outside the JSON object.`;
}

/**
 * Builds user prompt for OpenRouter case generation with diversity archetypes.
 */
export function buildOpenRouterUserPrompt({
  scenario = 'An unexplained crime has occurred',
  category = 'theft',
  difficulty = 'medium',
  length = 'standard',
  recentCases = [],
  correctiveFeedback = '',
}) {
  const archetype = selectArchetypeBlueprint(recentCases);

  const archetypeGuidance = `
ARCHETYPE DIRECTIVE: "${archetype.name}" (${archetype.description})
- Recommended Evidence Twist: ${archetype.suggestedEvidenceTypes.join(', ')}
- Culprit Motive Angle: ${archetype.culpritMotives.join(' OR ')}
- Required Red Herring: Provide at least one misleading circumstantial clue pointing to an innocent suspect.
`;

  return `Generate an original interactive detective mystery case based on the following input:

SCENARIO PREMISE:
"${scenario}"

SPECIFICATIONS:
- Category: ${category}
- Difficulty: ${difficulty}
- Length: ${length}
${archetypeGuidance}
${correctiveFeedback ? `\nCRITICAL FIX NEEDED: The previous attempt failed validation: ${correctiveFeedback}. Ensure all IDs and references match strictly.\n` : ''}

You MUST return a JSON object with this EXACT structure:
{
  "title": "Evocative Case Title",
  "summary": "2-3 sentence overview of the crime scene and mystery.",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "length": "${length}",
  "incident": {
    "description": "Comprehensive description of what transpired at the scene.",
    "location": "Specific location of crime",
    "timeDescription": "Time window (e.g. Between 21:00 and 21:30)",
    "occurredAt": "${new Date().toISOString()}"
  },
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full Name",
      "occupation": "Occupation / Job title",
      "relationship": "Connection to victim or scene",
      "summary": "Key personality or background traits",
      "alibiPublicText": "Stated alibi explaining whereabouts during crime",
      "isCulprit": true,
      "relatedEvidenceIds": ["ev_1", "ev_2"],
      "relatedEventIds": ["evt_1"]
    },
    {
      "id": "suspect_2",
      "name": "Full Name 2",
      "occupation": "Occupation 2",
      "relationship": "Connection 2",
      "summary": "Background 2",
      "alibiPublicText": "Stated alibi 2",
      "isCulprit": false,
      "relatedEvidenceIds": ["ev_3"],
      "relatedEventIds": ["evt_2"]
    },
    {
      "id": "suspect_3",
      "name": "Full Name 3",
      "occupation": "Occupation 3",
      "relationship": "Connection 3",
      "summary": "Background 3",
      "alibiPublicText": "Stated alibi 3",
      "isCulprit": false,
      "relatedEvidenceIds": [],
      "relatedEventIds": []
    }
  ],
  "evidence": [
    {
      "id": "ev_1",
      "title": "Evidence Title",
      "type": "document",
      "description": "Forensic description of this evidence item.",
      "content": { "text": "Verifiable document contents or telemetry" },
      "source": "Forensics / Security / Witness",
      "relevance": "high",
      "relatedSuspectIds": ["suspect_1"],
      "relatedEventIds": ["evt_1"]
    },
    {
      "id": "ev_2",
      "title": "CCTV Footage Log",
      "type": "surveillance",
      "description": "Camera footage or entry log contradicting suspect",
      "content": { "caption": "Timestamped camera frame showing subject at 21:15" },
      "source": "Security Cameras",
      "relevance": "high",
      "relatedSuspectIds": ["suspect_1"],
      "relatedEventIds": ["evt_2"]
    },
    {
      "id": "ev_3",
      "title": "Encrypted Chat Log",
      "type": "chat",
      "description": "Recovered instant messages",
      "content": {
        "participants": ["Suspect 2", "Unknown"],
        "messages": [
          { "sender": "Suspect 2", "timestamp": "20:45", "text": "Are we ready?" }
        ]
      },
      "source": "Recovered Smartphone",
      "relevance": "medium",
      "relatedSuspectIds": ["suspect_2"],
      "relatedEventIds": ["evt_1"]
    },
    {
      "id": "ev_4",
      "title": "Crime Scene Photo",
      "type": "photo",
      "description": "High-resolution forensic image of physical trace",
      "content": { "caption": "Tool mark on vault latch mechanism" },
      "source": "Forensic Photography",
      "relevance": "high",
      "relatedSuspectIds": ["suspect_1"],
      "relatedEventIds": ["evt_2"]
    }
  ],
  "timeline": [
    {
      "id": "evt_1",
      "timeDescription": "20:45",
      "description": "Initial setup event at the location.",
      "displayOrder": 1,
      "relatedSuspectIds": ["suspect_1"],
      "relatedEvidenceIds": ["ev_1"]
    },
    {
      "id": "evt_2",
      "timeDescription": "21:15",
      "description": "Crime occurrence window.",
      "displayOrder": 2,
      "relatedSuspectIds": ["suspect_1"],
      "relatedEvidenceIds": ["ev_2", "ev_4"]
    }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "culpritName": "Full Name matching suspect_1",
    "motive": "True motive driving the crime.",
    "method": "Detailed execution method of the crime.",
    "rationale": "Clear deduction showing how the evidence disproves their alibi.",
    "decisiveEvidenceIds": ["ev_2", "ev_4"],
    "redHerrings": [
      {
        "suspectId": "suspect_2",
        "evidenceId": "ev_3",
        "explanation": "Suspicious communication that was actually unrelated to the crime."
      }
    ]
  }
}

VALIDATION REQUIREMENTS:
- Exactly ONE suspect must have "isCulprit": true.
- "solution.culpritId" MUST match the suspect with "isCulprit": true.
- All IDs referenced in relatedEvidenceIds, relatedEventIds, and solution MUST exist in the respective arrays.
- Return ONLY the raw JSON object.`;
}

/**
 * Strips markdown code fences and extraneous text from LLM response.
 */
export function cleanJsonResponseText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  let cleaned = rawText.trim();

  // Remove leading ```json or ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```JSON')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  // Remove trailing ```
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  // If there is preamble before first { or postscript after last }, isolate JSON
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Generates an original mystery case using OpenRouter with Nvidia Nemotron.
 *
 * @param {Object} options
 * @param {string} options.scenario - Case premise
 * @param {string} options.category - Case category
 * @param {string} options.difficulty - Difficulty level
 * @param {string} options.length - Length profile
 * @param {Array} options.recentCases - Past cases for diversity checks
 * @param {Function} options.fetchClient - Injectable fetch for unit tests
 * @param {string} options.apiKey - Override API key
 * @param {string} options.model - Override OpenRouter model
 */
export async function generateCaseWithOpenRouter({
  scenario = 'An unexplained theft in an executive penthouse',
  category = 'theft',
  difficulty = 'medium',
  length = 'standard',
  recentCases = [],
  fetchClient = null,
  apiKey = null,
  model = null,
} = {}) {
  const activeKey = apiKey || env.OPENROUTER_API_KEY;
  if (!activeKey) {
    throw new Error('OpenRouter API key is not configured.');
  }

  const activeModel = model || env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';
  const caller = fetchClient || globalThis.fetch;

  const maxAttempts = 2;
  let lastError = null;
  let correctiveFeedback = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const systemPrompt = buildOpenRouterSystemPrompt();
      const userPrompt = buildOpenRouterUserPrompt({
        scenario,
        category,
        difficulty,
        length,
        recentCases,
        correctiveFeedback,
      });

      const response = await caller(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mysterio.abhaysoni.app',
          'X-Title': 'Mysterio AI Mystery Room',
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 3500,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(
          `OpenRouter API HTTP ${response.status}: ${errorBody || response.statusText}`
        );
      }

      const responseJson = await response.json();
      const rawContent = responseJson?.choices?.[0]?.message?.content;

      if (!rawContent || !rawContent.trim()) {
        throw new Error('Empty response received from OpenRouter model');
      }

      const cleanedJson = cleanJsonResponseText(rawContent);

      let parsed;
      try {
        parsed = JSON.parse(cleanedJson);
      } catch (jsonErr) {
        throw new Error(`OpenRouter model output was not valid JSON: ${jsonErr.message}`);
      }

      const sanitized = sanitizeCaseReferences(parsed);
      const validation = validateCaseReferences(sanitized);

      if (!validation.valid) {
        throw new Error(
          `Case failed detective reference integrity validation: ${validation.errors.join('; ')}`
        );
      }

      // Check scenario diversity against recent cases
      if (recentCases.length > 0) {
        const similarity = calculateScenarioSimilarity(sanitized, recentCases);
        if (similarity > 0.75) {
          throw new Error(
            `Generated case is too similar to recent cases (similarity score: ${similarity.toFixed(2)}).`
          );
        }
      }

      return sanitized;
    } catch (err) {
      lastError = err;
      correctiveFeedback = err.message;
      console.warn(`[OpenRouterService] Attempt ${attempt} failed: ${err.message}`);
    }
  }

  throw new Error(`OpenRouter generation failed: ${lastError?.message || 'Unknown error'}`);
}
