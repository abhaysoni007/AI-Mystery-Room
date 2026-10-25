import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { InvestigationProvider } from '../src/context/InvestigationContext';
import { EvidenceViewerPage } from '../src/pages/evidence/EvidenceViewerPage';
import { SAMPLE_CASE } from '../src/data/sampleCase';

function renderEvidenceViewer(evidenceId) {
  return render(
    <MemoryRouter initialEntries={[`/case/case_midnight_gallery_01/evidence/${evidenceId}`]}>
      <InvestigationProvider>
        <Routes>
          <Route
            path="/case/:caseId/evidence/:evidenceId"
            element={<EvidenceViewerPage />}
          />
        </Routes>
      </InvestigationProvider>
    </MemoryRouter>
  );
}

describe('Type-Specific Evidence Viewers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders chat viewer with participant bubbles and messages', () => {
    renderEvidenceViewer('evidence_chat_01');

    expect(screen.getAllByText('Recovered Messaging Thread: "Grid Maintenance"')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Apex_Ops/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Vance_E/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Is the north corridor bypass ready/i)).toBeInTheDocument();
    expect(screen.getByText(/Do your job cleanly and leave no traces/i)).toBeInTheDocument();
    expect(screen.getByText(/BACK TO EVIDENCE VAULT/i)).toBeInTheDocument();
  });

  it('renders image viewer with crime scene photo frame, zoom toggle, and observations', () => {
    renderEvidenceViewer('evidence_img_01');

    expect(screen.getAllByText('Crime Scene Photo: Laser Cut Glass Casing')[0]).toBeInTheDocument();
    expect(screen.getByText(/450nm fiber cutter/i)).toBeInTheDocument();
    expect(screen.getByText(/Precision incision radius/i)).toBeInTheDocument();

    // Zoom toggle button exists
    const zoomBtn = screen.getByRole('button', { name: /ZOOM/i });
    expect(zoomBtn).toBeInTheDocument();
    fireEvent.click(zoomBtn);
    expect(screen.getByRole('button', { name: /RESET/i })).toBeInTheDocument();
  });

  it('renders surveillance viewer with CCTV telemetry reconstruction and timestamp log', () => {
    renderEvidenceViewer('evidence_surv_01');

    expect(screen.getAllByText('Camera 04 Reconstruction: Lower Concourse')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/CAM-04B/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/21:28:44/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Figure swipes an authorized maintenance master card/i)).toBeInTheDocument();
    expect(screen.getByText(/SIMULATED SURVEILLANCE RECONSTRUCTION/i)).toBeInTheDocument();
  });

  it('renders document viewer with digital keycard access records table', () => {
    renderEvidenceViewer('evidence_log_01');

    expect(screen.getAllByText('Digital Keycard Access Log: Sub-Level 2')[0]).toBeInTheDocument();
    expect(screen.getByText(/ACC-LOG-8829-VAULT/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ID-092 \(J. Ross\)/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Service Tunnel East/i)).toBeInTheDocument();
    expect(screen.getByText(/EGRESS \(Override\)/i)).toBeInTheDocument();
  });

  it('renders forensic report viewer with chemical lab findings', () => {
    renderEvidenceViewer('evidence_forensic_01');

    expect(screen.getAllByText('Chemical Residue Report: North Vault')[0]).toBeInTheDocument();
    expect(screen.getByText(/Metropolitan Forensic Chemistry Center/i)).toBeInTheDocument();
    expect(screen.getByText(/dimethylformamide/i)).toBeInTheDocument();
    expect(screen.getByText(/batch #SL-99/i)).toBeInTheDocument();
  });

  it('renders witness statement viewer with deposition transcript', () => {
    renderEvidenceViewer('evidence_statement_01');

    expect(screen.getAllByText('Interview Transcript: Janitorial Supervisor')[0]).toBeInTheDocument();
    expect(screen.getByText(/Hector Santos/i)).toBeInTheDocument();
    expect(screen.getByText(/Det. Sergeant K. Miller/i)).toBeInTheDocument();
    expect(screen.getByText(/muffled—someone had wedged cardboard/i)).toBeInTheDocument();
  });

  it('marks evidence as examined in investigation context when opened', () => {
    renderEvidenceViewer('evidence_chat_01');

    // Check localStorage progress has evidence_chat_01
    const stored = JSON.parse(localStorage.getItem(`ai_mystery_progress_${SAMPLE_CASE.id}`));
    expect(stored.openedEvidenceIds).toContain('evidence_chat_01');
  });
});
