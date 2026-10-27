import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SampleCaseCard } from '../src/components/landing/SampleCaseCard';
import { LandingPage } from '../src/pages/LandingPage';
import * as InvestigationContext from '../src/context/InvestigationContext';

describe('SampleCaseCard & LandingPage Null Case Resilience', () => {
  it('renders SampleCaseCard gracefully when caseData is null or undefined without throwing', () => {
    expect(() => {
      render(
        <MemoryRouter>
          <SampleCaseCard caseData={null} />
        </MemoryRouter>
      );
    }).not.toThrow();

    expect(screen.getByText(/FEATURED INVESTIGATION DOSSIER/i)).toBeInTheDocument();
    expect(screen.getByText(/The Gallery After Midnight/i)).toBeInTheDocument();
  });

  it('renders LandingPage gracefully without throwing when currentCase in context is null', () => {
    vi.spyOn(InvestigationContext, 'useInvestigation').mockReturnValue({
      currentCase: null,
      cases: [],
      isLoadingCases: false,
    });

    expect(() => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
    }).not.toThrow();

    expect(screen.getByText(/CRACK THE CASE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/The Gallery After Midnight/i).length).toBeGreaterThanOrEqual(1);
  });
});
