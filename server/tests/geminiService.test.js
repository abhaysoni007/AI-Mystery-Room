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
    const mockCase = {
      title: 'Project Chimera: Drone Prototype Heist',
      summary: 'High-tech corporate drone prototype stolen from research lab.',
      category: 'corporate_espionage',
      difficulty: 'hard',
      incident: {
        description: 'Drone telemetry cut at 02:00 in Hangar 4.',
        location: 'AeroTech Hangar 4',
        timeDescription: '02:00 AM',
      },
      suspects: [
        {
          id: 'suspect_a',
          name: 'Dr. Sarah Connor',
          occupation: 'Chief Avionics Engineer',
          relationship: 'Drone Designer',
          summary: 'Had security override privileges.',
          alibiPublicText: 'Claims to have been at home sleeping.',
          relatedEvidenceIds: ['ev_override_log'],
          relatedEventIds: ['evt_breach'],
        },
        {
          id: 'suspect_b',
          name: 'Greg Sanders',
          occupation: 'Security Guard',
          relationship: 'Hangar Night Shift Guard',
          summary: 'Suspicious bank deposits recorded.',
          alibiPublicText: 'Patrolling the south runway.',
          relatedEvidenceIds: ['ev_guard_badge'],
          relatedEventIds: ['evt_breach'],
        },
      ],
      timeline: [
        {
          id: 'evt_breach',
          timeDescription: '02:00',
          description: 'Hangar doors opened via engineering override.',
          relatedSuspectIds: ['suspect_a'],
          relatedEvidenceIds: ['ev_override_log'],
          displayOrder: 1,
        },
        {
          id: 'evt_departure',
          timeDescription: '02:15',
          description: 'Unmarked van exits cargo perimeter gate.',
          relatedSuspectIds: ['suspect_b'],
          relatedEvidenceIds: ['ev_guard_badge'],
          displayOrder: 2,
        },
      ],
      evidence: [
        {
          id: 'ev_override_log',
          type: 'access_log',
          title: 'Hangar Door Override Log',
          description: 'Encrypted telemetry dump.',
          content: { text: 'Key SEC-991 [Dr. Connor] activated.' },
          relatedSuspectIds: ['suspect_a'],
          relatedEventIds: ['evt_breach'],
        },
        {
          id: 'ev_guard_badge',
          type: 'document',
          title: 'Cargo Gate Guard Roster',
          description: 'Gate log book.',
          content: { text: 'Greg Sanders signed off on van clearance.' },
          relatedSuspectIds: ['suspect_b'],
          relatedEventIds: ['evt_departure'],
        },
        {
          id: 'ev_camera',
          type: 'surveillance',
          title: 'Hangar North Camera Frame',
          description: 'CCTV frame.',
          content: { caption: 'Van loading drone cargo crate.' },
          relatedSuspectIds: ['suspect_b'],
          relatedEventIds: ['evt_breach'],
        },
      ],
      solution: {
        culpritId: 'suspect_a',
        culpritName: 'Dr. Sarah Connor',
        motive: 'Whistleblowing sale to defense oversight foundation',
        method: 'Used avionics backdoor key to bypass automated perimeter lock',
        rationale: 'Override log SEC-991 was uniquely keyed to Dr. Connor biometric fob.',
        decisiveEvidenceIds: ['ev_override_log', 'ev_guard_badge'],
        redHerrings: [],
      },
    };

    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify(mockCase),
        }),
      },
    };

    const generated = await generateMysteryCase({
      scenario: 'High-tech corporate drone prototype stolen from research lab',
      category: 'corporate_espionage',
      difficulty: 'hard',
      length: 'standard',
      modelClient: mockClient,
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

  it('falls back to OpenRouter when Gemini model fails and produces a valid case', async () => {
    const geminiFailClient = {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('RESOURCE_EXHAUSTED')),
      },
    };

    const mockOpenRouterCase = {
      title: 'The Vanishing of Lord Ravenscroft',
      summary: 'Lord Ravenscroft disappeared from his locked study before midnight.',
      category: 'disappearance',
      difficulty: 'medium',
      length: 'standard',
      incident: {
        description: 'Study found empty with luggage missing.',
        location: 'Ravenscroft Manor',
        timeDescription: 'Between 23:00 and 00:00',
      },
      suspects: [
        {
          id: 'suspect_alyssa',
          name: 'Alyssa Bennett',
          occupation: 'Private Secretary',
          relationship: 'Confidante',
          summary: 'Had safe combination.',
          alibiPublicText: 'Claims to be in the parlor.',
          isCulprit: true,
          relatedEvidenceIds: ['ev_study_key'],
          relatedEventIds: ['evt_vanish'],
        },
        {
          id: 'suspect_julian',
          name: 'Julian Mercer',
          occupation: 'Estate Attorney',
          relationship: 'Will executor',
          summary: 'Handling debts.',
          alibiPublicText: 'Was in the library.',
          isCulprit: false,
          relatedEvidenceIds: ['ev_estate_ledger'],
          relatedEventIds: ['evt_vanish'],
        },
      ],
      timeline: [
        {
          id: 'evt_vanish',
          timeDescription: '23:30',
          description: 'Car seen leaving gate.',
          displayOrder: 1,
        },
        {
          id: 'evt_report',
          timeDescription: '00:00',
          description: 'Disappearance reported to security.',
          displayOrder: 2,
        },
      ],
      evidence: [
        {
          id: 'ev_study_key',
          type: 'document',
          title: 'Safe Access Log',
          description: 'Key entry record.',
          content: { text: 'Key SEC-001 used at 23:25.' },
        },
        {
          id: 'ev_estate_ledger',
          type: 'document',
          title: 'Estate Ledger',
          description: 'Financial ledger.',
          content: { text: 'Entries logged at 21:00.' },
        },
        {
          id: 'ev_gate_cam',
          type: 'surveillance',
          title: 'Gate Camera',
          description: 'Footage.',
          content: { caption: 'Vehicle departure at 23:30.' },
        },
      ],
      solution: {
        culpritId: 'suspect_alyssa',
        culpritName: 'Alyssa Bennett',
        motive: 'Embezzlement coverup',
        method: 'Staged departure using private vehicle',
        rationale: 'Safe log proves key was used right before disappearance.',
        decisiveEvidenceIds: ['ev_study_key'],
        redHerrings: [],
      },
    };

    const mockOpenRouterFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockOpenRouterCase) } }],
      }),
    });

    const generated = await generateMysteryCase({
      scenario: 'The mysterious disappearance of Lord Ravenscroft',
      category: 'disappearance',
      difficulty: 'medium',
      length: 'standard',
      modelClient: geminiFailClient,
      openRouterClient: mockOpenRouterFetch,
    });

    expect(generated).toBeDefined();
    expect(generated.title).toBe('The Vanishing of Lord Ravenscroft');
    expect(generated.category).toBe('disappearance');
    const validation = validateCaseReferences(generated);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(mockOpenRouterFetch).toHaveBeenCalledTimes(1);
  });
});

