/**
 * Public Case Serializers & DTOs
 * Strictly enforces the public/private security boundary defined in Docs/DATA_MODEL.md
 * and Docs/AI_DEVELOPMENT_RULES.md.
 */

export function serializePublicCase(caseDoc) {
  if (!caseDoc) return null;
  const raw = typeof caseDoc.toObject === 'function' ? caseDoc.toObject() : caseDoc;

  return {
    id: raw._id ? raw._id.toString() : raw.id,
    title: raw.title,
    prompt: raw.prompt,
    category: raw.category,
    difficulty: raw.difficulty,
    length: raw.length,
    status: raw.status,
    summary: raw.summary,
    incident: raw.incident
      ? {
          description: raw.incident.description,
          location: raw.incident.location || '',
          occurredAt: raw.incident.occurredAt || null,
          timeDescription: raw.incident.timeDescription || '',
        }
      : null,
    suspects: (raw.suspects || []).map((s) => ({
      id: s.id,
      name: s.name,
      occupation: s.occupation || '',
      relationship: s.relationship || '',
      summary: s.summary,
      background: s.background || '',
      publicStatement: s.publicStatement || '',
      alibiPublicText: s.alibiPublicText || '',
      portraitAssetId: s.portraitAssetId || null,
      relatedEvidenceIds: s.relatedEvidenceIds || [],
      relatedEventIds: s.relatedEventIds || [],
    })),
    timeline: (raw.timeline || []).map((ev) => ({
      id: ev.id,
      timeDescription: ev.timeDescription || '',
      occurredAt: ev.occurredAt || null,
      description: ev.description,
      relatedSuspectIds: ev.relatedSuspectIds || [],
      relatedEvidenceIds: ev.relatedEvidenceIds || [],
      displayOrder: ev.displayOrder || 0,
    })),
    evidence: (raw.evidence || []).map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      description: e.description,
      occurredAt: e.occurredAt || null,
      timeDescription: e.timeDescription || '',
      sourceContext: e.sourceContext || '',
      content: e.content || {},
      relatedSuspectIds: e.relatedSuspectIds || [],
      relatedEventIds: e.relatedEventIds || [],
    })),
    suspectCount: raw.suspects?.length || 0,
    evidenceCount: raw.evidence?.length || 0,
    timelineCount: raw.timeline?.length || 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    activatedAt: raw.activatedAt,
    completedAt: raw.completedAt,
  };
}

export function serializePublicCaseSummary(caseDoc) {
  if (!caseDoc) return null;
  const raw = typeof caseDoc.toObject === 'function' ? caseDoc.toObject() : caseDoc;

  return {
    id: raw._id ? raw._id.toString() : raw.id,
    title: raw.title,
    category: raw.category,
    difficulty: raw.difficulty,
    length: raw.length,
    status: raw.status,
    summary: raw.summary,
    suspectCount: raw.suspects?.length || 0,
    evidenceCount: raw.evidence?.length || 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    completedAt: raw.completedAt || null,
  };
}
