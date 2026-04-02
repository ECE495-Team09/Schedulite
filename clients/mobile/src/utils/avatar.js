const AVATAR_PALETTE = [
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#d1fae5', text: '#047857' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#e0f2fe', text: '#0369a1' },
  { bg: '#ede9fe', text: '#5b21b6' },
];

export function getAvatarColor(seed) {
  if (!seed || typeof seed !== 'string') seed = '?';
  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i);
  const index = Math.abs(n) % AVATAR_PALETTE.length;
  const { bg, text } = AVATAR_PALETTE[index];
  return { background: bg, color: text };
}
