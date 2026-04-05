import cron from "node-cron";
import { Event } from "../models/Event.js";
import { Group } from "../models/Group.js";
import { getOccurrencesInRange } from "../utils/occurrences.js";
import { sendScheduledReminder } from "../services/notificationService.js";

const WINDOW_MS = 90 * 1000;
const LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const LOOKAHEAD_MS = 62 * 24 * 60 * 60 * 1000;

function sameOccurrence(a, b) {
  return Math.abs(a.getTime() - b.getTime()) < 1000;
}

function alreadySent(event, occurrenceStart, offsetMinutes) {
  return (event.reminderDeliveries || []).some(
    (d) =>
      d.offsetMinutes === offsetMinutes &&
      sameOccurrence(new Date(d.occurrenceStart), occurrenceStart)
  );
}

async function tick() {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - LOOKBACK_MS);
  const rangeEnd = new Date(now.getTime() + LOOKAHEAD_MS);

  const events = await Event.find({ status: "ACTIVE" }).limit(500);
  for (const event of events) {
    const offsets = Array.isArray(event.reminderOffsetsMinutes) && event.reminderOffsetsMinutes.length
      ? event.reminderOffsetsMinutes
      : [1440];

    let occurrences;
    try {
      occurrences = getOccurrencesInRange(event, rangeStart, rangeEnd);
    } catch (e) {
      console.error("Occurrence compute error for event", event._id, e);
      continue;
    }

    for (const occ of occurrences) {
      if (occ.getTime() < now.getTime() - 60 * 1000) continue;

      for (const offset of offsets) {
        const fireAt = new Date(occ.getTime() - offset * 60 * 1000);
        if (fireAt > now) continue;
        if (now.getTime() - fireAt > WINDOW_MS) continue;
        if (alreadySent(event, occ, offset)) continue;

        const group = await Group.findById(event.groupId).select("members");
        if (!group) continue;
        const recipientIds = group.members.map((m) => m.userId.toString());

        try {
          await sendScheduledReminder(event, recipientIds, occ, offset);
          const delivery = {
            occurrenceStart: occ,
            offsetMinutes: offset,
            sentAt: new Date(),
          };
          await Event.updateOne(
            { _id: event._id },
            { $push: { reminderDeliveries: delivery } }
          );
          if (!event.reminderDeliveries) event.reminderDeliveries = [];
          event.reminderDeliveries.push(delivery);
        } catch (err) {
          console.error("Scheduled reminder send failed:", err);
        }
      }
    }
  }
}

export function startReminderScheduler() {
  cron.schedule("* * * * *", () => {
    tick().catch((err) => console.error("reminderScheduler tick:", err));
  });
  console.log("Reminder scheduler: cron every minute");
}
