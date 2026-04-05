// backend/src/services/notificationService.js
import admin from "firebase-admin";
import { Expo } from "expo-server-sdk";
import { User } from "../models/User.js";

const expo = new Expo();

/** iOS/Android: notification category with RSVP actions (must match client registration). */
export const EVENT_INVITE_CATEGORY = "EVENT_INVITE";

function buildBody(event) {
  const when = event.startAt
    ? new Date(event.startAt).toLocaleString()
    : "TBD";
  const where = event.location || "No location";
  return `${when} · ${where}`;
}

function buildNotification(type, event, recipientUserIds, meta) {
  return {
    type,
    eventId: event._id.toString(),
    groupId: event.groupId.toString(),
    body: buildBody(event),
    recipientUserIds: recipientUserIds.map(String),
    createdAt: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
}

export async function getTokensForUserIds(userIds) {
  if (!userIds?.length) return [];
  const ids = [...new Set(userIds.map((id) => id.toString()))];
  const users = await User.find({ _id: { $in: ids } }).select("tokens");
  return users.flatMap((u) => u.tokens || []);
}

async function removeInvalidTokensFromUsers(invalidTokens) {
  if (!invalidTokens.length) return;
  await User.updateMany(
    { tokens: { $in: invalidTokens } },
    { $pull: { tokens: { $in: invalidTokens } } }
  );
}

/**
 * Sends Expo push notifications. Returns tickets for inspection.
 */
async function sendExpoMessages(messages) {
  if (!messages.length) return [];
  const chunks = expo.chunkPushNotifications(messages);
  const allTickets = [];
  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      allTickets.push(...tickets);
      const invalid = [];
      tickets.forEach((ticket, i) => {
        if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
          invalid.push(chunk[i].to);
        }
      });
      await removeInvalidTokensFromUsers(invalid);
    } catch (err) {
      console.error("Expo sendPushNotificationsAsync error:", err);
    }
  }
  return allTickets;
}

function isExpoToken(token) {
  return typeof token === "string" && Expo.isExpoPushToken(token);
}

/**
 * Firebase Cloud Messaging (legacy device tokens from React Native Firebase, etc.)
 */
async function sendFcmMulticast(tokens, payload) {
  if (!tokens.length) return;
  const message = {
    tokens,
    notification: payload.notification,
    data: payload.data,
    apns: payload.apns,
    android: payload.android,
  };
  const response = await admin.messaging().sendEachForMulticast(message);
  const invalid = [];
  response.responses.forEach((res, i) => {
    if (!res.success && res.error?.code === "messaging/registration-token-not-registered") {
      invalid.push(tokens[i]);
    }
  });
  await removeInvalidTokensFromUsers(invalid);
}

function dataStrings(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) out[k] = String(v);
  }
  return out;
}

async function dispatchPushToTokens(tokens, { title, body, data, categoryId }) {
  const expoTokens = tokens.filter(isExpoToken);
  const fcmTokens = tokens.filter((t) => !isExpoToken(t));

  const payload = { ...data };
  if (payload.eventId) {
    payload.url = `schedulite://event/${String(payload.eventId)}`;
  }
  const strData = dataStrings(payload);

  if (expoTokens.length) {
    const messages = expoTokens.map((to) => ({
      to,
      sound: "default",
      title,
      body,
      data: strData,
      categoryId,
      channelId: "default",
    }));
    await sendExpoMessages(messages);
  }

  if (fcmTokens.length) {
    await sendFcmMulticast(fcmTokens, {
      notification: { title, body },
      data: strData,
      apns: {
        payload: {
          aps: {
            category: categoryId || EVENT_INVITE_CATEGORY,
          },
        },
      },
      android: {
        notification: {
          channelId: "default",
        },
      },
    });
  }
}

export async function notifyEventCreated(event, recipientUserIds) {
  const notification = buildNotification("event_created", event, recipientUserIds);
  const tokens = await getTokensForUserIds(recipientUserIds);
  const title = `New event: ${event.title}`;
  const body = buildBody(event);

  await dispatchPushToTokens(tokens, {
    title,
    body,
    categoryId: EVENT_INVITE_CATEGORY,
    data: {
      type: "EVENT_CREATED",
      eventId: event._id.toString(),
      groupId: event.groupId.toString(),
    },
  });

  return notification;
}

export async function notifyEventUpdated(event, recipientUserIds) {
  const notification = buildNotification("event_updated", event, recipientUserIds);
  const tokens = await getTokensForUserIds(recipientUserIds);
  await dispatchPushToTokens(tokens, {
    title: `Updated: ${event.title}`,
    body: buildBody(event),
    categoryId: EVENT_INVITE_CATEGORY,
    data: {
      type: "EVENT_UPDATED",
      eventId: event._id.toString(),
      groupId: event.groupId.toString(),
    },
  });
  return notification;
}

export async function notifyEventDeleted(event, recipientUserIds) {
  const notification = buildNotification("event_deleted", event, recipientUserIds);
  const tokens = await getTokensForUserIds(recipientUserIds);
  await dispatchPushToTokens(tokens, {
    title: `Cancelled: ${event.title}`,
    body: "This event was removed from the schedule.",
    data: {
      type: "EVENT_DELETED",
      eventId: event._id.toString(),
      groupId: event.groupId.toString(),
    },
  });
  return notification;
}

export async function sendManualReminder(event, recipientUserIds) {
  const notification = buildNotification("reminder_manual", event, recipientUserIds);
  const tokens = await getTokensForUserIds(recipientUserIds);
  await dispatchPushToTokens(tokens, {
    title: `Reminder: ${event.title}`,
    body: `Please RSVP. ${buildBody(event)}`,
    categoryId: EVENT_INVITE_CATEGORY,
    data: {
      type: "REMINDER_MANUAL",
      eventId: event._id.toString(),
      groupId: event.groupId.toString(),
    },
  });
  return notification;
}

export async function sendScheduledReminder(event, recipientUserIds, occurrenceStart, offsetMinutes) {
  const notification = buildNotification(
    "reminder_scheduled",
    event,
    recipientUserIds,
    { occurrenceStart: occurrenceStart.toISOString(), offsetMinutes }
  );
  const tokens = await getTokensForUserIds(recipientUserIds);
  const when = new Date(occurrenceStart).toLocaleString();
  await dispatchPushToTokens(tokens, {
    title: `Starting soon: ${event.title}`,
    body: offsetMinutes > 0
      ? `In ${offsetMinutes} min (${when})`
      : buildBody(event),
    categoryId: EVENT_INVITE_CATEGORY,
    data: {
      type: "REMINDER_SCHEDULED",
      eventId: event._id.toString(),
      groupId: event.groupId.toString(),
      occurrenceStart: occurrenceStart.toISOString(),
      offsetMinutes: String(offsetMinutes),
    },
  });
  return notification;
}
