// backend/src/services/notificationService.js
// Notification abstraction – delegates to the active adapter.
import admin from 'firebase-admin';
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

async function deleteBadTokens(badTokens){
  if (badTokens.length > 0) {
          await User.updateMany(
            { tokens: { $in: badTokens } },
            { $pull: { tokens: { $in: badTokens } } }
          );
        }
}

// ── public API ─────────────────────────────────────────────────────────────

export async function notifyEventCreated(event, recipientUserIds, tokens, meta) {
  const notification = buildNotification(
    "event_created",
    event,
    recipientUserIds,
    meta
  );

  const message = {
      tokens: tokens, // or use `tokens` or `topic`
      notification: {
      title: "Hello",
      body: "This is a test notification",
    },
  };
  
  if(tokens.length != 0){
    const response = await admin.messaging().sendEachForMulticast(message);

    response.responses.forEach((res, i) => {
      if (!res.success) {
        const badToken = tokens[i];

        deleteBadTokens(badToken);
      }
    });
  }

  return notification;
}

export async function notifyEventUpdated(event, recipientUserIds, tokens, meta) {
  const notification = buildNotification(
    "event_updated",
    event,
    recipientUserIds,
    meta
  );
  
  const message = {
      tokens: tokens, // or use `tokens` or `topic`
      notification: {
      title: "Hello",
      body: "This is a test notification",
    },
  };
  
  if(tokens.length != 0){
    const response = await admin.messaging().sendEachForMulticast(message);
  }

  return notification;
}

export async function notifyEventDeleted(event, recipientUserIds, tokens, meta) {
  const notification = buildNotification(
    "event_deleted",
    event,
    recipientUserIds,
    meta
  );
  
  const message = {
      tokens: tokens, // or use `tokens` or `topic`
      notification: {
      title: "Hello",
      body: "This is a test notification",
    },
  };
  
  if(tokens.length != 0){
    const response = await admin.messaging().sendEachForMulticast(message);
  }

  return notification;
}

export async function sendManualReminder(event, recipientUserIds, tokens, meta) {
  const notification = buildNotification(
    "reminder_manual",
    event,
    recipientUserIds,
    meta
  );
  const message = {
      tokens: tokens, // or use `tokens` or `topic`
      notification: {
      title: "Hello",
      body: "This is a test notification",
    },
  };
  
  if(tokens.length != 0){
    const response = await admin.messaging().sendEachForMulticast(message);
  }

  return notification;
}
