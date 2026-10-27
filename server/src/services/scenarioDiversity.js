/**
 * Scenario Diversity Engine
 * Provides structured diversity archetypes, anti-repetition guidance,
 * and candidate similarity comparison to guarantee genuine variety across generated mysteries.
 */

export const SCENARIO_ARCHETYPES = [
  {
    subgenre: 'locked_room',
    mechanic: 'impossible_access',
    evidenceTypes: ['surveillance', 'access_log', 'document'],
    motiveClass: 'reputation_preservation',
    contradictionFocus: 'spatial_temporal_impossibility',
  },
  {
    subgenre: 'corporate_espionage',
    mechanic: 'cryptographic_exfiltration',
    evidenceTypes: ['chat_log', 'access_log', 'document'],
    motiveClass: 'commercial_sabotage',
    contradictionFocus: 'tampered_credential_trace',
  },
  {
    subgenre: 'art_and_antiquities',
    mechanic: 'forged_provenance_swap',
    evidenceTypes: ['document', 'image', 'surveillance'],
    motiveClass: 'black_market_debt',
    contradictionFocus: 'chemical_spectral_discrepancy',
  },
  {
    subgenre: 'forensic_cybercrime',
    mechanic: 'logic_bomb_diversion',
    evidenceTypes: ['chat_log', 'document', 'access_log'],
    motiveClass: 'ideological_whistleblowing',
    contradictionFocus: 'source_ip_routing_anomaly',
  },
  {
    subgenre: 'disappearance_cold_case',
    mechanic: 'staged_departure',
    evidenceTypes: ['document', 'chat_log', 'image'],
    motiveClass: 'inheritance_extortion',
    contradictionFocus: 'timeline_telemetry_mismatch',
  },
  {
    subgenre: 'scientific_fraud',
    mechanic: 'data_fabrication_sabotage',
    evidenceTypes: ['document', 'chat_log', 'access_log'],
    motiveClass: 'academic_plagiarism_coverup',
    contradictionFocus: 'sensor_calibration_tampering',
  },
];

/**
 * Selects an archetype blueprint based on recent cases count to ensure variety.
 */
export function selectArchetypeBlueprint(recentCases = []) {
  const index = Math.abs(recentCases.length) % SCENARIO_ARCHETYPES.length;
  const base = SCENARIO_ARCHETYPES[index];
  return {
    name: base.subgenre,
    description: base.mechanic,
    suggestedEvidenceTypes: base.evidenceTypes,
    culpritMotives: [base.motiveClass],
    contradictionFocus: base.contradictionFocus,
  };
}

/**
 * Extracts a lightweight structural fingerprint from recent user cases.
 */
export function extractCaseFingerprint(caseDoc) {
  if (!caseDoc) return null;
  return {
    id: caseDoc._id ? caseDoc._id.toString() : caseDoc.id,
    title: caseDoc.title || '',
    category: caseDoc.category || '',
    culpritId: caseDoc.solution?.culpritId || '',
    culpritName: caseDoc.solution?.culpritName || '',
    motive: caseDoc.solution?.motive || '',
    method: caseDoc.solution?.method || '',
    decisiveEvidenceIds: caseDoc.solution?.decisiveEvidenceIds || [],
  };
}

/**
 * Builds diversity context instructions to inject into the LLM prompt.
 */
export function buildDiversityPromptContext({ recentCases = [], scenario, category }) {
  const fingerprints = recentCases.map(extractCaseFingerprint).filter(Boolean);

  if (fingerprints.length === 0) {
    // Pick an archetype based on prompt hash for initial variety
    const index = Math.abs(hashString(scenario || category || 'default')) % SCENARIO_ARCHETYPES.length;
    const blueprint = SCENARIO_ARCHETYPES[index];
    return `DIVERSITY DIRECTIVE:
Structure this mystery using the "${blueprint.subgenre}" archetype with a "${blueprint.mechanic}" mechanism.
Motive domain: ${blueprint.motiveClass}.
Contradiction focus: ${blueprint.contradictionFocus}.`;
  }

  const previousSummaries = fingerprints
    .slice(0, 4)
    .map(
      (fp, i) =>
        `Case ${i + 1}: Title "${fp.title}", Category: ${fp.category}, Culprit: "${fp.culpritName || fp.culpritId}", Motive: "${fp.motive?.slice(0, 80)}"`
    )
    .join('\n');

  return `STRICT DIVERSITY CONSTRAINTS:
The requesting detective has recently solved the following cases:
${previousSummaries}

MANDATORY ORIGINALITY RULES:
1. DO NOT reuse the same culprit occupation, relationship archetype, or motive from the previous cases above.
2. Introduce an original central mechanism for how the incident was staged or concealed.
3. Use a distinct investigative contradiction (e.g. digital timestamp anomaly, acoustic discrepancy, forged paper trail, chemical marker) that differs from prior cases.
4. Ensure every suspect has a distinct, fully realized persona and plausible motive specific to the user's premise.`;
}

/**
 * Computes a similarity score between a candidate case and a list of previous cases.
 * Returns a score between 0 (completely distinct) and 1 (exact duplicate).
 */
export function calculateScenarioSimilarity(candidate, previousCases = []) {
  if (!candidate || !Array.isArray(previousCases) || previousCases.length === 0) {
    return 0;
  }

  let maxSimilarity = 0;

  for (const prev of previousCases) {
    let score = 0;
    let factors = 0;

    // 1. Title token overlap (Jaccard similarity)
    if (candidate.title && prev.title) {
      const titleSim = jaccardSimilarity(tokenize(candidate.title), tokenize(prev.title));
      score += titleSim * 0.25;
      factors += 0.25;
    }

    // 2. Culprit name overlap
    const candCulprit = candidate.solution?.culpritName || candidate.solution?.culpritId || '';
    const prevCulprit = prev.solution?.culpritName || prev.solution?.culpritId || '';
    if (candCulprit && prevCulprit) {
      const culpritMatch = candCulprit.toLowerCase().trim() === prevCulprit.toLowerCase().trim() ? 1.0 : 0.0;
      score += culpritMatch * 0.35;
      factors += 0.35;
    }

    // 3. Motive token overlap
    const candMotive = candidate.solution?.motive || '';
    const prevMotive = prev.solution?.motive || '';
    if (candMotive && prevMotive) {
      const motiveSim = jaccardSimilarity(tokenize(candMotive), tokenize(prevMotive));
      score += motiveSim * 0.2;
      factors += 0.2;
    }

    // 4. Method token overlap
    const candMethod = candidate.solution?.method || '';
    const prevMethod = prev.solution?.method || '';
    if (candMethod && prevMethod) {
      const methodSim = jaccardSimilarity(tokenize(candMethod), tokenize(prevMethod));
      score += methodSim * 0.2;
      factors += 0.2;
    }

    const normalized = factors > 0 ? score / factors : 0;
    if (normalized > maxSimilarity) {
      maxSimilarity = normalized;
    }
  }

  return maxSimilarity;
}

function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
