import { getCollection, type CollectionEntry } from 'astro:content';
import type { OloEvent } from './events';
import { TOPICS, type TopicId } from '../data/topics';

export type Person = CollectionEntry<'people'>;

export async function getPeople(): Promise<Person[]> {
  return getCollection('people');
}

export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function surname(name: string): string {
  return name.split(/\s+/).slice(-1)[0] ?? name;
}

const TILES = [
  { bg: '#E4F2F8', circle: '#A0CFE6' },
  { bg: '#F4E4EA', circle: '#E2C3CF' },
  { bg: '#D8EFEE', circle: '#9FD8D6' },
];

/** A stable tint for a person's initials tile, so the same person always gets the same colour. */
export function tileFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TILES[h % TILES.length];
}

export function sessionsFor(personId: string, events: OloEvent[]): OloEvent[] {
  return events.filter((e) => e.speakers.some((s) => s.id === personId));
}

export function topicsOf(events: OloEvent[]): { id: TopicId; label: string }[] {
  const ids = [...new Set(events.flatMap((e) => e.data.topics))];
  return ids.map((id) => ({ id, label: TOPICS[id] }));
}

export function toolsOf(events: OloEvent[]): string[] {
  return [...new Set(events.flatMap((e) => e.data.tools))];
}

export function roleLine(p: Person): string {
  return [p.data.position, p.data.affiliation].filter(Boolean).join(', ');
}
