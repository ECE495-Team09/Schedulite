import { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';
import { registerPushToken, makeRSVP } from '../api/client';
import { navigationRef } from '../navigation/navigationRef';

/** Must match backend `EVENT_INVITE_CATEGORY` */
const EVENT_INVITE_CATEGORY = 'EVENT_INVITE';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureCategoryAndChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Events',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await Notifications.setNotificationCategoryAsync(EVENT_INVITE_CATEGORY, [
    {
      identifier: 'RSVP_IN',
      buttonTitle: 'Attending',
      options: { opensApp: true, isDestructive: false },
    },
    {
      identifier: 'RSVP_OUT',
      buttonTitle: 'Not attending',
      options: { opensApp: true, isDestructive: true },
    },
    {
      identifier: 'RSVP_MAYBE',
      buttonTitle: 'Maybe',
      options: { opensApp: true },
    },
  ]);
}

async function requestNativePushPermissions() {
  // Expo notifications permission prompt keeps behavior consistent with current UI flow.
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (Platform.OS === 'ios') {
    const auth = await messaging().requestPermission();
    const enabled =
      auth === messaging.AuthorizationStatus.AUTHORIZED ||
      auth === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return false;
  }
  return final === 'granted';
}

async function resolveFcmToken() {
  await messaging().registerDeviceForRemoteMessages();
  return messaging().getToken();
}

async function handleRsvpFromPayload(data, actionId) {
  const eventId = data?.eventId;
  if (!eventId) return;
  let status;
  if (actionId === 'RSVP_IN') status = 'In';
  else if (actionId === 'RSVP_OUT') status = 'Out';
  else if (actionId === 'RSVP_MAYBE') status = 'Maybe';
  else return;
  try {
    await makeRSVP(eventId, status, '');
  } catch (e) {
    Alert.alert('RSVP failed', e.message || 'Could not save your response.');
  }
}

function isDefaultNotificationOpen(actionId) {
  return (
    actionId === Notifications.DEFAULT_ACTION_IDENTIFIER ||
    actionId === 'DEFAULT' ||
    actionId === 'com.apple.UNNotificationDefaultActionIdentifier'
  );
}

function navigateToEventFromData(data) {
  const eventId = data?.eventId;
  if (!eventId) return;
  const id = String(eventId);
  let tries = 0;
  const go = () => {
    if (navigationRef.isReady()) {
      try {
        navigationRef.navigate('Event', { eventId: id });
      } catch (e) {
        console.warn('navigate Event:', e?.message || e);
      }
      return;
    }
    tries += 1;
    if (tries > 90) return;
    requestAnimationFrame(go);
  };
  go();
}

/**
 * Registers push token + notification category; RSVP actions; opens Event on tap.
 */
export function usePushNotifications(user) {
  const coldStartHandled = useRef(false);

  useEffect(() => {
    if (!user) {
      coldStartHandled.current = false;
      return;
    }

    let cancelled = false;

    async function register() {
      if (!Device.isDevice) return;
      try {
        await ensureCategoryAndChannel();
        const granted = await requestNativePushPermissions();
        if (!granted || cancelled) return;
        const token = await resolveFcmToken();
        if (cancelled || !token) return;
        await registerPushToken(token);
      } catch (e) {
        console.warn('Push registration:', e?.message || e);
      }
    }

    register();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return undefined;
    const sub = messaging().onTokenRefresh(async (token) => {
      try {
        if (token) await registerPushToken(token);
      } catch (e) {
        console.warn('Push token refresh:', e?.message || e);
      }
    });
    return sub;
  }, [user?.id]);

  useEffect(() => {
    if (!user) return undefined;

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const actionId = response.actionIdentifier;
      const data = response.notification.request.content.data || {};
      if (
        actionId === 'RSVP_IN' ||
        actionId === 'RSVP_OUT' ||
        actionId === 'RSVP_MAYBE'
      ) {
        handleRsvpFromPayload(data, actionId);
        return;
      }
      if (isDefaultNotificationOpen(actionId)) {
        navigateToEventFromData(data);
      }
    });

    return () => sub.remove();
  }, [user?.id]);

  useEffect(() => {
    if (!user || coldStartHandled.current) return;

    (async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        coldStartHandled.current = true;
        if (!response?.notification) return;
        const actionId = response.actionIdentifier;
        const data = response.notification.request.content.data || {};
        if (
          actionId === 'RSVP_IN' ||
          actionId === 'RSVP_OUT' ||
          actionId === 'RSVP_MAYBE'
        ) {
          await handleRsvpFromPayload(data, actionId);
          return;
        }
        if (isDefaultNotificationOpen(actionId)) {
          navigateToEventFromData(data);
        }
      } catch (e) {
        console.warn('getLastNotificationResponseAsync:', e?.message || e);
      }
    })();
  }, [user?.id]);
}
