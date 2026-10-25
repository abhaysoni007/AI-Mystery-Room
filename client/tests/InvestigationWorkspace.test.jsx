import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { InvestigationProvider } from '../src/context/InvestigationContext';
import { InvestigationLayout } from '../src/layouts/InvestigationLayout';
import { CaseOverviewView } from '../src/pages/investigation/CaseOverviewView';
import { SuspectsView } from '../src/pages/investigation/SuspectsView';
import { EvidenceView } from '../src/pages/investigation/EvidenceView';
import { TimelineView } from '../src/pages/investigation/TimelineView';
import { NotesView } from '../src/pages/investigation/NotesView';
import { SAMPLE_CASE } from '../src/data/sampleCase';

function renderWorkspace(initialRoute = '/case/case_midnight_gallery_01/overview') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <InvestigationProvider>
        <Routes>
          <Route path="/case/:caseId" element={<InvestigationLayout />}>
            <Route index element={<CaseOverviewView />} />
            <Route path="overview" element={<CaseOverviewView />} />
            <Route path="suspects" element={<SuspectsView />} />
            <Route path="evidence" element={<EvidenceView />} />
            <Route path="timeline" element={<TimelineView />} />
            <Route path="notes" element={<NotesView />} />
          </Route>
        </Routes>
      </InvestigationProvider>
    </MemoryRouter>
  );
}

describe('Investigation Workspace', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders top bar with case title, progress pill, and navigation links', () => {
    renderWorkspace();

    // Top bar checks
    expect(screen.getByText(SAMPLE_CASE.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MAKE ACCUSATION/i })).toBeInTheDocument();
    expect(screen.getByText(/ALL CASES/i)).toBeInTheDocument();

    // Navigation links exist (using getAllByRole since desktop sidebar & mobile nav both render)
    expect(screen.getAllByRole('link', { name: /OVERVIEW/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /SUSPECTS/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /EVIDENCE/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /TIMELINE/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /NOTES/i })[0]).toBeInTheDocument();
  });

  it('renders CaseOverviewView with incident location and summary', () => {
    renderWorkspace('/case/case_midnight_gallery_01/overview');

    expect(screen.getByText(/INCIDENT REPORT/i)).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_CASE.incident.location)).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_CASE.incident.description)).toBeInTheDocument();
  });

  it('renders SuspectsView and opens SuspectProfileModal on click', () => {
    renderWorkspace('/case/case_midnight_gallery_01/suspects');

    expect(screen.getByText(/SUSPECT ROSTER & STATEMENTS/i)).toBeInTheDocument();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('Elena Vance')).toBeInTheDocument();

    // Open first suspect's profile modal
    const inspectButtons = screen.getAllByRole('button', { name: /INSPECT DOSSIER/i });
    fireEvent.click(inspectButtons[0]);

    // Modal should appear with detailed alibi
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Alex Morgan/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/VIP lounge/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = within(dialog).getByRole('button', { name: /CLOSE DOSSIER/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders EvidenceView with category filter tabs and clue cards', () => {
    renderWorkspace('/case/case_midnight_gallery_01/evidence');

    expect(screen.getByText(/EVIDENCE VAULT & FORENSIC ARTIFACTS/i)).toBeInTheDocument();
    expect(screen.getByText('Recovered Messaging Thread: "Grid Maintenance"')).toBeInTheDocument();
    expect(screen.getByText('Digital Keycard Access Log: Sub-Level 2')).toBeInTheDocument();

    // Filter by CHAT
    const chatTab = screen.getByRole('button', { name: /CHAT/i });
    fireEvent.click(chatTab);
    expect(screen.getByText('Recovered Messaging Thread: "Grid Maintenance"')).toBeInTheDocument();
    expect(screen.queryByText('Digital Keycard Access Log: Sub-Level 2')).not.toBeInTheDocument();
  });

  it('renders TimelineView with chronological sequence of events', () => {
    renderWorkspace('/case/case_midnight_gallery_01/timeline');

    expect(screen.getByText(/INCIDENT TIMELINE & RECONSTRUCTION/i)).toBeInTheDocument();
    expect(screen.getByText(/The Vanguard Annual Gala opens/i)).toBeInTheDocument();
    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.getByText(/Breaker box tripped in electrical tunnel/i)).toBeInTheDocument();
  });

  it('renders NotesView, updates notes, and preserves state in context', async () => {
    renderWorkspace('/case/case_midnight_gallery_01/notes');

    expect(screen.getByText(/DETECTIVE'S FIELD NOTEBOOK/i)).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/Record suspect contradictions/i);

    fireEvent.change(textarea, { target: { value: 'Alex Morgan had keycard access at 21:28.' } });
    expect(textarea.value).toBe('Alex Morgan had keycard access at 21:28.');
    await waitFor(() => expect(screen.getByText(/SAVED TO TERMINAL/i)).toBeInTheDocument());
  });

  it('NEVER renders canonical culprit solution in workspace pre-accusation', () => {
    renderWorkspace('/case/case_midnight_gallery_01/overview');

    // The canonical solution for this sample case is suspect_02 (Elena Vance) with specific decisive rationale
    // Verify private solution keywords are not rendered
    expect(screen.queryByText(/CULPRIT REVEALED/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CANONICAL SOLUTION/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DECISIVE EVIDENCE IDENTIFIED/i)).not.toBeInTheDocument();
  });
});
