import type { OloEvent } from './events';
import type { IcsEvent } from './ics';
import { PLATFORMS } from '../data/topics';
import { absolute } from './paths';

/** Turn a site event into a calendar entry. `site` is the absolute site URL. */
export function toIcsEvent(e: OloEvent, site: URL | undefined): IcsEvent {
  const url = absolute(e.url, site);
  const platform = e.data.platform ? PLATFORMS[e.data.platform] : 'Online';
  const speakers = e.speakers.map((p) => p.data.name).join(', ');
  const status = e.data.status === 'cancelled' ? 'CANCELLED' : e.data.status === 'postponed' ? 'TENTATIVE' : 'CONFIRMED';
  const prefix = e.data.status === 'cancelled' ? '[Cancelled] ' : '';
  return {
    uid: `${e.id}@${new URL(url).host}`,
    start: e.start,
    end: e.end,
    title: `${prefix}${e.data.title} (Open Lab Online)`,
    description: [speakers && `With ${speakers}.`, e.data.summary, 'Joining details are sent after registration.']
      .filter(Boolean)
      .join('\n\n'),
    url,
    location: platform === 'Online' ? 'Online' : `${platform} (online)`,
    status,
  };
}
