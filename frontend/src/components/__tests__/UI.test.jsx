import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingSpinner, ErrorMessage, PageHeader, StatCard } from '../UI';

describe('LoadingSpinner', () => {
  it('renders default label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('LOADING...')).toBeTruthy();
  });

  it('renders custom label', () => {
    render(<LoadingSpinner label="SCANNING..." />);
    expect(screen.getByText('SCANNING...')).toBeTruthy();
  });
});

describe('ErrorMessage', () => {
  it('renders the error message text', () => {
    render(<ErrorMessage message="Connection failed" />);
    expect(screen.getByText('Connection failed')).toBeTruthy();
  });

  it('calls onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Err" onRetry={onRetry} />);
    fireEvent.click(screen.getByText(/retry/i));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is absent', () => {
    render(<ErrorMessage message="Err" />);
    expect(screen.queryByText(/retry/i)).toBeNull();
  });
});

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="APOD" />);
    expect(screen.getByText(/APOD/)).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="X" subtitle="Daily image" />);
    expect(screen.getByText('Daily image')).toBeTruthy();
  });

  it('renders badge when provided', () => {
    render(<PageHeader title="TEST" badge="LIVE" />);
    expect(screen.getByText('LIVE')).toBeTruthy();
  });
});

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="TOTAL" value={42} />);
    expect(screen.getByText('TOTAL')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders sub text when provided', () => {
    render(<StatCard label="X" value="Y" sub="YYYY-MM-DD" />);
    expect(screen.getByText('YYYY-MM-DD')).toBeTruthy();
  });

  it('does not render sub when absent', () => {
    render(<StatCard label="X" value="Y" />);
    expect(screen.queryByText('YYYY-MM-DD')).toBeNull();
  });
});