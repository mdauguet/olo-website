/**
 * Date and time text for an event, as rendered at build time.
 *
 * The page shows these values in the event's own time zone so it reads
 * correctly without JavaScript. In the browser, src/scripts/site.ts replaces
 * every element marked data-t="…" with the visitor's local equivalent.
 */
import { formatIn, zoneLabel, WORLD_CLOCK } from './time';

export interface WhenText {
  weekday: string;
  wd: string;
  day: string;
  mon: string;
  month: string;
  year: string;
  time: string;
  range: string;
  zone: string;
  /** Short label after a time: the zone abbreviation at build, "your time" in the browser. */
  yourtime: string;
  zonephrase: string;
  date: string;
  /** "Wed 25 November" */
  dateshort: string;
  countdown: string;
}

const hm = (d: Date, tz: string) => formatIn(d, tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export function cityOf(tz: string): string {
  return (tz.split('/').pop() ?? tz).replace(/_/g, ' ');
}

/** "In 6 days", "Tomorrow", "Today", "Live now" or "Ended", counted in calendar days of `tz`. */
export function countdown(start: Date, end: Date, tz: string, now = new Date()): string {
  if (now >= end) return 'Ended';
  if (now >= start) return 'Live now';
  const ymd = (d: Date) => Date.parse(formatIn(d, tz, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-CA'));
  const days = Math.round((ymd(start) - ymd(now)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function whenText(start: Date, end: Date, tz: string): WhenText {
  const f = (o: Intl.DateTimeFormatOptions) => formatIn(start, tz, o);
  const weekday = f({ weekday: 'long' });
  const day = f({ day: 'numeric' });
  const month = f({ month: 'long' });
  const zone = zoneLabel(start, tz);
  return {
    weekday,
    wd: f({ weekday: 'short' }),
    day,
    mon: month.slice(0, 3).toUpperCase(),
    month,
    year: f({ year: 'numeric' }),
    time: hm(start, tz),
    range: `${hm(start, tz)}–${hm(end, tz)}`,
    zone,
    yourtime: zone,
    zonephrase: `${cityOf(tz)} time (${zone})`,
    date: `${weekday} ${day} ${month}`,
    dateshort: `${f({ weekday: 'short' })} ${day} ${month}`,
    countdown: countdown(start, end, tz),
  };
}

function partOfDay(time: string): string {
  if (time === '00:00') return 'midnight';
  const h = Number(time.slice(0, 2));
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 14) return 'midday';
  if (h < 18) return 'afternoon';
  if (h < 22) return 'evening';
  return 'night';
}

/** The same start time in a handful of cities, for the "Other time zones" panel. */
export function worldTimes(start: Date) {
  return WORLD_CLOCK.map(({ city, tz }) => {
    const time = hm(start, tz);
    return { city, time, note: `${formatIn(start, tz, { weekday: 'short' })} · ${partOfDay(time)}` };
  });
}
