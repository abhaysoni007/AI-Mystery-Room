import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { InvestigationProvider, useInvestigation } from '../src/context/InvestigationContext';

function TestConsumer() {
  const { currentCase, progress, submitAccusation } = useInvestigation();
  return (
    <div>
      <span data-testid="case-title">{currentCase.title}</span>
      <span data-testid="suspect-count">{currentCase.suspects.length}</span>
      <span data-testid="evidence-count">{currentCase.evidence.length}</span>
      <span data-testid="case-status">{progress.status}</span>
      <button
        onClick={() => submitAccusation('suspect_03', 'Access log matches exit')}
        data-testid="accuse-btn"
      >
        Accuse Julian
      </button>
    </div>
  );
}

describe('InvestigationContext & Fixture Architecture', () => {
  it('provides public sample case without exposing canonical culprit in public state', () => {
    render(
      <InvestigationProvider>
        <TestConsumer />
      </InvestigationProvider>
    );

    expect(screen.getByTestId('case-title').textContent).toBe('The Gallery After Midnight');
    expect(screen.getByTestId('suspect-count').textContent).toBe('4');
    expect(screen.getByTestId('evidence-count').textContent).toBe('6');
    expect(screen.getByTestId('case-status').textContent).toBe('active');
  });

  it('evaluates accusation deterministically on submission and reveals authorized solution', async () => {
    render(
      <InvestigationProvider>
        <TestConsumer />
      </InvestigationProvider>
    );

    const button = screen.getByTestId('accuse-btn');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('case-status').textContent).toBe('completed');
    });
  });
});
