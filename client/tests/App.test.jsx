import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../src/App';

describe('App Component', () => {
  it('renders brand wordmark and hero title', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/AI MYSTERY ROOM/i);
    expect(brandElements.length).toBeGreaterThanOrEqual(1);
    expect(brandElements[0]).toBeInTheDocument();
    expect(screen.getByText(/CRACK THE CASE/i)).toBeInTheDocument();
    expect(screen.getByText(/START AN INVESTIGATION/i)).toBeInTheDocument();
  });

  it('renders landing page sections and sample dossier card', () => {
    render(<App />);
    expect(screen.getByText(/HOW THE CASE UNFOLDS/i)).toBeInTheDocument();
    expect(screen.getByText(/NOT JUST A STORY/i)).toBeInTheDocument();
    const caseTitles = screen.getAllByText(/The Gallery After Midnight/i);
    expect(caseTitles.length).toBeGreaterThanOrEqual(1);
    expect(caseTitles[0]).toBeInTheDocument();
  });
});
