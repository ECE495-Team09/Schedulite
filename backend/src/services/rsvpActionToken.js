import jwt from "jsonwebtoken";

const ACTION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function resolveSecret() {
  return process.env.RSVP_ACTION_SECRET || process.env.JWT_SECRET;
}

export function createRsvpActionToken({ userId, eventId, groupId }) {
  const secret = resolveSecret();
  if (!secret) {
    throw new Error("RSVP_ACTION_SECRET or JWT_SECRET must be configured");
  }
  return jwt.sign(
    {
      typ: "rsvp_action",
      uid: String(userId),
      eid: String(eventId),
      gid: String(groupId),
    },
    secret,
    { expiresIn: ACTION_TTL_SECONDS }
  );
}

export function verifyRsvpActionToken(token) {
  const secret = resolveSecret();
  if (!secret) {
    throw new Error("RSVP_ACTION_SECRET or JWT_SECRET must be configured");
  }
  return jwt.verify(token, secret);
}
