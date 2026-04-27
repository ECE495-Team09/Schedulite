import { describe, it, expect } from 'vitest';
import { getOccurrencesInRange } from './occurrences.js';

describe('getOccurrencesInRange - non-recurring', () => {
  it('returns the start date when inside range', () => {
    const startAt = new Date('2026-04-27T01:32:00.000Z');
    const event = { startAt: startAt.toISOString(), recurrence: { type: 'NONE' } };

    const rangeStart = new Date('2026-04-27T00:00:00.000Z');
    const rangeEnd = new Date('2026-04-28T00:00:00.000Z');

    const occ = getOccurrencesInRange(event, rangeStart, rangeEnd);
    expect(occ.length).toBe(1);
    expect(occ[0].toISOString()).toBe(startAt.toISOString());
  });

  it('returns empty array when start is outside range', () => {
    const startAt = new Date('2026-05-01T01:32:00.000Z');
    const event = { startAt: startAt.toISOString(), recurrence: { type: 'NONE' } };
    const rangeStart = new Date('2026-04-27T00:00:00.000Z');
    const rangeEnd = new Date('2026-04-28T00:00:00.000Z');

    const occ = getOccurrencesInRange(event, rangeStart, rangeEnd);
    expect(Array.isArray(occ)).toBe(true);
    expect(occ.length).toBe(0);
  });
});
