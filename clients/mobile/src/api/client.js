import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

const TOKEN_KEY = 'schedulite_token';

async function getToken() {
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
  return api('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function getMe() {
  return api('/users/me');
}
