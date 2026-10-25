import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../src/services/api';

describe('client api service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getCases fetches cases list and unwraps data.cases', async () => {
    const mockCases = [{ id: 'case_1', title: 'Case 1' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { cases: mockCases } }),
    });

    const result = await api.getCases();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockCases);
  });

  it('createCase sends POST with scenario payload', async () => {
    const newCase = { id: 'case_new', title: 'The New Case' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { case: newCase } }),
    });

    const payload = {
      scenario: 'A rare painting was stolen during an exhibition.',
      category: 'theft',
      difficulty: 'medium',
      length: 'standard',
    };

    const result = await api.createCase(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual(newCase);
  });

  it('updateProgress sends PATCH with openedEvidenceId and notes', async () => {
    const mockProgress = { openedEvidenceIds: ['ev_1'], notes: 'Key lead' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { progress: mockProgress } }),
    });

    const result = await api.updateProgress('case_1', { openedEvidenceId: 'ev_1', notes: 'Key lead' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/case_1/progress'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ openedEvidenceId: 'ev_1', notes: 'Key lead' }),
      })
    );
    expect(result).toEqual(mockProgress);
  });

  it('submitAccusation sends POST with suspectId and reasoning', async () => {
    const mockAccusation = { id: 'acc_1', isCorrect: true, score: 100 };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { accusation: mockAccusation, resultAvailable: true } }),
    });

    const result = await api.submitAccusation('case_1', {
      suspectId: 'suspect_01',
      reasoning: 'Fingerprints matched',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cases/case_1/accusations'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ suspectId: 'suspect_01', reasoning: 'Fingerprints matched' }),
      })
    );
    expect(result.accusation).toEqual(mockAccusation);
  });

  it('handles API errors by throwing descriptive Error with response details', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Scenario too short' },
      }),
    });

    await expect(api.createCase({ scenario: 'short' })).rejects.toThrow('Scenario too short');
  });
});
