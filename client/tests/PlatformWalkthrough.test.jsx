import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { PlatformWalkthrough } from '../src/components/walkthrough/PlatformWalkthrough';
import * as api from '../src/services/api';

function WalkthroughTestWrapper() {
  const { openWalkthrough } = useAuth();
  React.useEffect(() => {
    openWalkthrough();
  }, [openWalkthrough]);

  return <PlatformWalkthrough />;
}

describe('PlatformWalkthrough Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders step 1 (Command Center) with skip and next buttons', () => {
    render(
      <AuthProvider>
        <WalkthroughTestWrapper />
      </AuthProvider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/STEP 1 OF 5/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /CENTRAL COMMAND & CASE ARCHIVE/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /SKIP TOUR/i })[0]).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /NEXT FEATURE/i });
    expect(nextBtn).toBeInTheDocument();
  });

  it('advances through all 5 feature steps using Next and Previous buttons', () => {
    render(
      <AuthProvider>
        <WalkthroughTestWrapper />
      </AuthProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /NEXT FEATURE/i });

    // Step 1 -> Step 2
    fireEvent.click(nextBtn);
    expect(screen.getByText(/STEP 2 OF 5/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /AI MYSTERY GENERATION ENGINE/i })).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(nextBtn);
    expect(screen.getByText(/STEP 3 OF 5/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /THE DETECTIVE WORKSPACE/i })).toBeInTheDocument();

    // Step 3 -> Step 4
    fireEvent.click(nextBtn);
    expect(screen.getByText(/STEP 4 OF 5/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /FORENSIC EVIDENCE ANALYSIS/i })).toBeInTheDocument();

    // Step 4 -> Step 5
    fireEvent.click(nextBtn);
    expect(screen.getByText(/STEP 5 OF 5/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /THE FINAL ACCUSATION & VERDICT/i })).toBeInTheDocument();

    // On Step 5, primary button is "START INVESTIGATING"
    expect(screen.getByRole('button', { name: /START INVESTIGATING/i })).toBeInTheDocument();

    // Test Previous button
    const prevBtn = screen.getByRole('button', { name: /PREVIOUS/i });
    fireEvent.click(prevBtn);
    expect(screen.getByText(/STEP 4 OF 5/i)).toBeInTheDocument();
  });

  it('clicking "SKIP TOUR" immediately closes the tour and marks walkthrough complete', () => {
    const updateSpy = vi.spyOn(api, 'updateWalkthrough').mockResolvedValue({ user: {} });

    render(
      <AuthProvider>
        <WalkthroughTestWrapper />
      </AuthProvider>
    );

    const skipBtn = screen.getAllByRole('button', { name: /SKIP TOUR/i })[0];
    fireEvent.click(skipBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(updateSpy).toHaveBeenCalledWith(true);
  });

  it('clicking "START INVESTIGATING" on final step closes tour and marks complete', () => {
    const updateSpy = vi.spyOn(api, 'updateWalkthrough').mockResolvedValue({ user: {} });

    render(
      <AuthProvider>
        <WalkthroughTestWrapper />
      </AuthProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /NEXT FEATURE/i });
    // Advance to step 5
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);

    const finishBtn = screen.getByRole('button', { name: /START INVESTIGATING/i });
    fireEvent.click(finishBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(updateSpy).toHaveBeenCalledWith(true);
  });
});
