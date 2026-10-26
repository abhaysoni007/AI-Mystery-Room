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

  it('renders login tab by default with username and password fields', () => {
    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="login" />
      </AuthProvider>
    );

    expect(screen.getByText(/IDENTITY VERIFICATION/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Detective ID \/ Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ACCESS DOSSIER/i })).toBeInTheDocument();
  });

  it('switches to register tab and shows name and username fields', () => {
    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="login" />
      </AuthProvider>
    );

    const signupTab = screen.getByRole('button', { name: /^REGISTER$/i });
    fireEvent.click(signupTab);

    expect(screen.getByText(/NEW RECRUIT ENROLLMENT/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Detective Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Detective ID \/ Username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /REGISTER & ENTER BUREAU/i })).toBeInTheDocument();
  });

  it('submits login form and closes modal on success', async () => {
    vi.spyOn(api, 'login').mockResolvedValue({
      token: 'jwt_token_123',
      user: { id: 'u_1', name: 'Holmes', username: 'holmes_221b' },
    });

    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="login" />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Detective ID \/ Username/i), { target: { value: 'holmes_221b' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'SecretPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /ACCESS DOSSIER/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        username: 'holmes_221b',
        password: 'SecretPass123',
      });
    });
  });

  it('submits registration form and closes modal on success', async () => {
    vi.spyOn(api, 'signup').mockResolvedValue({
      token: 'jwt_token_456',
      user: { id: 'u_2', name: 'Watson', username: 'watson_doc' },
    });

    render(
      <AuthProvider>
        <ModalTestWrapper initialMode="signup" />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Detective Name/i), { target: { value: 'Watson' } });
    fireEvent.change(screen.getByLabelText(/Detective ID \/ Username/i), { target: { value: 'watson_doc' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'DoctorSecret123' } });
    fireEvent.click(screen.getByRole('button', { name: /REGISTER & ENTER BUREAU/i }));

    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith({
        name: 'Watson',
        username: 'watson_doc',
        password: 'DoctorSecret123',
      });
    });
  });
});
