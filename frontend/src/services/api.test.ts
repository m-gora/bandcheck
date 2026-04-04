import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setAuthToken, api } from './api';

describe('setAuthToken', () => {
  it('accepts a token string without throwing', () => {
    expect(() => setAuthToken('test-token')).not.toThrow();
  });

  it('accepts null without throwing', () => {
    expect(() => setAuthToken(null)).not.toThrow();
  });
});

describe('api', () => {
  beforeEach(() => {
    setAuthToken(null);
    vi.restoreAllMocks();
  });

  it('getBands includes Authorization header when token is set', async () => {
    setAuthToken('my-token');

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ bands: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await api.getBands();

    const calledHeaders = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(calledHeaders['Authorization']).toBe('Bearer my-token');
  });

  it('getBands omits Authorization header when no token is set', async () => {
    setAuthToken(null);

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ bands: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await api.getBands();

    const calledHeaders = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(calledHeaders['Authorization']).toBeUndefined();
  });

  it('getBands appends search and genre query params', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ bands: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ bands: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await api.getBands('metallica', 'Metal');

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('search=metallica');
    expect(calledUrl).toContain('genre=Metal');
  });

  it('getBands throws on non-OK response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    );

    await expect(api.getBands()).rejects.toThrow('Failed to fetch bands: 404 Not Found');
  });
});
