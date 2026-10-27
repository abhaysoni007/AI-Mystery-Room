/**
 * Validates the internal referential integrity and schema bounds of a generated or submitted mystery case.
 * Enforces detective fair-play rules:
 * 1. Minimum structural bounds (>=2 suspects, >=3 evidence items, >=2 timeline events).
 * 2. Culprit exists in suspect roster.
 * 3. Decisive evidence items exist in the evidence catalog.
 * 4. Cross-referenced suspect and evidence IDs refer to extant entities.
 */
export function validateCaseReferences(caseData) {
  const errors = [];

  if (!caseData || typeof caseData !== 'object') {
    return { valid: false, errors: ['Case data must be a valid object.'] };
  }

  if (!caseData.title || typeof caseData.title !== 'string') {
    errors.push('Case title is required.');
  }

  if (!caseData.summary || typeof caseData.summary !== 'string') {
    errors.push('Case summary is required.');
  }

  if (!caseData.incident || !caseData.incident.description) {
    errors.push('Incident description is required.');
  }

  const suspects = Array.isArray(caseData.suspects) ? caseData.suspects : [];
  if (suspects.length < 2) {
    errors.push(`At least 2 suspects are required (received ${suspects.length}).`);
  }

  const suspectIds = new Set(suspects.map((s) => s.id).filter(Boolean));
  if (suspectIds.size !== suspects.length) {
    errors.push('All suspect IDs must be unique and non-empty.');
  }

  const evidence = Array.isArray(caseData.evidence) ? caseData.evidence : [];
  if (evidence.length < 3) {
    errors.push(`At least 3 evidence items are required (received ${evidence.length}).`);
  }

  const evidenceIds = new Set(evidence.map((e) => e.id).filter(Boolean));
  if (evidenceIds.size !== evidence.length) {
    errors.push('All evidence IDs must be unique and non-empty.');
  }

  const timeline = Array.isArray(caseData.timeline) ? caseData.timeline : [];
  if (timeline.length < 2) {
    errors.push(`At least 2 timeline events are required (received ${timeline.length}).`);
  }

  const timelineIds = new Set(timeline.map((t) => t.id).filter(Boolean));

  // Solution checks
  const solution = caseData.solution;
  if (!solution || typeof solution !== 'object') {
    errors.push('Case solution is required.');
  } else {
    if (!solution.culpritId || !suspectIds.has(solution.culpritId)) {
      errors.push(`Solution culpritId "${solution.culpritId}" does not exist in suspect roster.`);
    }

    if (!Array.isArray(solution.decisiveEvidenceIds) || solution.decisiveEvidenceIds.length === 0) {
      errors.push('Solution decisiveEvidenceIds must be a non-empty array.');
    } else {
      for (const clueId of solution.decisiveEvidenceIds) {
        if (!evidenceIds.has(clueId)) {
          errors.push(`Solution decisiveEvidenceIds references non-existent clue ID "${clueId}".`);
        }
      }
    }

    if (!solution.motive || typeof solution.motive !== 'string') {
      errors.push('Solution motive is required.');
    }

    if (!solution.method || typeof solution.method !== 'string') {
      errors.push('Solution method is required.');
    }

    if (!solution.rationale || typeof solution.rationale !== 'string') {
      errors.push('Solution rationale is required.');
    }

    if (Array.isArray(solution.redHerrings)) {
      for (const rh of solution.redHerrings) {
        if (rh.suspectId && !suspectIds.has(rh.suspectId)) {
          errors.push(`Red herring references invalid suspectId "${rh.suspectId}".`);
        }
        if (rh.evidenceId && !evidenceIds.has(rh.evidenceId)) {
          errors.push(`Red herring references invalid evidenceId "${rh.evidenceId}".`);
        }
      }
    }
  }

  // Cross-reference checks for suspects, timeline, evidence
  for (const s of suspects) {
    if (Array.isArray(s.relatedEvidenceIds)) {
      for (const id of s.relatedEvidenceIds) {
        if (!evidenceIds.has(id)) {
          errors.push(`Suspect "${s.id}" references non-existent evidenceId "${id}".`);
        }
      }
    }
    if (Array.isArray(s.relatedEventIds)) {
      for (const id of s.relatedEventIds) {
        if (!timelineIds.has(id)) {
          errors.push(`Suspect "${s.id}" references non-existent eventId "${id}".`);
        }
      }
    }
  }

  for (const t of timeline) {
    if (Array.isArray(t.relatedSuspectIds)) {
      for (const id of t.relatedSuspectIds) {
        if (!suspectIds.has(id)) {
          errors.push(`Timeline event "${t.id}" references non-existent suspectId "${id}".`);
        }
      }
    }
    if (Array.isArray(t.relatedEvidenceIds)) {
      for (const id of t.relatedEvidenceIds) {
        if (!evidenceIds.has(id)) {
          errors.push(`Timeline event "${t.id}" references non-existent evidenceId "${id}".`);
        }
      }
    }
  }

  for (const e of evidence) {
    if (Array.isArray(e.relatedSuspectIds)) {
      for (const id of e.relatedSuspectIds) {
        if (!suspectIds.has(id)) {
          errors.push(`Evidence "${e.id}" references non-existent suspectId "${id}".`);
        }
      }
    }
    if (Array.isArray(e.relatedEventIds)) {
      for (const id of e.relatedEventIds) {
        if (!timelineIds.has(id)) {
          errors.push(`Evidence "${e.id}" references non-existent eventId "${id}".`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertCaseReferences(caseData) {
  const result = validateCaseReferences(caseData);
  if (!result.valid) {
    const error = new Error(`Case reference integrity failed:\n- ${result.errors.join('\n- ')}`);
    error.status = 422;
    error.validationErrors = result.errors;
    throw error;
  }
}

/**
 * Sanitizes and repairs minor cross-referencing flaws from LLM outputs so valid mysteries
 * are not discarded due to benign non-existent references.
 */
export function sanitizeCaseReferences(caseData) {
  if (!caseData || typeof caseData !== 'object') return caseData;

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
