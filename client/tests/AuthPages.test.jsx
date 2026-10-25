import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { LoginPage } from '../src/pages/LoginPage';
import { SignupPage } from '../src/pages/SignupPage';
import { ForgotPasswordPage } from '../src/pages/ForgotPasswordPage';
import * as api from '../src/services/api';

function renderWithRouter(initialEntry = '/login') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forget" element={<ForgotPasswordPage />} />
          <Route path="/forgot" element={<Navigate to="/forget" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/forget" replace />} />
          <Route path="/dashboard" element={<div data-testid="dashboard-view">CASE DASHBOARD</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Authentication Dedicated Pages (/login, /signup, /forget)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 'u_default',
      name: 'Agent Cooper',
      email: 'cooper@fbi.gov',
      hasCompletedWalkthrough: true,
    });
  });

  describe('LoginPage (/login)', () => {
    it('renders login page with email, password fields, submit button and links', () => {
      renderWithRouter('/login');

      expect(screen.getByRole('heading', { name: /DETECTIVE SIGN IN/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ACCESS DOSSIER/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Forgot password\?/i })).toHaveAttribute('href', '/forget');
      expect(screen.getByRole('link', { name: /^REGISTER$/i })).toHaveAttribute('href', '/signup');
    });

    it('submits valid credentials, calls api.login, and navigates to dashboard', async () => {
      vi.spyOn(api, 'login').mockResolvedValue({
        token: 'auth_token_xyz',
        user: { id: 'u_101', name: 'Agent Cooper', email: 'cooper@fbi.gov' },
      });

      renderWithRouter('/login');

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'cooper@fbi.gov' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'DamnFineCoffee1!' } });
      fireEvent.click(screen.getByRole('button', { name: /ACCESS DOSSIER/i }));

      await waitFor(() => {
        expect(api.login).toHaveBeenCalledWith({
          email: 'cooper@fbi.gov',
          password: 'DamnFineCoffee1!',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
      });
    });

    it('displays error and transitions to OTP activation if account is not verified', async () => {
      const err = new Error('Account unverified');
      err.code = 'ACCOUNT_NOT_VERIFIED';
      vi.spyOn(api, 'login').mockRejectedValue(err);

      renderWithRouter('/login');

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'cooper@fbi.gov' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'DamnFineCoffee1!' } });
      fireEvent.click(screen.getByRole('button', { name: /ACCESS DOSSIER/i }));

      await waitFor(() => {
        expect(screen.getByText(/Your account is not verified yet/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ACTIVATE YOUR BADGE/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
      });
    });
  });

  describe('SignupPage (/signup)', () => {
    it('renders signup form with name, email, password fields and link to login', () => {
      renderWithRouter('/signup');

      expect(screen.getByRole('heading', { name: /CREATE INVESTIGATOR ACCOUNT/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Detective Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /SEND VERIFICATION OTP/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^SIGN IN$/i })).toHaveAttribute('href', '/login');
    });

    it('submits signup details, displays OTP verification screen, and activates account', async () => {
      vi.spyOn(api, 'signup').mockResolvedValue({
        email: 'scully@fbi.gov',
        name: 'Dana Scully',
      });
      vi.spyOn(api, 'verifyOtp').mockResolvedValue({
        token: 'auth_token_scully',
        user: { id: 'u_102', name: 'Dana Scully', email: 'scully@fbi.gov', hasCompletedWalkthrough: false },
      });

      renderWithRouter('/signup');

      fireEvent.change(screen.getByLabelText(/Detective Name/i), { target: { value: 'Dana Scully' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'scully@fbi.gov' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'TrustNo1!' } });
      fireEvent.click(screen.getByRole('button', { name: /SEND VERIFICATION OTP/i }));

      await waitFor(() => {
        expect(api.signup).toHaveBeenCalledWith({
          name: 'Dana Scully',
          email: 'scully@fbi.gov',
          password: 'TrustNo1!',
        });
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ENTER 6-DIGIT VERIFICATION CODE/i })).toBeInTheDocument();
        expect(screen.getAllByText(/scully@fbi.gov/i)[0]).toBeInTheDocument();
      });

      const otpInput = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(otpInput, { target: { value: '456789' } });
      fireEvent.click(screen.getByRole('button', { name: /CONFIRM & ACTIVATE ACCOUNT/i }));

      await waitFor(() => {
        expect(api.verifyOtp).toHaveBeenCalledWith({
          email: 'scully@fbi.gov',
          otp: '456789',
          purpose: 'signup',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
      });
    });
  });

  describe('ForgotPasswordPage (/forget, /forgot, /forgot-password)', () => {
    it('renders password reset request screen with email field', () => {
      renderWithRouter('/forget');

      expect(screen.getByRole('heading', { name: /RESET INVESTIGATOR PASSWORD/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Registered Email Address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /SEND RESET CODE/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^BACK TO SIGN IN$/i })).toHaveAttribute('href', '/login');
    });

    it('aliases /forgot and /forgot-password to /forget', () => {
      renderWithRouter('/forgot');
      expect(screen.getByRole('heading', { name: /RESET INVESTIGATOR PASSWORD/i })).toBeInTheDocument();
    });

    it('dispatches reset code and completes password reset with OTP and new password', async () => {
      vi.spyOn(api, 'forgotPassword').mockResolvedValue({ email: 'mulder@fbi.gov' });
      vi.spyOn(api, 'resetPassword').mockResolvedValue({
        token: 'auth_token_mulder',
        user: { id: 'u_103', name: 'Fox Mulder', email: 'mulder@fbi.gov' },
      });

      renderWithRouter('/forget');

      fireEvent.change(screen.getByLabelText(/Registered Email Address/i), { target: { value: 'mulder@fbi.gov' } });
      fireEvent.click(screen.getByRole('button', { name: /SEND RESET CODE/i }));

      await waitFor(() => {
        expect(api.forgotPassword).toHaveBeenCalledWith({ email: 'mulder@fbi.gov' });
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ENTER RESET CODE & NEW PASSWORD/i })).toBeInTheDocument();
        expect(screen.getAllByText(/mulder@fbi.gov/i)[0]).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/6-Digit Reset Code/i), { target: { value: '998877' } });
      fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'TheTruthIsOutThere2026!' } });
      fireEvent.click(screen.getByRole('button', { name: /RESET PASSWORD & SIGN IN/i }));

      await waitFor(() => {
        expect(api.resetPassword).toHaveBeenCalledWith({
          email: 'mulder@fbi.gov',
          otp: '998877',
          newPassword: 'TheTruthIsOutThere2026!',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
      });
    });
  });
});
