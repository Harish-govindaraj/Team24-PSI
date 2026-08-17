import { authenticatedFetch } from './apiClient';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('apiClient', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('injects JWT header when token is present', async () => {
    localStorage.setItem('jwt_token', 'test.jwt.token');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { fake: 'data' } })
    });

    await authenticatedFetch('http://localhost:8080/api/test', { method: 'GET' });

    const fetchArgs = global.fetch.mock.calls[0][1];
    const headers = new Headers(fetchArgs.headers);

    expect(headers.get('Authorization')).toBe('Bearer test.jwt.token');
  });

  it('does not inject JWT header when token is absent', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { fake: 'data' } })
    });

    await authenticatedFetch('http://localhost:8080/api/test', { method: 'GET' });

    const fetchArgs = global.fetch.mock.calls[0][1];
    const headers = new Headers(fetchArgs.headers);

    expect(headers.has('Authorization')).toBe(false);
  });

  it('handles 401 Unauthorized by clearing token, emitting event, and throwing', async () => {
    localStorage.setItem('jwt_token', 'expired.token');

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    await expect(authenticatedFetch('http://localhost:8080/api/test', { method: 'GET' }))
      .rejects.toThrow('Authentication expired or invalid. Please log in again.');

    expect(localStorage.getItem('jwt_token')).toBeNull();

    // Check if auth:unauthorized event was dispatched
    const eventArg = dispatchEventSpy.mock.calls[0][0];
    expect(eventArg.type).toBe('auth:unauthorized');
  });

  it('handles 403 Forbidden without logging out', async () => {
    localStorage.setItem('jwt_token', 'valid.token');

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403
    });

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    await expect(authenticatedFetch('http://localhost:8080/api/test', { method: 'GET' }))
      .rejects.toThrow('Access denied. You do not have permission to access this resource.');

    // Token remains intact
    expect(localStorage.getItem('jwt_token')).toBe('valid.token');

    // auth:unauthorized is not dispatched
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });
});
