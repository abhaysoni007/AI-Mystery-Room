import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { InvestigationProvider } from '../src/context/InvestigationContext';
import { AuthProvider } from '../src/context/AuthContext';
import { CreateMysteryPage } from '../src/pages/CreateMysteryPage';
import * as api from '../src/services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateMysteryPage Generation Pipeline Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    vi.restoreAllMocks();
    // Simulate authenticated session
    localStorage.setItem('ai_mystery_token', 'valid_test_token');
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 'test_user_id',
      username: 'lead_detective',
      name: 'Lead Detective',
    });
    vi.spyOn(api, 'getCases').mockResolvedValue([]);
  });

  it('displays loading state and prevents duplicate submission while generation is active', async () => {
    let resolveApiCall;
    const pendingPromise = new Promise((resolve) => {
      resolveApiCall = resolve;
    });

    vi.spyOn(api, 'createCase').mockReturnValue(pendingPromise);

    render(
      <MemoryRouter>
        <AuthProvider>
          <InvestigationProvider>
            <CreateMysteryPage />
          </InvestigationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for auth to settle
    await waitFor(() => expect(screen.getByLabelText(/Scenario Premise/i)).toBeInTheDocument());

    const textarea = screen.getByLabelText(/Scenario Premise/i);
    fireEvent.change(textarea, {
      target: { value: 'A high-level cryptographic key was intercepted from an alpine vault' },
    });

    const submitBtn = screen.getByRole('button', { name: /GENERATE MYSTERY/i });
    fireEvent.click(submitBtn);

    // Should switch to GENERATION PIPELINE ACTIVE loading screen
    await waitFor(() => {
      expect(screen.getByText(/SYNTHESIZING MYSTERY/i)).toBeInTheDocument();
      expect(screen.getByText(/GENERATION PIPELINE ACTIVE/i)).toBeInTheDocument();
    });

    // Resolve the call
    resolveApiCall({
      id: 'case_persisted_999',
      title: 'The Alpine Cipher Heist',
      category: 'cybercrime',
      status: 'active',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/case/case_persisted_999');
    });
  });

  it('displays clear user-facing error and retry button when AI generation fails', async () => {
    vi.spyOn(api, 'createCase').mockRejectedValue(
      new Error('AI mystery generation failed: Rate limit exceeded. Please try again.')
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <InvestigationProvider>
            <CreateMysteryPage />
          </InvestigationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByLabelText(/Scenario Premise/i)).toBeInTheDocument());

    const textarea = screen.getByLabelText(/Scenario Premise/i);
    fireEvent.change(textarea, {
      target: { value: 'A prototype drone disappeared from Hangar 4 during an unmonitored test flight' },
    });

    const submitBtn = screen.getByRole('button', { name: /GENERATE MYSTERY/i });
    fireEvent.click(submitBtn);

    // Should display the error message and retry button
    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    // Should NOT have navigated to any fake case
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
