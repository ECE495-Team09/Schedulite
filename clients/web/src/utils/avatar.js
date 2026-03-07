/**
 * Small palette for default avatar backgrounds (deterministic from a string seed).
 * Same seed always returns the same color.
 */
const AVATAR_PALETTE = [
  { bg: '#e0e7ff', text: '#4338ca' },   // indigo
  { bg: '#d1fae5', text: '#047857' },   // emerald
  { bg: '#fef3c7', text: '#b45309' },   // amber
  { bg: '#fce7f3', text: '#be185d' },   // pink
  { bg: '#e0f2fe', text: '#0369a1' },   // sky
  { bg: '#ede9fe', text: '#5b21b6' },   // violet
];

/**
 * Returns a consistent { background, color } from the palette based on seed (e.g. userId or name).
 * @param {string} seed - Any string (userId, email, name) to derive the color from
 * @returns {{ background: string, color: string }}
 */
export function getAvatarColor(seed) {
  if (!seed || typeof seed !== 'string') seed = '?';
  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i);
  const index = Math.abs(n) % AVATAR_PALETTE.length;
  const { bg, text } = AVATAR_PALETTE[index];
  return { background: bg, color: text };
}
