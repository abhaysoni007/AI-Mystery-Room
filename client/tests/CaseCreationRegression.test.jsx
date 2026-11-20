import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, it, expect } from 'vitest';
import { InvestigationProvider, useInvestigation } from '../src/context/InvestigationContext';
import * as api from '../src/services/api';
vi.mock('../src/context/AuthContext', () => ({ useAuth: () => ({}) }));
vi.mock('../src/services/api', () => ({ createCase: vi.fn(), getCase: vi.fn() }));
function Consumer() {
  const { currentCase, createCase } = useInvestigation();
  return <><button onClick={() => createCase({ scenario: 'A theft at midnight' })}>Generate</button><span>{currentCase?.evidence?.[0]?.title}</span></>;
}
it('hydrates a newly generated summary before entering the case', async () => {
  api.createCase.mockResolvedValue({ id: 'new-case', title: 'Summary only' });
  api.getCase.mockResolvedValue({ id: 'new-case', evidence: [{ title: 'Newly generated clue' }] });
  render(<InvestigationProvider><Consumer /></InvestigationProvider>);
  fireEvent.click(screen.getByText('Generate'));
  await screen.findByText('Newly generated clue');
  expect(api.getCase).toHaveBeenCalledWith('new-case');
});
