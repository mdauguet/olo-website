/**
 * The fixed list of topics. Each topic has its own illustration (see Glyph.astro).
 *
 * To add a topic: add it here, add a glyph in src/components/Glyph.astro,
 * and add the same value to the `topics` field in public/admin/config.yml.
 */
export const TOPICS = {
  'behavioural-setups': 'Behavioural setups',
  'closed-loop': 'Closed-loop experiments',
  'behaviour-classification': 'Behaviour classification',
  imaging: 'Imaging & segmentation',
  synchronization: 'Device synchronization',
  'data-analysis': 'Data analysis',
  visualisation: 'Visualisation & presentation',
  hardware: 'Electronics & hardware',
} as const;

export type TopicId = keyof typeof TOPICS;
export const TOPIC_IDS = Object.keys(TOPICS) as [TopicId, ...TopicId[]];

export const EVENT_TYPES = {
  workshop: 'Workshop',
  seminar: 'Seminar',
  talk: 'Talk',
  course: 'Course',
} as const;
export type EventType = keyof typeof EVENT_TYPES;

export const PLATFORMS = {
  'google-meet': 'Google Meet',
  discord: 'Discord',
  other: 'Online',
} as const;
