/**
 * Internal links must include the base path, because the demo is served from
 * a sub-folder on GitHub Pages (https://user.github.io/repo/).
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a site path ("/events/") with the base path. External links pass through. */
export function href(path: string): string {
  if (/^(https?:|mailto:|webcal:|#)/.test(path)) return path;
  return BASE + (path.startsWith('/') ? path : `/${path}`);
}

/** Absolute URL for feeds and share links. */
export function absolute(path: string, site: URL | undefined): string {
  return new URL(href(path), site ?? 'http://localhost:4321').toString();
}

/** A configured link, or "#" while the demo still has a placeholder. */
export function linkOr(url: string | undefined): string {
  return url && url.trim() ? url : '#';
}
