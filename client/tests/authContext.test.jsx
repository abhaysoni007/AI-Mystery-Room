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
      <button onClick={() => login({ username: 'sherlock_221b', password: 'Pass123' })}>Login</button>
      <button onClick={() => signup({ name: 'Holmes', username: 'holmes_detective', password: 'Pass123' })}>Signup</button>
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
      user: { id: 'u_1', name: 'Sherlock Holmes', username: 'sherlock_221b', hasCompletedWalkthrough: true },
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

  it('triggers walkthrough for newly signed up users where hasCompletedWalkthrough is false', async () => {
    vi.spyOn(api, 'signup').mockResolvedValue({
      token: 'mock_jwt_token',
      user: { id: 'u_2', name: 'Holmes', username: 'holmes_detective', hasCompletedWalkthrough: false },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Signup').click();
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
