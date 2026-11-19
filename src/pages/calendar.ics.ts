import type { APIRoute } from 'astro';
import { getEvents } from '../lib/events';
import { buildCalendar } from '../lib/ics';
import { toIcsEvent } from '../lib/feed';

/** Subscribable feed with every published session, past and upcoming. */
export const GET: APIRoute = async ({ site }) => {
  const events = (await getEvents()).filter((e) => !e.data.example);
  const body = buildCalendar(
    'Open Lab Online',
    events.map((e) => toIcsEvent(e, site)),
  );
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
