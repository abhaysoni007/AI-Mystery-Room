import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { InvestigationProvider } from '../src/context/InvestigationContext';
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute';
import { LoginPage } from '../src/pages/LoginPage';
import { CreateMysteryPage } from '../src/pages/CreateMysteryPage';
import { DashboardPage } from '../src/pages/DashboardPage';
import * as api from '../src/services/api';

function renderGuardedApp(initialRoute = '/create') {
  return render(
    <AuthProvider>
      <InvestigationProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/create" element={<CreateMysteryPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </InvestigationProvider>
    </AuthProvider>
  );
}

describe('Route Guards & Authentication Enforcers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('blocks unauthenticated user from accessing /create and redirects to /login with clearance notice', async () => {
    renderGuardedApp('/create');

    // Should immediately land on /login
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /DETECTIVE SIGN IN/i })).toBeInTheDocument();
    });

    // Should display the clearance required notice
    expect(screen.getByText(/CLEARANCE REQUIRED: You must be signed in to access that restricted area/i)).toBeInTheDocument();

    // Verify /create content is NOT rendered
    expect(screen.queryByText(/BUILD A NEW INVESTIGATION/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /GENERATE MYSTERY/i })).not.toBeInTheDocument();
  });

  it('blocks unauthenticated user from accessing /dashboard and redirects to /login', async () => {
    renderGuardedApp('/dashboard');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /DETECTIVE SIGN IN/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/CLEARANCE REQUIRED: You must be signed in to access that restricted area/i)).toBeInTheDocument();
    expect(screen.queryByText(/CASE ARCHIVE & ACTIVE DOSSIERS/i)).not.toBeInTheDocument();
  });

  it('redirects user back to /create after signing in from guarded redirection', async () => {
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 'u_777',
      name: 'Sherlock',
      email: 'sherlock@bakerst.com',
      hasCompletedWalkthrough: true,
    });
    vi.spyOn(api, 'login').mockResolvedValue({
      token: 'valid_jwt_777',
      user: { id: 'u_777', name: 'Sherlock', email: 'sherlock@bakerst.com', hasCompletedWalkthrough: true },
    });

    renderGuardedApp('/create');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /DETECTIVE SIGN IN/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'sherlock@bakerst.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'BakerStPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /ACCESS DOSSIER/i }));

    // Upon login, user should be redirected right to /create
    await waitFor(() => {
      expect(screen.getByText(/BUILD A NEW INVESTIGATION/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /GENERATE MYSTERY/i })).toBeInTheDocument();
    });
  });

  it('allows authenticated user with valid token to access /create directly', async () => {
    localStorage.setItem('ai_mystery_token', 'valid_token_active');
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 'u_888',
      name: 'Inspector Dupin',
      email: 'dupin@agency.com',
      hasCompletedWalkthrough: true,
    });

    renderGuardedApp('/create');

    await waitFor(() => {
      expect(screen.getByText(/BUILD A NEW INVESTIGATION/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: /DETECTIVE SIGN IN/i })).not.toBeInTheDocument();
  });

  it('allows authenticated user to access /dashboard and shows detective name', async () => {
    localStorage.setItem('ai_mystery_token', 'valid_token_active');
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 'u_888',
      name: 'Inspector Dupin',
      email: 'dupin@agency.com',
      hasCompletedWalkthrough: true,
    });

    renderGuardedApp('/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/CASE ARCHIVE & ACTIVE DOSSIERS/i)).toBeInTheDocument();
      expect(screen.getByText(/DUPIN/i)).toBeInTheDocument();
    });
  });
});
