import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { InvestigationProvider } from '../src/context/InvestigationContext';
import { DashboardPage } from '../src/pages/DashboardPage';
import { SAMPLE_CASE } from '../src/data/sampleCase';

describe('DashboardPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders stats summary and sample case card', () => {
    render(
      <MemoryRouter>
        <InvestigationProvider>
          <DashboardPage />
        </InvestigationProvider>
      </MemoryRouter>
    );

    // Header & stats
    expect(screen.getByText(/CASE ARCHIVE & ACTIVE DOSSIERS/i)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL DOSSIERS/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE CASES/i)).toBeInTheDocument();
    expect(screen.getByText(/SOLVED CASES/i)).toBeInTheDocument();

    // Sample Case Title
    expect(screen.getByText(SAMPLE_CASE.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /RESUME INVESTIGATION/i })).toBeInTheDocument();
  });

  it('switches between filter tabs and displays corresponding cases or empty state', () => {
    render(
      <MemoryRouter>
        <InvestigationProvider>
          <DashboardPage />
        </InvestigationProvider>
      </MemoryRouter>
    );

    // Initial state: 1 active case
    expect(screen.getByText(SAMPLE_CASE.title)).toBeInTheDocument();

    // Click "COMPLETED" tab
    const completedTab = screen.getByRole('button', { name: /COMPLETED/i });
    fireEvent.click(completedTab);

    // Should show empty state since no cases are completed yet
    expect(screen.getByText(/NO CASES FOUND/i)).toBeInTheDocument();

    // Click "ACTIVE" tab
    const activeTab = screen.getByRole('button', { name: /ACTIVE/i });
    fireEvent.click(activeTab);
    expect(screen.getByText(SAMPLE_CASE.title)).toBeInTheDocument();
  });

  it('opens delete confirmation modal and cancels or deletes case', async () => {
    // Populate two cases in localStorage so deleting one leaves the other
    const initialCases = [
      SAMPLE_CASE,
      {
        ...SAMPLE_CASE,
        id: 'case_to_delete',
        title: 'Case To Delete Permanently',
        status: 'active',
      },
    ];
    localStorage.setItem('ai_mystery_cases', JSON.stringify(initialCases));

    render(
      <MemoryRouter>
        <InvestigationProvider>
          <DashboardPage />
        </InvestigationProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Case To Delete Permanently')).toBeInTheDocument();

    // Find delete button for "Case To Delete Permanently"
    const deleteButtons = screen.getAllByRole('button', { name: /DELETE CASE/i });
    fireEvent.click(deleteButtons[1]);

    // Modal dialog should appear
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/DELETE CASE DOSSIER/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Case To Delete Permanently/i)).toBeInTheDocument();

    // Click confirm delete
    const confirmBtn = within(dialog).getByRole('button', { name: /CONFIRM DELETION/i });
    fireEvent.click(confirmBtn);

    // Case should be removed from view
    expect(screen.queryByText('Case To Delete Permanently')).not.toBeInTheDocument();
    expect(screen.getByText(SAMPLE_CASE.title)).toBeInTheDocument();
  });
});
