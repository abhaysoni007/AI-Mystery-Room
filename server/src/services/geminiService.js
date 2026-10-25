import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env.js';
import { validateCaseReferences } from './caseValidator.js';

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
 * Sanitizes and repairs minor cross-referencing flaws from LLM outputs so valid mysteries
 * are not discarded due to benign non-existent references.
 */
function sanitizeCaseReferences(caseData) {
  const suspectIds = new Set((caseData.suspects || []).map((s) => s.id));
  const evidenceIds = new Set((caseData.evidence || []).map((e) => e.id));
  const timelineIds = new Set((caseData.timeline || []).map((t) => t.id));

  // Sanitize suspects
  for (const s of caseData.suspects || []) {
    s.relatedEvidenceIds = (s.relatedEvidenceIds || []).filter((id) => evidenceIds.has(id));
    s.relatedEventIds = (s.relatedEventIds || []).filter((id) => timelineIds.has(id));
  }

  // Sanitize timeline
  for (const t of caseData.timeline || []) {
    t.relatedSuspectIds = (t.relatedSuspectIds || []).filter((id) => suspectIds.has(id));
    t.relatedEvidenceIds = (t.relatedEvidenceIds || []).filter((id) => evidenceIds.has(id));
  }

  // Sanitize evidence
  for (const e of caseData.evidence || []) {
    e.relatedSuspectIds = (e.relatedSuspectIds || []).filter((id) => suspectIds.has(id));
    e.relatedEventIds = (e.relatedEventIds || []).filter((id) => timelineIds.has(id));
  }

  // Sanitize red herrings
  if (caseData.solution && Array.isArray(caseData.solution.redHerrings)) {
    caseData.solution.redHerrings = caseData.solution.redHerrings.filter(
      (rh) => (!rh.suspectId || suspectIds.has(rh.suspectId)) && (!rh.evidenceId || evidenceIds.has(rh.evidenceId))
    );
  }

  return caseData;
}

/**
 * Generates a solver-guaranteed, deterministic template mystery when Gemini is unavailable or fails validation.
 */
