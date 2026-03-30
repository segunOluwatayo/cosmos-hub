import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIPanel from '../AIPanel';

describe('AIPanel', () => {
  it('renders in idle state by default', () => {
    render(<AIPanel fetchFn={async () => ({})} resultKey="analysis" />);
    expect(screen.getByRole('button', { name: /REQUEST/i })).toBeTruthy();
    expect(screen.getByText(/press request/i)).toBeTruthy();
  });

  it('displays result on successful fetch', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ analysis: 'A stellar nursery.' });
    render(<AIPanel fetchFn={fetchFn} resultKey="analysis" />);

    fireEvent.click(screen.getByRole('button', { name: /REQUEST/i }));
    await waitFor(() => expect(screen.getByText('A stellar nursery.')).toBeTruthy());
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('displays error message on failed fetch', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<AIPanel fetchFn={fetchFn} resultKey="analysis" />);

    fireEvent.click(screen.getByRole('button', { name: /REQUEST/i }));
    await waitFor(() => expect(screen.getByText(/Network error/i)).toBeTruthy());
  });

  it('shows RESET button after successful result', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ analysis: 'Stars.' });
    render(<AIPanel fetchFn={fetchFn} resultKey="analysis" />);

    fireEvent.click(screen.getByRole('button', { name: /REQUEST/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /RESET/i })).toBeTruthy());
  });

  it('resets to idle when RESET is clicked', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ analysis: 'Stars.' });
    render(<AIPanel fetchFn={fetchFn} resultKey="analysis" />);

    fireEvent.click(screen.getByRole('button', { name: /REQUEST/i }));
    await waitFor(() => screen.getByRole('button', { name: /RESET/i }));
    fireEvent.click(screen.getByRole('button', { name: /RESET/i }));
    expect(screen.getByText(/press request/i)).toBeTruthy();
  });
});