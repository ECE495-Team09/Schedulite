const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('schedulite_token');
}

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  const data = await res.json().catch(() => ({}));
  return res.ok && data?.ok;
}

export async function loginWithGoogle(idToken) {
  return api('/auth', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

// ── User ──────────────────────────────────────────────────────────────────
export async function getMe() {
  return api('/me');
}

export async function updateMe(fields) {
  return api('/me/me', {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}

export async function deleteMe() {
  return api('/me/me', { method: 'DELETE' });
}

// ── Groups (read) ─────────────────────────────────────────────────────────
export async function createGroup(name) {
  return api('/api/createGroups', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function joinGroup(joinCode) {
  return api('/api/joinGroups', {
    method: 'POST',
    body: JSON.stringify({ joinCode }),
  });
}

export async function getGroups() {
  return api('/api/getGroups', {
    method: 'GET',
  })
}

export async function getSingleGroup(groupId) {
  return api('/api/getSingleGroup?groupId=' + groupId, {
    method: 'GET',
  })
}

// ── Events ────────────────────────────────────────────────────────────────
export async function getEvents() {
  return api('/getEvents');
}

export async function createEvent({ groupId, title, startAt, location, description }) {
  return api('/api/createEvent', {
    method: 'POST',
    body: JSON.stringify({ groupId, title, startAt, location, description }),
  });
}

export async function updateEvent(eventId, fields) {
  return api(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}

export async function deleteEvent(eventId) {
  return api(`/api/events/${eventId}`, {
    method: 'DELETE',
  });
}

export async function updateGroupMemberRole(groupId, targetUserId, role) {
  return api(`/api/groups/${groupId}/members/${targetUserId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function kickGroupMember(groupId, targetUserId) {
  return api(`/api/groups/${groupId}/members/${targetUserId}`, {
    method: 'DELETE',
  });
}