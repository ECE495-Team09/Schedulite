import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as client from './client.js';

const originalFetch = global.fetch;
const originalLocalStorage = global.localStorage;

function createFetchResponse({ ok, status = 200, json = {} }) {
  return {
    ok,
    status,
    statusText: status === 200 ? 'OK' : 'Bad Request',
    json: vi.fn().mockResolvedValue(json),
  };
}

describe('web api client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    let store = {};
    global.localStorage = {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
  });

  it('api attaches Bearer token header when token exists', async () => {
    global.localStorage.setItem('schedulite_token', 'test-token');
    global.fetch.mockResolvedValue(
      createFetchResponse({ ok: true, json: { ok: true } }),
    );

    await client.api('/me');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer test-token');
  });

  it('api throws error when response is not ok and prefers error message from body', async () => {
    global.fetch.mockResolvedValue(
      createFetchResponse({
        ok: false,
        status: 400,
        json: { error: 'Bad things happened' },
      }),
    );

    await expect(client.api('/oops')).rejects.toThrow('Bad things happened');
  });

  it('healthCheck returns true only when ok flag is true', async () => {
    global.fetch
      .mockResolvedValueOnce(
        createFetchResponse({ ok: true, json: { ok: true } }),
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: true, json: { ok: false } }),
      );

    const first = await client.healthCheck();
    const second = await client.healthCheck();

    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it('loginWithGoogle posts idToken payload via api helper', async () => {
    global.fetch.mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: { token: 'fake', user: { id: '123' } },
      }),
    );

    const result = await client.loginWithGoogle('id-token-xyz');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/auth');
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ idToken: 'id-token-xyz' }));
    expect(result).toEqual({ token: 'fake', user: { id: '123' } });
  });
});

