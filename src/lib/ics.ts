/**
 * Minimal iCalendar (RFC 5545) writer for event feeds.
 * Times are written in UTC so every calendar app converts them correctly.
 */

export interface IcsEvent {
  uid: string;
  start: Date;
  end: Date;
  title: string;
  description: string;
  url: string;
  location: string;
  status?: 'CONFIRMED' | 'CANCELLED' | 'TENTATIVE';
}

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const escapeText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold lines longer than 75 octets, as the spec requires. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = '';
  let currentLen = 0;
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (currentLen + len > limit) {
      out.push(current);
      current = '';
      currentLen = 0;
    }
    current += ch;
    currentLen += len;
  }
  out.push(current);
  return out.join('\r\n ');
}

export function buildCalendar(name: string, events: IcsEvent[], now = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Lab Online//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
  ];
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${utcStamp(e.start)}`,
      `DTEND:${utcStamp(e.end)}`,
      `SUMMARY:${escapeText(e.title)}`,
      `DESCRIPTION:${escapeText(e.description)}`,
      `LOCATION:${escapeText(e.location)}`,
      `URL:${e.url}`,
      `STATUS:${e.status ?? 'CONFIRMED'}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Link that opens Google Calendar's "add event" screen pre-filled. */
export function googleCalendarUrl(e: Omit<IcsEvent, 'uid'>): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${utcStamp(e.start)}/${utcStamp(e.end)}`,
    details: `${e.description}\n\n${e.url}`,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
