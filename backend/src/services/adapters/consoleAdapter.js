// backend/src/services/adapters/consoleAdapter.js
// Dummy adapter – prints structured notification logs to stdout.

/**
 * @param {{ type: string, eventId: string, groupId: string, body: string, recipientUserIds: string[], createdAt: string }} notification
 * @returns {{ ok: boolean, details?: any }}
 */
export function send(notification) {
  const { type, eventId, body, recipientUserIds } = notification;

  for (const uid of recipientUserIds) {
    console.log(
      JSON.stringify({
        _tag: "NOTIFICATION",
        type,
        eventId,
        recipientUserId: uid,
        body,
        ts: new Date().toISOString(),
      })
    );
  }

  return { ok: true };
}
