import rrule from "rrule";
const { RRule } = rrule;

const WEEKDAY_RRULE = [
  RRule.SU,
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
];

/**
 * Returns occurrence start times between rangeStart and rangeEnd (inclusive).
 * For non-recurring events, returns [startAt] if it falls in range.
 */
export function getOccurrencesInRange(event, rangeStart, rangeEnd) {
  const dtstart = new Date(event.startAt);
  const rec = event.recurrence;
  if (!rec || rec.type === "NONE") {
    return dtstart >= rangeStart && dtstart <= rangeEnd ? [dtstart] : [];
  }

  const interval = Math.max(1, rec.interval || 1);
  const until = rec.until ? new Date(rec.until) : null;

  let rule;
  if (rec.type === "DAILY") {
    rule = new RRule({
      freq: RRule.DAILY,
      interval,
      dtstart,
      until: until || undefined,
    });
  } else if (rec.type === "WEEKLY") {
    const days = Array.isArray(rec.weekdays) && rec.weekdays.length
      ? rec.weekdays
      : [dtstart.getDay()];
    const byweekday = [...new Set(days)].map((d) => WEEKDAY_RRULE[((d % 7) + 7) % 7]);
    rule = new RRule({
      freq: RRule.WEEKLY,
      interval,
      dtstart,
      until: until || undefined,
      byweekday,
    });
  } else if (rec.type === "MONTHLY") {
    rule = new RRule({
      freq: RRule.MONTHLY,
      interval,
      dtstart,
      until: until || undefined,
    });
  } else {
    return dtstart >= rangeStart && dtstart <= rangeEnd ? [dtstart] : [];
  }

  return rule.between(rangeStart, rangeEnd, true);
}
