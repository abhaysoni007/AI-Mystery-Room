import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AuthModal } from '../src/components/auth/AuthModal';
import * as api from '../src/services/api';

function ModalTestWrapper({ initialMode = 'login' }) {
  const { openAuthModal } = useAuth();
  React.useEffect(() => {
    openAuthModal(initialMode);
  }, [openAuthModal, initialMode]);

  return <AuthModal />;
}

describe('AuthModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders login tab by default with email and password fields', () => {
    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="login" />
      </AuthProvider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /DETECTIVE SIGN IN/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ACCESS DOSSIER/i })).toBeInTheDocument();
  });

  it('switches to create account tab and shows name field', () => {
    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="login" />
      </AuthProvider>
    );

    const signupTab = screen.getByRole('button', { name: /REGISTER/i });
    fireEvent.click(signupTab);

    expect(screen.getByRole('heading', { name: /CREATE INVESTIGATOR ACCOUNT/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Detective Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SEND VERIFICATION OTP/i })).toBeInTheDocument();
  });

  it('submitting signup advances to OTP verification screen', async () => {
    vi.spyOn(api, 'signup').mockResolvedValue({
      email: 'investigator@bakerst.com',
      name: 'Holmes',
    });

    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="signup" />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Detective Name/i), { target: { value: 'Holmes' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'investigator@bakerst.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'SecretPass123' } });

    fireEvent.click(screen.getByRole('button', { name: /SEND VERIFICATION OTP/i }));

    await waitFor(() => {
      expect(screen.getByText(/ENTER 6-DIGIT VERIFICATION CODE/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/investigator@bakerst.com/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CONFIRM & ACTIVATE ACCOUNT/i })).toBeInTheDocument();
  });

  it('submits 6-digit OTP code to verify and activate account', async () => {
    vi.spyOn(api, 'verifyOtp').mockResolvedValue({
      token: 'valid_jwt_token',
      user: { id: 'u_1', name: 'Holmes', email: 'investigator@bakerst.com', hasCompletedWalkthrough: false },
    });

    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="signup" />
      </AuthProvider>
    );

    // Simulate arriving at OTP screen
    vi.spyOn(api, 'signup').mockResolvedValue({ email: 'investigator@bakerst.com' });
    fireEvent.change(screen.getByLabelText(/Detective Name/i), { target: { value: 'Holmes' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'investigator@bakerst.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'SecretPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /SEND VERIFICATION OTP/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });

    const otpInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(otpInput, { target: { value: '884920' } });

    fireEvent.click(screen.getByRole('button', { name: /CONFIRM & ACTIVATE ACCOUNT/i }));

    await waitFor(() => {
      expect(api.verifyOtp).toHaveBeenCalledWith({
        email: 'investigator@bakerst.com',
        otp: '884920',
        purpose: 'signup',
      });
    });
  });

  it('switches to forgot password screen and requests reset code', async () => {
    vi.spyOn(api, 'forgotPassword').mockResolvedValue({ email: 'investigator@bakerst.com' });

    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="login" />
      </AuthProvider>
    );

    const forgotLink = screen.getByText(/Forgot password\?/i);
    fireEvent.click(forgotLink);

    expect(screen.getByRole('heading', { name: /RESET INVESTIGATOR PASSWORD/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Registered Email/i), { target: { value: 'investigator@bakerst.com' } });
    fireEvent.click(screen.getByRole('button', { name: /SEND RESET CODE/i }));

    await waitFor(() => {
      expect(screen.getByText(/ENTER RESET CODE & NEW PASSWORD/i)).toBeInTheDocument();
    });
  });
});
