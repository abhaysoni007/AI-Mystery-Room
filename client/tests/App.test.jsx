import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, message: 'API running', data: { database: 'connected' } }),
  })
);

describe('App Component', () => {
  it('renders brand wordmark and hero title', async () => {
    render(<App />);
    const brandElements = screen.getAllByText(/AI MYSTERY ROOM/i);
    expect(brandElements.length).toBeGreaterThanOrEqual(1);
    expect(brandElements[0]).toBeInTheDocument();
    expect(screen.getByText(/CRACK THE CODE/i)).toBeInTheDocument();
    expect(screen.getByText(/START AN INVESTIGATION/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/API running/i)).toBeInTheDocument();
    });
  });

  it('renders Neo-Brutalist UI cards and foundation status', async () => {
    render(<App />);
    expect(screen.getByText(/Phase 1 Foundation Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Monorepo Workspaces/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/CONNECTED/i)).toBeInTheDocument();
    });
  });
});
