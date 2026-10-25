import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { InvestigationProvider } from '../src/context/InvestigationContext';
import { AccusationPage } from '../src/pages/AccusationPage';
import { ResultRevealPage } from '../src/pages/ResultRevealPage';
import { SAMPLE_CASE } from '../src/data/sampleCase';

function renderAccusationFlow(initialRoute = '/case/case_midnight_gallery_01/accuse') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <InvestigationProvider>
        <Routes>
          <Route path="/case/:caseId/accuse" element={<AccusationPage />} />
          <Route path="/case/:caseId/result" element={<ResultRevealPage />} />
        </Routes>
      </InvestigationProvider>
    </MemoryRouter>
  );
}

describe('Accusation Flow and Solution Reveal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('disables submit button until a suspect is selected', () => {
    renderAccusationFlow();

    expect(screen.getByText(/NAME THE PRIMARY PERPETRATOR/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /SUBMIT FINAL INDICTMENT/i });
    expect(submitBtn).toBeDisabled();

    // Select Julian Ross
    const julianCard = screen.getByText('Julian Ross');
    fireEvent.click(julianCard);

    expect(submitBtn).not.toBeDisabled();
  });

  it('opens confirmation modal and navigates to result on correct accusation', async () => {
    renderAccusationFlow();

    // Select Julian Ross (the actual culprit)
    const julianCard = screen.getByText('Julian Ross');
    fireEvent.click(julianCard);

    // Click submit indictment
    const submitBtn = screen.getByRole('button', { name: /SUBMIT FINAL INDICTMENT/i });
    fireEvent.click(submitBtn);

    // Modal dialog should appear
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/FINAL ACCUSATION CONFIRMATION/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Julian Ross/i)).toBeInTheDocument();

    // Confirm accusation
    const confirmBtn = within(dialog).getByRole('button', { name: /SEAL AND DELIVER VERDICT/i });
    fireEvent.click(confirmBtn);

    // Should navigate to ResultRevealPage with victory banner
    expect(screen.getByText(/CASE CLOSED — ACCUSATION VERIFIED CORRECT/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Julian Ross/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/DECISIVE EVIDENCE CONNECTING THE CULPRIT/i)).toBeInTheDocument();
    expect(screen.getByText(/DECEPTIVE LEADS & CLEARED SUSPECTS/i)).toBeInTheDocument();
  });

  it('renders wrongful indictment banner when incorrect suspect is accused', async () => {
    renderAccusationFlow();

    // Select Alex Morgan (innocent curator)
    const alexCard = screen.getByText('Alex Morgan');
    fireEvent.click(alexCard);

    const submitBtn = screen.getByRole('button', { name: /SUBMIT FINAL INDICTMENT/i });
    fireEvent.click(submitBtn);

    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: /SEAL AND DELIVER VERDICT/i });
    fireEvent.click(confirmBtn);

    // Should navigate to ResultRevealPage with failure banner
    expect(screen.getByText(/ACCUSATION FAILED — WRONGFUL INDICTMENT/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Alex Morgan/i)[0]).toBeInTheDocument();
    // Reveals actual culprit
    expect(screen.getAllByText(/Julian Ross/i)[0]).toBeInTheDocument();
  });
});
