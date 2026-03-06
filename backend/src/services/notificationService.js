// backend/src/services/notificationService.js
// Notification abstraction – delegates to the active adapter.

import * as consoleAdapter from "./adapters/consoleAdapter.js";

// The active adapter – swap this import when adding APNs / FCM.
const adapter = consoleAdapter;

// ── helpers ────────────────────────────────────────────────────────────────

function buildBody(event) {
  const when = event.startAt
    ? new Date(event.startAt).toLocaleString()
    : "TBD";
  const where = event.location || "No location";
  return `${event.title} — ${when} @ ${where}`;
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

// ── public API ─────────────────────────────────────────────────────────────

export function notifyEventCreated(event, recipientUserIds, meta) {
  const notification = buildNotification(
    "event_created",
    event,
    recipientUserIds,
    meta
  );
  return adapter.send(notification);
}

export function notifyEventUpdated(event, recipientUserIds, meta) {
  const notification = buildNotification(
    "event_updated",
    event,
    recipientUserIds,
    meta
  );
  return adapter.send(notification);
}

export function notifyEventDeleted(event, recipientUserIds, meta) {
  const notification = buildNotification(
    "event_deleted",
    event,
    recipientUserIds,
    meta
  );
  return adapter.send(notification);
}

export function sendManualReminder(event, recipientUserIds, meta) {
  const notification = buildNotification(
    "reminder_manual",
    event,
    recipientUserIds,
    meta
  );
  return adapter.send(notification);
}
