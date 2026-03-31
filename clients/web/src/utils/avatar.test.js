import { describe, it, expect } from 'vitest';
import { getAvatarColor } from './avatar.js';

describe('getAvatarColor', () => {
  it('returns the same color for the same seed', () => {
    const a = getAvatarColor('user-123');
    const b = getAvatarColor('user-123');
    expect(a).toEqual(b);
    expect(a.background).toBe(b.background);
    expect(a.color).toBe(b.color);
  });

  it('returns an object with background and color from the palette', () => {
    const result = getAvatarColor('alice');
    expect(result).toHaveProperty('background');
    expect(result).toHaveProperty('color');
    expect(typeof result.background).toBe('string');
    expect(typeof result.color).toBe('string');
    expect(result.background).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('uses different colors for different seeds', () => {
    const a = getAvatarColor('alice');
    const b = getAvatarColor('bob');
    expect(a.background).not.toBe(b.background);
  });

  it('handles empty string seed by defaulting to a valid palette color', () => {
    const result = getAvatarColor('');
    expect(result).toHaveProperty('background');
    expect(result).toHaveProperty('color');
  });

  it('handles non-string seed by defaulting (treats as "?")', () => {
    const result = getAvatarColor(null);
    expect(result).toHaveProperty('background');
    expect(result).toHaveProperty('color');
  });
});
