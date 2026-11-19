/**
 * Small progressive enhancements. Every page works without them.
 *
 * 1. Local time: any element with data-when (plus data-start / data-end ISO
 *    instants) has its [data-t] children rewritten in the visitor's time zone.
 * 2. "Other time zones" toggles.
 * 3. Topic filter on the archive (also reads ?topic= from the URL).
 * 4. Close the "Add to calendar" menu when clicking elsewhere.
 */

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', o).format(d);
const hm = (d: Date) => fmt(d, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

function zoneName(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' }).formatToParts(d).find((p) => p.type === 'timeZoneName')?.value ?? '';
}

function countdown(start: Date, end: Date, now = new Date()): string {
  if (now >= end) return 'Ended';
  if (now >= start) return 'Live now';
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(start) - day(now)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function localTimes() {
  document.querySelectorAll<HTMLElement>('[data-when]').forEach((el) => {
    const start = new Date(el.dataset.start ?? '');
    const end = new Date(el.dataset.end ?? '');
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    const weekday = fmt(start, { weekday: 'long' });
    const day = fmt(start, { day: 'numeric' });
    const month = fmt(start, { month: 'long' });
    const zone = zoneName(start);
    const values: Record<string, string> = {
      weekday,
      wd: fmt(start, { weekday: 'short' }),
      day,
      mon: month.slice(0, 3).toUpperCase(),
      month,
      year: fmt(start, { year: 'numeric' }),
      time: hm(start),
      range: `${hm(start)}–${hm(end)}`,
      zone,
      yourtime: 'your time',
      zonephrase: `your time (${zone})`,
      date: `${weekday} ${day} ${month}`,
      dateshort: `${fmt(start, { weekday: 'short' })} ${day} ${month}`,
      countdown: countdown(start, end),
    };
    el.querySelectorAll<HTMLElement>('[data-t]').forEach((t) => {
      if (t.closest('[data-when]') !== el) return;
      const v = values[t.dataset.t ?? ''];
      if (v !== undefined) t.textContent = v;
    });
  });
}

function zoneToggles() {
  document.querySelectorAll<HTMLButtonElement>('[data-zones-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls') ?? '');
    if (!panel) return;
    const set = (open: boolean) => {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide other time zones' : 'Other time zones';
    };
    set(false);
    btn.hidden = false;
    btn.addEventListener('click', () => set(Boolean(panel.hidden)));
  });
}

function archiveFilter() {
  const group = document.querySelector<HTMLElement>('[data-filter]');
  if (!group) return;
  const chips = [...group.querySelectorAll<HTMLButtonElement>('button[data-topic]')];
  const rows = [...document.querySelectorAll<HTMLElement>('[data-topics]')];
  const count = document.querySelector<HTMLElement>('[data-count]');
  const empty = document.querySelector<HTMLElement>('[data-no-match]');
  const apply = (topic: string) => {
    let shown = 0;
    rows.forEach((r) => {
      const match = topic === 'all' || (r.dataset.topics ?? '').split(' ').includes(topic);
      r.hidden = !match;
      if (match) shown += 1;
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.topic === topic)));
    if (count) count.textContent = shown === 1 ? '1 session' : `${shown} sessions`;
    if (empty) empty.hidden = shown !== 0;
  };
  group.hidden = false;
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      const topic = c.dataset.topic ?? 'all';
      apply(topic);
      const url = new URL(location.href);
      if (topic === 'all') url.searchParams.delete('topic');
      else url.searchParams.set('topic', topic);
      history.replaceState(null, '', url);
    }),
  );
  const initial = new URL(location.href).searchParams.get('topic');
  apply(initial && chips.some((c) => c.dataset.topic === initial) ? initial : 'all');
}

function calendarMenus() {
  document.addEventListener('click', (e) => {
    document.querySelectorAll<HTMLDetailsElement>('details[data-menu][open]').forEach((d) => {
      if (!d.contains(e.target as Node)) d.open = false;
    });
  });
}

localTimes();
zoneToggles();
archiveFilter();
calendarMenus();
