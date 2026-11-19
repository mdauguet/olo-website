import { getCollection, getEntries, type CollectionEntry } from 'astro:content';
import { eventInterval } from './time';
import { TOPICS, EVENT_TYPES, type TopicId } from '../data/topics';
import site from '../data/site.json';

export type EventEntry = CollectionEntry<'events'>;
export type PersonEntry = CollectionEntry<'people'>;

export interface OloEvent {
  id: string;
  url: string;
  entry: EventEntry;
  data: EventEntry['data'];
  start: Date;
  end: Date;
  /** Ended at build time. The page script re-checks in the browser. */
  isPast: boolean;
  typeLabel: string;
  mainTopic?: TopicId;
  topicLabel?: string;
  speakers: PersonEntry[];
}

const showDrafts = import.meta.env.DEV;

export async function getEvents(): Promise<OloEvent[]> {
  const entries = await getCollection(
    'events',
    (e) => (showDrafts || !e.data.draft) && (site.demo || !e.data.example),
  );
  const now = Date.now();
  const events = await Promise.all(
    entries.map(async (entry) => {
      const d = entry.data;
      const { start, end } = eventInterval(d.date, d.start_time, d.end_time, d.timezone);
      const speakers = d.speakers.length ? await getEntries(d.speakers) : [];
      const mainTopic = d.topics[0];
      return {
        id: entry.id,
        url: `/events/${entry.id}/`,
        entry,
        data: d,
        start,
        end,
        isPast: end.getTime() < now,
        typeLabel: EVENT_TYPES[d.type],
        mainTopic,
        topicLabel: mainTopic ? TOPICS[mainTopic] : undefined,
        speakers: speakers.filter(Boolean) as PersonEntry[],
      } satisfies OloEvent;
    }),
  );
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function getUpcomingAndPast() {
  const all = await getEvents();
  return {
    all,
    upcoming: all.filter((e) => !e.isPast),
    past: all.filter((e) => e.isPast).reverse(),
  };
}

export function speakerLine(e: OloEvent): string {
  return e.speakers
    .map((p) => (p.data.affiliation ? `${p.data.name}, ${p.data.affiliation}` : p.data.name))
    .join(' · ');
}
