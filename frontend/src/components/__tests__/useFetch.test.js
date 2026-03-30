import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '../../hooks/useFetch';

describe('useFetch', () => {
  it('starts in loading state when immediate=true', () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'ok' });
    const { result } = renderHook(() => useFetch(fetchFn, []));
    expect(result.current.loading).toBe(true);
  });

  it('resolves data on success', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ count: 5 });
    const { result } = renderHook(() => useFetch(fetchFn, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ count: 5 });
    expect(result.current.error).toBeNull();
  });

  it('captures error message on failure', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('API down'));
    const { result } = renderHook(() => useFetch(fetchFn, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('API down');
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when immediate=false', () => {
    const fetchFn = vi.fn().mockResolvedValue({});
    renderHook(() => useFetch(fetchFn, [], { immediate: false }));
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('provides a working refetch function', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ n: 1 });
    const { result } = renderHook(() => useFetch(fetchFn, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchFn).toHaveBeenCalledTimes(1);

    result.current.refetch();
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));
  });
});