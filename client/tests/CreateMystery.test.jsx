import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { InvestigationProvider } from '../src/context/InvestigationContext';
import { CreateMysteryPage } from '../src/pages/CreateMysteryPage';

describe('CreateMysteryPage Component', () => {
  it('validates minimum 20 characters before submission', async () => {
    render(
      <MemoryRouter>
        <InvestigationProvider>
          <CreateMysteryPage />
        </InvestigationProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /GENERATE MYSTERY/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please provide a scenario prompt/i)).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Scenario Premise/i);
    fireEvent.change(textarea, { target: { value: 'Too short' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Scenario description must be at least 20 characters/i)).toBeInTheDocument();
  });

  it('populates scenario when clicking a preset prompt seed', () => {
    render(
      <MemoryRouter>
        <InvestigationProvider>
          <CreateMysteryPage />
        </InvestigationProvider>
      </MemoryRouter>
    );

    const promptBtn = screen.getByText(/A museum curator disappears/i);
    fireEvent.click(promptBtn);

    const textarea = screen.getByLabelText(/Scenario Premise/i);
    expect(textarea.value).toContain('A museum curator disappears');
  });
});
