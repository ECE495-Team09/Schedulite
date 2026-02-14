import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
// Backend base URL (no /api suffix; routes are /auth, /users)
export const API_BASE = extra.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
export const GOOGLE_WEB_CLIENT_ID = extra.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
