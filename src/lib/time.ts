/**
 * Time-zone helpers.
 *
 * Editors enter an event the way it is announced ("16:00 in Warsaw"), as a
 * calendar date, a wall-clock time and an IANA time zone. Everything else
 * (UTC instants, calendar files, "your time" on the page) is derived here,
 * so summer/winter time is never typed by hand.
 */

/** True if `tz` is an IANA time zone the runtime knows (e.g. "Europe/Warsaw"). */
export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Offset of `tz` from UTC at instant `ts`, in milliseconds (e.g. +3_600_000 for CET). */
function offsetMs(ts: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ts));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - ts;
}

/**
 * Convert a wall-clock time in `tz` to a UTC Date.
 * `date` is "YYYY-MM-DD", `time` is "HH:MM" or "HH:MM:SS".
 */
export function zonedTimeToUtc(date: string, time: string, tz: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  // Two passes handle the hour around a DST switch.
  const first = offsetMs(naive - offsetMs(naive, tz), tz);
  return new Date(naive - first);
}

/** Start and end instants of an event; an end time before the start means it runs past midnight. */
export function eventInterval(date: string, start: string, end: string, tz: string): { start: Date; end: Date } {
  const s = zonedTimeToUtc(date, start, tz);
  let e = zonedTimeToUtc(date, end, tz);
  if (e.getTime() <= s.getTime()) e = new Date(e.getTime() + 24 * 3600 * 1000);
  return { start: s, end: e };
}

/** Normalise "16:00:00" or "16:00" to "16:00". */
export function hhmm(time: string): string {
  return time.slice(0, 5);
}

/** Format an instant in a given zone. Used for the no-JavaScript fallback and the "elsewhere" table. */
export function formatIn(date: Date, tz: string, opts: Intl.DateTimeFormatOptions, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts }).format(date);
}

/** Short zone label such as "CET" or "GMT-5" for an instant. */
export function zoneLabel(date: Date, tz: string): string {
  const part = new Intl.DateTimeFormat('en-GB', { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? tz;
}

/** Calendar-day difference between the event's zone and another zone at the same instant (-1, 0 or +1). */
export function dayShift(date: Date, fromTz: string, toTz: string): number {
  const ymd = (tz: string) => formatIn(date, tz, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-CA');
  const a = Date.parse(ymd(fromTz));
  const b = Date.parse(ymd(toTz));
  return Math.round((b - a) / 86_400_000);
}

/** Cities shown in the "same moment elsewhere" table on event pages. */
export const WORLD_CLOCK: { city: string; tz: string }[] = [
  { city: 'Montréal', tz: 'America/Toronto' },
  { city: 'São Paulo', tz: 'America/Sao_Paulo' },
  { city: 'Warsaw', tz: 'Europe/Warsaw' },
  { city: 'Nairobi', tz: 'Africa/Nairobi' },
  { city: 'Delhi', tz: 'Asia/Kolkata' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' },
];
