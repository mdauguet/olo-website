import type { APIRoute } from 'astro';
import { getEvents, type OloEvent } from '../../lib/events';
import { buildCalendar } from '../../lib/ics';
import { toIcsEvent } from '../../lib/feed';

export async function getStaticPaths() {
  const events = (await getEvents()).filter((e) => !e.data.example);
  return events.map((event) => ({ params: { slug: event.id }, props: { event } }));
}

export const GET: APIRoute = ({ props, site }) => {
  const event = (props as { event: OloEvent }).event;
  const body = buildCalendar(event.data.title, [toIcsEvent(event, site)]);
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
