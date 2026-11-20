import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, it, expect, beforeEach } from 'vitest';
import { FeatureUpdates } from '../src/components/walkthrough/FeatureUpdates';
const open = vi.hoisted(() => vi.fn());
vi.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' }, isWalkthroughOpen: false, openWalkthrough: open }) }));
beforeEach(() => { localStorage.clear(); open.mockClear(); });
const show = (path = '/dashboard') => render(<MemoryRouter initialEntries={[path]}><FeatureUpdates/></MemoryRouter>);
it('shows both guides over a blurred backdrop and remembers dismissal', () => {
  show();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('THE EVIDENCE BOARD')).toBeInTheDocument();
  expect(screen.getByText('SUSPECT INTERVIEWS')).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Close feature updates'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  cleanup(); show();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('opens the persistent user manual and dismisses the update cards', () => {
  show(); fireEvent.click(screen.getByText('Open user manual'));
  expect(open).toHaveBeenCalledOnce();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('does not interrupt case creation', () => {
  show('/create');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('dismisses with Escape', () => {
  show(); fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