export function generateFallbackCase({ scenario = 'An unexplained crime has occurred', category = 'theft', difficulty = 'medium', length = 'standard' }) {
  const categoryTitles = {
    corporate_espionage: 'Project Chimera: The Datacenter Breach',
    theft: 'The Obsidian Crown Heist',
    murder: 'The Midnight Parlor Enigma',
    disappearance: 'The Vanishing of Dr. Alistair Finch',
    cybercrime: 'Operation Zero-Day: The Ledger Infiltration',
    blackmail: 'The Gilded Ledger Affair',
    other: 'The Chamber of Shadows Mystery',
  };

  const title = categoryTitles[category] || `The Mystery of ${scenario.slice(0, 32)}...`;

  const fallback = {
    title,
    summary: `A high-stakes investigation triggered by: ${scenario}`,
    category,
    difficulty,
    length,
    incident: {
      description: `At 22:30 hours, an incident occurred related to: ${scenario}. Security logs captured irregular sensor triggers before standard monitoring went dark.`,
      location: 'Primary Secure Sector, Sector 4',
      occurredAt: new Date(),
      timeDescription: 'Last Night, 22:30',
    },
    suspects: [
      {
        id: 'suspect_alyssa',
        name: 'Alyssa Bennett',
        occupation: 'Chief Security Officer',
        relationship: 'Responsible for facility surveillance and keycard issuance',
        summary: 'Held the only authorized override keys during the midnight changeover shift.',
        background: 'Former military intelligence officer with 12 years of executive security operations.',
        publicStatement: 'I was in the command bunker reviewing perimeter sensor diagnostics until midnight.',
        alibiPublicText: 'Claims continuous presence in Bunker C during the time of the incident.',
        relatedEvidenceIds: ['ev_access_log', 'ev_surveillance_frame'],
        relatedEventIds: ['evt_access', 'evt_blackout'],
      },
      {
        id: 'suspect_julian',
        name: 'Julian Mercer',
        occupation: 'Lead Systems Architect',
        relationship: 'Designed the cryptographic vault architecture',
        summary: 'Expressed bitter dissent regarding the upcoming commercial acquisition.',
        background: 'Renowned cryptographer whose intellectual property was bound to the firm under contentious patents.',
        publicStatement: 'I left the campus at 21:00 sharp. My vehicular pass records prove my departure.',
        alibiPublicText: 'Claims to have arrived home across town by 21:45.',
        relatedEvidenceIds: ['ev_chat_transcript', 'ev_forensic_report'],
        relatedEventIds: ['evt_departure'],
      },
      {
        id: 'suspect_clara',
        name: 'Dr. Clara Vance',
        occupation: 'Senior Research Fellow',
        relationship: 'Principal investigator on the targeted project',
        summary: 'Deeply indebted following failed private biotech investments abroad.',
        background: 'Distinguished biochemist whose lab was directly adjacent to the incident site.',
        publicStatement: 'I was running automated centrifuge assays on sub-level 2 all evening.',
        alibiPublicText: 'Assay logs indicate centrifuge 4 was running from 20:00 to 02:00.',
        relatedEvidenceIds: ['ev_lab_manifest'],
        relatedEventIds: ['evt_blackout'],
      },
    ],
    timeline: [
      {
        id: 'evt_departure',
        timeDescription: '21:00',
        description: 'Lead Architect Julian Mercer clocks out through the vehicle gate.',
        relatedSuspectIds: ['suspect_julian'],
        relatedEvidenceIds: [],
        displayOrder: 1,
      },
      {
        id: 'evt_access',
        timeDescription: '22:25',
        description: 'Keycard with administrative clearance 004 is tapped at the secure sector hatch.',
        relatedSuspectIds: ['suspect_alyssa'],
        relatedEvidenceIds: ['ev_access_log'],
        displayOrder: 2,
      },
      {
        id: 'evt_blackout',
        timeDescription: '22:30',
        description: 'Main power to the local CCTV circuit drops for exactly 4 minutes and 15 seconds.',
        relatedSuspectIds: ['suspect_alyssa', 'suspect_clara'],
        relatedEvidenceIds: ['ev_surveillance_frame'],
        displayOrder: 3,
      },
    ],
    evidence: [
      {
        id: 'ev_access_log',
        type: 'access_log',
        title: 'Primary Sector Hatch Access Log',
        description: 'Digital audit of door sensor #4 recording administrative badge entries.',
        timeDescription: '22:25',
        sourceContext: 'Facility Security Server Audit',
        content: {
          documentType: 'log',
          text: '22:24:58 - Badge ID: SEC-004 [BENNETT, A.] - Authentication: SUCCESS (PHYSICAL BIOMETRIC CONFIRMED)',
        },
        relatedSuspectIds: ['suspect_alyssa'],
        relatedEventIds: ['evt_access'],
      },
      {
        id: 'ev_surveillance_frame',
        type: 'surveillance',
        title: 'CCTV Camera 08 Static Freeze',
        description: 'Footage recovered immediately prior to the auxiliary circuit blackout.',
        timeDescription: '22:29',
        sourceContext: 'North Corridor Camera Feed',
        content: {
          cameraLocation: 'North Access Corridor',
          caption: 'Figure in high-collar tactical coat carrying equipment bag towards vault entrance.',
          logs: ['Optical feed interrupted: Power spike detected on breaker line 9B.'],
        },
        relatedSuspectIds: ['suspect_alyssa'],
        relatedEventIds: ['evt_blackout'],
      },
      {
        id: 'ev_chat_transcript',
        type: 'chat_log',
        title: 'Encrypted Matrix Chat: "Project Contingency"',
        description: 'Intercepted direct messaging thread from an external server.',
        timeDescription: '18:15 Earlier That Day',
        sourceContext: 'Network Operations Packet Dump',
        content: {
          participants: ['Apex_Buyer', 'Nightfall_Contact'],
          messages: [
            { sender: 'Apex_Buyer', timestamp: '18:15', text: 'Everything ready for tonight?' },
            { sender: 'Nightfall_Contact', timestamp: '18:18', text: 'Badge SEC-004 has been cloned. Power cut timed for 22:30.' },
            { sender: 'Apex_Buyer', timestamp: '18:20', text: 'Do not leave digital traces on Julian Mercer. He is clean.' },
          ],
        },
        relatedSuspectIds: ['suspect_julian'],
        relatedEventIds: [],
      },
      {
        id: 'ev_lab_manifest',
        type: 'document',
        title: 'Centrifuge Automated Run Sheet',
        description: 'Telemetry log from Dr. Clara Vance lab terminal.',
        timeDescription: '20:00 - 02:00',
        sourceContext: 'Sub-level 2 Automated Equipment Ledger',
        content: {
          documentType: 'manifest',
          text: 'Centrifuge 4 ran in automated unmonitored batch mode. Operator presence was not required after initial setup at 19:45.',
        },
        relatedSuspectIds: ['suspect_clara'],
        relatedEventIds: ['evt_blackout'],
      },
      {
        id: 'ev_forensic_report',
        type: 'document',
        title: 'Breaker Line 9B Forensic Inspection',
        description: 'Technical report on the physical severed power lines.',
        timeDescription: 'Post-incident analysis',
        sourceContext: 'Forensic Engineering Division',
        content: {
          documentType: 'report',
          text: 'The power cut was executed from inside the command bunker using an authorized circuit bypass key registered to Alyssa Bennett.',
        },
        relatedSuspectIds: ['suspect_alyssa'],
        relatedEventIds: ['evt_blackout'],
      },
    ],
    solution: {
      culpritId: 'suspect_alyssa',
      culpritName: 'Alyssa Bennett',
      motive: 'Financial gain via collusive espionage contract with offshore buyers',
      method: 'Used internal security bypass keys to trigger power outage while staging entry using cloned credentials',
      rationale: 'While Julian Mercer was set up to appear disgruntled and Clara Vance had an unverified alibi, forensic evidence on breaker line 9B proves the blackout was executed using the internal bypass key in Alyssa Bennett bunker, corroborating the physical biometric verification at 22:25.',
      decisiveEvidenceIds: ['ev_access_log', 'ev_forensic_report'],
      redHerrings: [
        {
          suspectId: 'suspect_julian',
          evidenceId: 'ev_chat_transcript',
          explanation: 'Julian Mercer public dissent made him a convenient scapegoat, but chat logs explicitly note he was innocent.',
        },
        {
          suspectId: 'suspect_clara',
          evidenceId: 'ev_lab_manifest',
          explanation: 'Dr. Clara Vance automated assay showed she was absent, but she had merely stepped out to her office.',
        },
      ],
    },
  };

  return sanitizeCaseReferences(fallback);
}

