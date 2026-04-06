import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'schedulite_token';
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || res.statusText || 'Request failed');
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
  return api('/api/getGroups');
}

export async function getSingleGroup(groupId) {
  return api(`/api/getSingleGroup?groupId=${encodeURIComponent(groupId)}`);
}

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

export async function registerPushToken(pushToken) {
  return api('/me/push-token', {
    method: 'POST',
    body: JSON.stringify({ pushToken }),
  });
}

export async function makeRSVP(eventId, status, note) {
  return api(`/api/eventRSVP/${eventId}/rsvp`, {
    method: 'POST',
    body: JSON.stringify({ status, note: note ?? '' }),
  });
}

export async function setStoredToken(token) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}
