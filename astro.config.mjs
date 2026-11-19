import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH are set by the GitHub Pages workflow
// (e.g. https://user.github.io and /repo-name). Locally the site runs at the root.
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // GitHub Pages lets browsers cache pages for 10 minutes. With separate,
    // hashed stylesheets, a page cached before a deploy asks for a CSS file
    // the deploy removed and shows up unstyled. Inlining the CSS makes every
    // page self-contained. (Fonts keep the same file names between deploys.)
    inlineStylesheets: 'always',
  },
});
