import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { LoginPage } from '../src/pages/LoginPage';
import { SignupPage } from '../src/pages/SignupPage';
import * as api from '../src/services/api';

function renderWithRouter(initialEntry = '/login') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<div data-testid="dashboard-view">CASE DASHBOARD</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Authentication Dedicated Pages (/login, /signup)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 'u_default',
      name: 'Agent Cooper',
      username: 'cooper_fbi',
      hasCompletedWalkthrough: true,
    });
  });

  describe('LoginPage (/login)', () => {
    it('renders login page with username, password fields, submit button and links', () => {
      renderWithRouter('/login');

      expect(screen.getByRole('heading', { name: /DETECTIVE SIGN IN/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Detective ID \/ Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ACCESS DOSSIER/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^REGISTER$/i })).toHaveAttribute('href', '/signup');
    });

    it('submits valid credentials, calls api.login, and navigates to dashboard', async () => {
      vi.spyOn(api, 'login').mockResolvedValue({
        token: 'auth_token_xyz',
        user: { id: 'u_101', name: 'Agent Cooper', username: 'cooper_fbi' },
      });

      renderWithRouter('/login');

      fireEvent.change(screen.getByLabelText(/Detective ID \/ Username/i), { target: { value: 'cooper_fbi' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'DamnFineCoffee1!' } });
      fireEvent.click(screen.getByRole('button', { name: /ACCESS DOSSIER/i }));

      await waitFor(() => {
        expect(api.login).toHaveBeenCalledWith({
          username: 'cooper_fbi',
          password: 'DamnFineCoffee1!',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
      });
    });

    it('displays error if credentials are rejected', async () => {
      const err = new Error('Invalid Detective ID or password');
      vi.spyOn(api, 'login').mockRejectedValue(err);

      renderWithRouter('/login');

      fireEvent.change(screen.getByLabelText(/Detective ID \/ Username/i), { target: { value: 'wrong_agent' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'WrongPass!' } });
      fireEvent.click(screen.getByRole('button', { name: /ACCESS DOSSIER/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid Detective ID or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('SignupPage (/signup)', () => {
    it('renders signup form with name, username, password fields and link to login', () => {
      renderWithRouter('/signup');

      expect(screen.getByRole('heading', { name: /CREATE INVESTIGATOR ACCOUNT/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Detective Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Detective ID \/ Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /REGISTER & ENTER BUREAU/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^SIGN IN$/i })).toHaveAttribute('href', '/login');
    });

    it('submits signup details, calls api.signup, and directly activates/navigates to dashboard', async () => {
      vi.spyOn(api, 'signup').mockResolvedValue({
        token: 'auth_token_scully',
        user: { id: 'u_102', name: 'Dana Scully', username: 'scully_fbi', hasCompletedWalkthrough: false },
      });

      renderWithRouter('/signup');

      fireEvent.change(screen.getByLabelText(/Detective Name/i), { target: { value: 'Dana Scully' } });
      fireEvent.change(screen.getByLabelText(/Detective ID \/ Username/i), { target: { value: 'scully_fbi' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'TrustNo1!' } });
      fireEvent.click(screen.getByRole('button', { name: /REGISTER & ENTER BUREAU/i }));

      await waitFor(() => {
        expect(api.signup).toHaveBeenCalledWith({
          name: 'Dana Scully',
          username: 'scully_fbi',
          password: 'TrustNo1!',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
      });
    });
  });
});
