import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPIC_IDS } from './data/topics';
import { isValidTimeZone } from './lib/time';

// The CMS writes dates unquoted (2026-11-18), which YAML reads as a Date object.
const calendarDate = z
  .union([z.string(), z.date()])
  .transform((v) => (typeof v === 'string' ? v : v.toISOString().slice(0, 10)))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD, e.g. 2026-11-18'));

const clockTime = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Use 24-hour time, e.g. 16:00');

// Empty optional fields from the CMS arrive as "" or null; treat them as missing.
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
const optionalUrl = z.preprocess(blankToUndefined, z.url('Must be a full link starting with https://').optional());
const optionalText = z.preprocess(blankToUndefined, z.string().optional());

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string().min(3),
    type: z.enum(['workshop', 'seminar', 'talk', 'course']),
    date: calendarDate,
    start_time: clockTime,
    end_time: clockTime,
    timezone: z.string().refine(isValidTimeZone, 'Unknown time zone').default('Europe/Warsaw'),
    speakers: z.array(reference('people')).default([]),
    topics: z.array(z.enum(TOPIC_IDS)).default([]),
    tools: z.array(z.string()).default([]),
    level: z.preprocess(blankToUndefined, z.enum(['all', 'beginner', 'intermediate', 'advanced']).optional()),
    summary: z.string().min(10).max(320),
    platform: z.preprocess(blankToUndefined, z.enum(['google-meet', 'discord', 'other']).optional()),
    registration_url: optionalUrl,
    registration_note: optionalText,
    status: z.enum(['scheduled', 'cancelled', 'postponed']).default('scheduled'),
    recording_url: optionalUrl,
    slides_url: optionalUrl,
    code_url: optionalUrl,
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    draft: z.boolean().default(false),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    affiliation: optionalText,
    position: optionalText,
    team: z.boolean().default(false),
    team_role: optionalText,
    order: z.number().default(100),
    interests: z.array(z.string()).default([]),
    photo: optionalText,
    website: optionalUrl,
    github: optionalUrl,
    orcid: optionalUrl,
    bluesky: optionalUrl,
    linkedin: optionalUrl,
  }),
});

export const collections = { events, people };