/**
 * Generates an interactive mystery case using Google Gemini with structured outputs,
 * falling back gracefully to deterministic solver-guaranteed templates if needed.
 */
export async function generateMysteryCase({
  scenario = 'An unexplained theft in an executive penthouse',
  category = 'theft',
  difficulty = 'medium',
  length = 'standard',
  forceFallback = false,
} = {}) {
  if (forceFallback || !env.GEMINI_API_KEY) {
    return generateFallbackCase({ scenario, category, difficulty, length });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const prompt = `You are the Lead Mystery Architect for an interactive detective mystery investigation game.
Create a complete, solvable, clue-corroborated mystery case based on the following user specifications:
- User Premise/Scenario: "${scenario}"
- Mystery Category: "${category}"
- Difficulty Level: "${difficulty}"
- Case Length: "${length}"

STRICT DETECTIVE FICTION RULES:
1. Provide 3 or 4 suspects, each with a clear motive, opportunity, and alibi.
2. Provide between 4 and 6 pieces of diverse evidence (mix of types: "chat_log", "document", "surveillance", "access_log", "image").
3. Provide at least 3 timeline events.
4. Establish ONE true culprit whose identity is in the suspects array.
5. In the "solution" object:
   - "culpritId" MUST exactly match one of the suspect IDs.
   - "decisiveEvidenceIds" MUST be an array containing 1 to 3 evidence IDs from your evidence list that conclusively refute the culprit's alibi or prove their guilt.
   - "redHerrings" must contain at least 1 innocent suspect whose suspicious behavior is explained by non-criminal reasons.
6. Return only valid JSON conforming to the schema.`;

    const modelName = env.GEMINI_MODEL || 'gemini-1.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: buildGeminiResponseSchema(),
      },
    });

    const rawText = response.text || (typeof response === 'string' ? response : null);
    if (!rawText) {
      throw new Error('Empty response received from Gemini API');
    }

    const parsed = JSON.parse(rawText);
    const sanitized = sanitizeCaseReferences(parsed);
    const validation = validateCaseReferences(sanitized);

    if (!validation.valid) {
      console.warn('Gemini generated case failed reference validation. Falling back to guaranteed template:', validation.errors);
      return generateFallbackCase({ scenario, category, difficulty, length });
    }

    return sanitized;
  } catch (error) {
    console.warn('Gemini mystery generation encountered an error or network limitation. Safely using solver template:', error.message);
    return generateFallbackCase({ scenario, category, difficulty, length });
  }
}
