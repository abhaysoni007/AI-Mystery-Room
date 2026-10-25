import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import * as api from '../src/services/api';

function TestConsumer() {
  const {
    user,
    isAuthenticated,
    login,
    signup,
    verifyOtp,
    logout,
    isWalkthroughOpen,
    openWalkthrough,
    closeWalkthrough,
    completeWalkthrough,
  } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'}</div>
      <div data-testid="user-name">{user ? user.name : 'NO_USER'}</div>
      <div data-testid="tour-status">{isWalkthroughOpen ? 'TOUR_OPEN' : 'TOUR_CLOSED'}</div>
      <button onClick={() => login({ email: 'test@agency.com', password: 'Pass123' })}>Login</button>
      <button onClick={() => signup({ name: 'Holmes', email: 'holmes@agency.com', password: 'Pass123' })}>Signup</button>
      <button onClick={() => verifyOtp({ email: 'holmes@agency.com', otp: '123456', purpose: 'signup' })}>Verify</button>
      <button onClick={logout}>Logout</button>
      <button onClick={openWalkthrough}>OpenTour</button>
      <button onClick={closeWalkthrough}>CloseTour</button>
      <button onClick={completeWalkthrough}>CompleteTour</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes as logged out when no token is present', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_OUT');
    expect(screen.getByTestId('user-name').textContent).toBe('NO_USER');
    expect(screen.getByTestId('tour-status').textContent).toBe('TOUR_CLOSED');
  });

  it('logs in successfully and updates user state', async () => {
    vi.spyOn(api, 'login').mockResolvedValue({
      token: 'mock_jwt_token',
      user: { id: 'u_1', name: 'Sherlock Holmes', email: 'test@agency.com', hasCompletedWalkthrough: true },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_IN');
    expect(screen.getByTestId('user-name').textContent).toBe('Sherlock Holmes');
    expect(localStorage.getItem('ai_mystery_token')).toBe('mock_jwt_token');
  });

  it('triggers walkthrough for newly verified users where hasCompletedWalkthrough is false', async () => {
    vi.spyOn(api, 'verifyOtp').mockResolvedValue({
      token: 'mock_jwt_token',
      user: { id: 'u_2', name: 'New Detective', email: 'holmes@agency.com', hasCompletedWalkthrough: false },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Verify').click();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_IN');
    expect(screen.getByTestId('tour-status').textContent).toBe('TOUR_OPEN');
  });

  it('opens and completes walkthrough', async () => {
    vi.spyOn(api, 'updateWalkthrough').mockResolvedValue({
      user: { id: 'u_1', name: 'Test', hasCompletedWalkthrough: true },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('OpenTour').click();
    });
    expect(screen.getByTestId('tour-status').textContent).toBe('TOUR_OPEN');

    await act(async () => {
      screen.getByText('CompleteTour').click();
    });
    expect(screen.getByTestId('tour-status').textContent).toBe('TOUR_CLOSED');
  });

  it('clears state on logout', async () => {
    vi.spyOn(api, 'login').mockResolvedValue({
      token: 'mock_jwt_token',
      user: { id: 'u_1', name: 'Sherlock', hasCompletedWalkthrough: true },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });
    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_IN');

    act(() => {
      screen.getByText('Logout').click();
    });
    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_OUT');
    expect(localStorage.getItem('ai_mystery_token')).toBeNull();
  });
});
