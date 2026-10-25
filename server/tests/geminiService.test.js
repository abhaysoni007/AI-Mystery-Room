import { describe, it, expect, vi } from 'vitest';
import { validateCaseReferences } from '../src/services/caseValidator.js';
import { generateMysteryCase } from '../src/services/geminiService.js';

describe('caseValidator', () => {
  const validCase = {
    title: 'The Vault Breach',
    summary: 'A secure vault was compromised.',
    category: 'theft',
    difficulty: 'medium',
    length: 'standard',
    incident: {
      description: 'The master vault was opened with a forged digital certificate.',
      location: 'Sub-level 3',
      occurredAt: new Date('2026-10-24T22:00:00Z'),
      timeDescription: 'Oct 24, 22:00',
    },
    suspects: [
      {
        id: 'suspect_marcus',
        name: 'Marcus Vance',
        occupation: 'Head of Security',
        summary: 'Had master access codes.',
        relatedEvidenceIds: ['ev_access_log'],
        relatedEventIds: ['evt_breach'],
      },
      {
        id: 'suspect_elena',
        name: 'Elena Rostova',
        occupation: 'Crypto Analyst',
        summary: 'Flagged unusual network traffic.',
        relatedEvidenceIds: ['ev_chat_thread'],
        relatedEventIds: ['evt_alarm'],
      },
    ],
    timeline: [
      {
        id: 'evt_alarm',
        description: 'Silent sensor alert triggered.',
        timeDescription: '21:55',
        relatedSuspectIds: ['suspect_elena'],
        relatedEvidenceIds: [],
      },
      {
        id: 'evt_breach',
        description: 'Vault door unlocked manually.',
        timeDescription: '22:00',
        relatedSuspectIds: ['suspect_marcus'],
        relatedEvidenceIds: ['ev_access_log'],
      },
    ],
    evidence: [
      {
        id: 'ev_access_log',
        type: 'access_log',
        title: 'Vault Keycard Log',
        description: 'Card 0092 used at door.',
        relatedSuspectIds: ['suspect_marcus'],
        relatedEventIds: ['evt_breach'],
      },
      {
        id: 'ev_chat_thread',
        type: 'chat_log',
        title: 'Telegram Dump',
        description: 'Encrypted exchange.',
        relatedSuspectIds: ['suspect_elena'],
        relatedEventIds: [],
      },
      {
        id: 'ev_cctv_frame',
        type: 'surveillance',
        title: 'Hallway Camera 4',
        description: 'Shadowy figure in hallway.',
        relatedSuspectIds: ['suspect_marcus'],
        relatedEventIds: ['evt_breach'],
      },
    ],
    solution: {
      culpritId: 'suspect_marcus',
      culpritName: 'Marcus Vance',
      motive: 'Financial debt to offshore syndicate',
      method: 'Used cloned security badge',
      rationale: 'Keycard access coincides with his falsified patrol route',
      decisiveEvidenceIds: ['ev_access_log', 'ev_cctv_frame'],
      redHerrings: [
        {
          suspectId: 'suspect_elena',
          evidenceId: 'ev_chat_thread',
          explanation: 'Elena was investigating her brother, not selling company secrets',
        },
      ],
    },
  };

  it('validates a well-formed case with zero errors', () => {
    const result = validateCaseReferences(validCase);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails if culpritId does not exist in suspects', () => {
    const invalid = {
      ...validCase,
      solution: {
        ...validCase.solution,
        culpritId: 'suspect_nonexistent',
      },
    };
    const result = validateCaseReferences(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes('culpritId'))).toBe(true);
  });

  it('fails if decisiveEvidenceIds contains non-existent clue ID', () => {
    const invalid = {
      ...validCase,
      solution: {
        ...validCase.solution,
        decisiveEvidenceIds: ['ev_access_log', 'ev_ghost_clue'],
      },
    };
    const result = validateCaseReferences(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes('decisiveEvidenceIds'))).toBe(true);
  });

  it('fails if fewer than 2 suspects or fewer than 3 evidence items are provided', () => {
    const invalid = {
      ...validCase,
      suspects: [validCase.suspects[0]],
      evidence: [validCase.evidence[0]],
    };
    const result = validateCaseReferences(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes('suspects'))).toBe(true);
    expect(result.errors.some((err) => err.includes('evidence'))).toBe(true);
  });
});

describe('geminiService generateMysteryCase', () => {
  it('generates a structurally valid, reference-sound case', async () => {
    const generated = await generateMysteryCase({
      scenario: 'High-tech corporate drone prototype stolen from research lab',
      category: 'corporate_espionage',
      difficulty: 'hard',
      length: 'standard',
    });

    expect(generated).toBeDefined();
    expect(generated.title).toBeTruthy();
    expect(generated.summary).toBeTruthy();
    expect(generated.incident).toBeDefined();
    expect(generated.incident.description).toBeTruthy();
    expect(generated.suspects.length).toBeGreaterThanOrEqual(2);
    expect(generated.evidence.length).toBeGreaterThanOrEqual(3);
    expect(generated.timeline.length).toBeGreaterThanOrEqual(2);
    expect(generated.solution).toBeDefined();
    expect(generated.solution.culpritId).toBeTruthy();

    const validation = validateCaseReferences(generated);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it('produces a solver-guaranteed playable case even if fallback is triggered', async () => {
    const generated = await generateMysteryCase({
      scenario: 'The mysterious disappearance of Lord Ravenscroft',
      category: 'disappearance',
      difficulty: 'medium',
      length: 'standard',
      forceFallback: true,
    });

    expect(generated).toBeDefined();
    expect(generated.category).toBe('disappearance');
    const validation = validateCaseReferences(generated);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });
});
