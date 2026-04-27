import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { send } from './consoleAdapter.js';

describe('consoleAdapter.send', () => {
  let logSpy;
  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('logs one entry per recipient and returns ok', () => {
    const notification = {
      type: 'TEST',
      eventId: 'e1',
      groupId: 'g1',
      body: 'hello',
      recipientUserIds: ['u1', 'u2'],
      createdAt: new Date().toISOString(),
    };

    const res = send(notification);

    expect(res).toEqual({ ok: true });
    expect(logSpy).toHaveBeenCalledTimes(2);

    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed).toMatchObject({
      _tag: 'NOTIFICATION',
      type: 'TEST',
      eventId: 'e1',
      recipientUserId: 'u1',
      body: 'hello',
    });
    expect(parsed.ts).toBeDefined();
  });

  it('returns ok and logs nothing when recipientUserIds is empty', () => {
    const res = send({
      type: 'X',
      eventId: 'e2',
      groupId: 'g2',
      body: '',
      recipientUserIds: [],
      createdAt: '',
    });
    expect(res).toEqual({ ok: true });
    expect(logSpy).toHaveBeenCalledTimes(0);
  });
});
