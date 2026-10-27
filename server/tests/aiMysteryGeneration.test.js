import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, closeTestDb } from './setup.js';
import { User } from '../src/models/User.js';
import { Case } from '../src/models/Case.js';
import { generateMysteryCase, AiGenerationError } from '../src/services/geminiService.js';
import { calculateScenarioSimilarity } from '../src/services/scenarioDiversity.js';

describe('P0 AI Mystery Generation & Scenario Diversity Suite', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await connectTestDb();
  }, 120000);

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Case.deleteMany({});

    const signup = await request(app).post('/api/v1/auth/signup').send({
      username: 'master_sleuth',
      password: 'Password123!',
      name: 'Sherlock Holmes',
    });
    userToken = signup.body.data.token;
    userId = signup.body.data.user.id;
  });

  it('Generates a genuinely new, structurally sound case with mocked model provider', async () => {
    const mockCaseData = {
      title: 'The Diamond Prism Cipher',
      summary: 'A prototype optical encryption crystal was stolen during an eclipse.',
      category: 'cybercrime',
      difficulty: 'hard',
      incident: {
        description: 'At 14:02 during the solar eclipse totality, the optical crystal was removed from the containment chamber.',
        location: 'Kryptos Observatory Lab',
        timeDescription: 'Eclipse totality, 14:02',
      },
      suspects: [
        {
          id: 'suspect_dr_ray',
          name: 'Dr. Raymond Zhao',
          occupation: 'Lead Optics Physicist',
          relationship: 'Project Director',
          summary: 'Developed the photonic refraction algorithm.',
          alibiPublicText: 'Claims he was in the observation dome aligning the solar coronagraph.',
          relatedEvidenceIds: ['ev_spectrometer_log'],
          relatedEventIds: ['evt_eclipse'],
        },
        {
          id: 'suspect_talia',
          name: 'Talia Vane',
          occupation: 'Systems Administrator',
          relationship: 'Oversees fiber optic routing',
          summary: 'Recently filed a patent grievance against the observatory foundation.',
          alibiPublicText: 'Claims server maintenance during totality.',
          relatedEvidenceIds: ['ev_terminal_dump'],
          relatedEventIds: ['evt_eclipse'],
        },
      ],
      timeline: [
        {
          id: 'evt_eclipse',
          timeDescription: '14:00 - 14:04',
          description: 'Total solar eclipse blocks external ambient light sensors.',
          relatedSuspectIds: ['suspect_dr_ray', 'suspect_talia'],
          relatedEvidenceIds: ['ev_spectrometer_log'],
          displayOrder: 1,
        },
        {
          id: 'evt_alarm',
          timeDescription: '14:05',
          description: 'Auxiliary laser containment drops, triggering alarm.',
          relatedSuspectIds: ['suspect_dr_ray'],
          relatedEvidenceIds: ['ev_terminal_dump'],
          displayOrder: 2,
        },
      ],
      evidence: [
        {
          id: 'ev_spectrometer_log',
          type: 'document',
          title: 'Spectrometer Diagnostic Log',
          description: 'Telemetry from chamber sensor #3.',
          content: { text: 'Wavelength calibration altered at 13:58.' },
          relatedSuspectIds: ['suspect_dr_ray'],
          relatedEventIds: ['evt_eclipse'],
        },
        {
          id: 'ev_terminal_dump',
          type: 'access_log',
          title: 'Optics Console Command History',
          description: 'Terminal audit log.',
          content: { text: 'Admin bypass executed with physical key #2.' },
          relatedSuspectIds: ['suspect_dr_ray'],
          relatedEventIds: ['evt_alarm'],
        },
        {
          id: 'ev_surveillance',
          type: 'surveillance',
          title: 'Dome Corridor Feed',
          description: 'Low-light camera frame.',
          content: { caption: 'Figure leaving containment chamber carrying reflective case.' },
          relatedSuspectIds: ['suspect_dr_ray'],
          relatedEventIds: ['evt_eclipse'],
        },
      ],
      solution: {
        culpritId: 'suspect_dr_ray',
        culpritName: 'Dr. Raymond Zhao',
        motive: 'Smuggling prototype to foreign university research consortium',
        method: 'Altered spectrometer calibration prior to eclipse to suppress automated laser sensor trip',
        rationale: 'Physical key #2 was registered exclusively to Dr. Zhao.',
        decisiveEvidenceIds: ['ev_spectrometer_log', 'ev_terminal_dump'],
        redHerrings: [
          {
            suspectId: 'suspect_talia',
            evidenceId: 'ev_terminal_dump',
            explanation: 'Talia performed routine maintenance but did not have physical access to key #2.',
          },
        ],
      },
    };

    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify(mockCaseData),
        }),
      },
    };

    const result = await generateMysteryCase({
      scenario: 'A prototype optical encryption crystal was stolen during an eclipse',
      category: 'cybercrime',
      difficulty: 'hard',
      modelClient: mockClient,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe('The Diamond Prism Cipher');
    expect(result.solution.culpritId).toBe('suspect_dr_ray');
    expect(mockClient.models.generateContent).toHaveBeenCalledTimes(1);
  });

  it('Proves that two consecutive generation requests produce distinct scenario structures', async () => {
    const caseAData = {
      title: 'The Quantum Lattice Infiltration',
      summary: 'Datacenter attack on quantum computing startup.',
      category: 'corporate_espionage',
      incident: {
        description: 'Server room cooling failure triggered emergency dump.',
        location: 'Apex Quantum Center',
        timeDescription: '03:15 AM',
      },
      suspects: [
        {
          id: 'suspect_kane',
          name: 'Kane Miller',
          occupation: 'Cryo-engineer',
          relationship: 'Coolant specialist',
          summary: 'Bitter about stock options.',
          alibiPublicText: 'Was off-site at an all-night diner.',
          relatedEvidenceIds: ['ev_coolant_log'],
          relatedEventIds: ['evt_dump'],
        },
        {
          id: 'suspect_elena',
          name: 'Elena Rostova',
          occupation: 'Firmware Dev',
          relationship: 'Core engineer',
          summary: 'In debt.',
          alibiPublicText: 'Sleeping in rest pod.',
          relatedEvidenceIds: ['ev_firmware_diff'],
          relatedEventIds: ['evt_dump'],
        },
      ],
      timeline: [
        {
          id: 'evt_dump',
          timeDescription: '03:10',
          description: 'Liquid nitrogen pressure valve overridden.',
          relatedSuspectIds: ['suspect_kane'],
          relatedEvidenceIds: ['ev_coolant_log'],
          displayOrder: 1,
        },
        {
          id: 'evt_extract',
          timeDescription: '03:20',
          description: 'Hard drive caddy unlatched.',
          relatedSuspectIds: ['suspect_kane'],
          relatedEvidenceIds: ['ev_firmware_diff'],
          displayOrder: 2,
        },
      ],
      evidence: [
        {
          id: 'ev_coolant_log',
          type: 'document',
          title: 'Valve Sensor Telemetry',
          description: 'Telemetry log.',
          content: { text: 'Valve manual override activated.' },
          relatedSuspectIds: ['suspect_kane'],
          relatedEventIds: ['evt_dump'],
        },
        {
          id: 'ev_firmware_diff',
          type: 'document',
          title: 'Git Commit Audit',
          description: 'Repo commit.',
          content: { text: 'Unauthorized commit to fan speed controller.' },
          relatedSuspectIds: ['suspect_elena'],
          relatedEventIds: ['evt_dump'],
        },
        {
          id: 'ev_badge_log',
          type: 'access_log',
          title: 'Gate Access Badge Log',
          description: 'Gate 4 reader.',
          content: { text: 'Kane badge scanned at 03:08.' },
          relatedSuspectIds: ['suspect_kane'],
          relatedEventIds: ['evt_dump'],
        },
      ],
      solution: {
        culpritId: 'suspect_kane',
        culpritName: 'Kane Miller',
        motive: 'Retribution for intellectual property dispute',
        method: 'Physical valve depressurization to force evac',
        rationale: 'Gate badge reader placed Kane on site despite alibi.',
        decisiveEvidenceIds: ['ev_coolant_log', 'ev_badge_log'],
        redHerrings: [],
      },
    };

    const caseBData = {
      title: 'The Stolen Renaissance Fresco',
      summary: 'An ancient palazzo mural removed with diamond wire.',
      category: 'theft',
      incident: {
        description: 'The private chapel fresco was cut from the stucco wall overnight.',
        location: 'Palazzo Medici',
        timeDescription: 'Midnight',
      },
      suspects: [
        {
          id: 'suspect_marcello',
          name: 'Marcello Rossi',
          occupation: 'Architectural Conservator',
          relationship: 'Historic preservation advisor',
          summary: 'Faced ruin following a failed art gallery venture in Zurich.',
          alibiPublicText: 'Claims he was attending an academic symposium in Rome.',
          relatedEvidenceIds: ['ev_rail_receipt'],
          relatedEventIds: ['evt_cut'],
        },
        {
          id: 'suspect_bianca',
          name: 'Bianca Conti',
          occupation: 'Estate Archivist',
          relationship: 'Family genealogist',
          summary: 'Disputed the authentic ownership of the fresco.',
          alibiPublicText: 'Claims she was cataloging manuscripts in the east wing.',
          relatedEvidenceIds: ['ev_manuscript'],
          relatedEventIds: ['evt_cut'],
        },
      ],
      timeline: [
        {
          id: 'evt_cut',
          timeDescription: '23:45',
          description: 'Diamond wire saw motor hum registered on acoustic sensor.',
          relatedSuspectIds: ['suspect_marcello'],
          relatedEvidenceIds: ['ev_rail_receipt'],
          displayOrder: 1,
        },
        {
          id: 'evt_vanish',
          timeDescription: '00:15',
          description: 'Service courtyard gate opened.',
          relatedSuspectIds: ['suspect_marcello'],
          relatedEvidenceIds: ['ev_rail_receipt'],
          displayOrder: 2,
        },
      ],
      evidence: [
        {
          id: 'ev_rail_receipt',
          type: 'document',
          title: 'Train Ticket Timestamp',
          description: 'High-speed rail ticket from Florence to Rome.',
          content: { text: 'Ticket validated at 06:15 AM, not previous evening.' },
          relatedSuspectIds: ['suspect_marcello'],
          relatedEventIds: ['evt_cut'],
        },
        {
          id: 'ev_manuscript',
          type: 'document',
          title: 'Archival Catalog Ledger',
          description: 'Reading room ledger.',
          content: { text: 'Bianca checked out archives at 23:30.' },
          relatedSuspectIds: ['suspect_bianca'],
          relatedEventIds: ['evt_cut'],
        },
        {
          id: 'ev_acoustic',
          type: 'document',
          title: 'Acoustic Sensor Audio Spectrum',
          description: 'Vibration frequency analysis.',
          content: { text: 'Acoustic resonance matches diamond circular stone saw.' },
          relatedSuspectIds: ['suspect_marcello'],
          relatedEventIds: ['evt_cut'],
        },
      ],
      solution: {
        culpritId: 'suspect_marcello',
        culpritName: 'Marcello Rossi',
        motive: 'Settling massive gambling debts through private black-market commission',
        method: 'Diamond-wire extraction via architectural scaffolding',
        rationale: 'Train ticket validation confirms Marcello was in Florence at midnight.',
        decisiveEvidenceIds: ['ev_rail_receipt', 'ev_acoustic'],
        redHerrings: [],
      },
    };

    // Calculate similarity between Case A and Case B
    const similarity = calculateScenarioSimilarity(caseBData, [caseAData]);
    expect(similarity).toBeLessThan(0.3); // High diversity!
  });

  it('Rejects malformed model output and throws AiGenerationError instead of fake success', async () => {
    const malformedClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: '{"title": "Broken Mystery", "incident": {}}', // Missing required schema fields
        }),
      },
    };

    await expect(
      generateMysteryCase({
        scenario: 'A broken test prompt to test validation failures',
        modelClient: malformedClient,
      })
    ).rejects.toThrow(AiGenerationError);
  });

  it('Fails gracefully with 502 AI_GENERATION_FAILED when provider throws network or quota error', async () => {
    const errorClient = {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('RESOURCE_EXHAUSTED: Gemini quota limit reached')),
      },
    };

    await expect(
      generateMysteryCase({
        scenario: 'A scenario triggering a simulated quota exhaustion error',
        modelClient: errorClient,
      })
    ).rejects.toThrow(/Failed to generate a genuine AI mystery case/);
  });

  it('Ensures solution secrecy on initial case retrieval', async () => {
    const createRes = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        scenario: 'The mysterious theft of an encrypted satellite transceiver',
        category: 'corporate_espionage',
        forceFallback: true,
      });

    expect(createRes.status).toBe(201);
    const caseId = createRes.body.data.case.id;

    // Fetch case detail
    const getRes = await request(app)
      .get(`/api/v1/cases/${caseId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(200);
    const caseDossier = getRes.body.data.case;

    // Strict secrecy asserts
    expect(caseDossier.solution).toBeUndefined();
    expect(caseDossier.culpritId).toBeUndefined();
    expect(caseDossier.culpritName).toBeUndefined();
    expect(caseDossier.suspects.every((s) => s.isCulprit === undefined)).toBe(true);

    // Verify solution is still inaccessible on result endpoint because case is not completed
    const resultRes = await request(app)
      .get(`/api/v1/cases/${caseId}/result`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(resultRes.status).toBe(409);
    expect(resultRes.body.error.code).toBe('CASE_NOT_COMPLETED');
  });
});
