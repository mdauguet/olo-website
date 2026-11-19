# Open Lab Online website

The website of [Open Lab Online](https://nenckiopenlab.org/): free, live online workshops and talks on open-source tools for neuroscience.

It is a static site built with [Astro](https://astro.build). Sessions and people are plain Markdown files, so the team can add a session without touching any code.

> **Demo.** This is a preview. A notice at the top of every page says so, and some links and texts are placeholders (see [What is still missing](#what-is-still-missing)).

## Add a session

Create a file in `src/content/events/`, named `YYYY-MM-DD-short-title.md`:

```markdown
---
title: From TTLs to DAQs – short intro to data synchronization
type: workshop            # workshop, seminar, talk or course
date: 2026-11-18
start_time: "16:00"       # as announced, in the time zone below
end_time: "17:00"
timezone: Europe/Warsaw   # any IANA zone; summer/winter time is handled for you
speakers:
  - mateusz-kostecki      # file name of a person in src/content/people/
topics:
  - synchronization       # see src/data/topics.ts
tools: [Arduino, Bonsai]
summary: "One or two sentences shown in lists and at the top of the page."
registration_url: https://forms.gle/…
# After the session, add any of these and they appear on the page and in the archive:
# recording_url: https://…
# slides_url: https://…
# code_url: https://…
---

Optional longer description in Markdown. Headings and numbered lists are styled.
```

The site works out everything else:

- **Time zones:** every visitor sees the time in their own time zone. The "Other time zones" panel lists a few cities.
- **Upcoming or past:** sessions that have ended move to the Archive at the next build. The site rebuilds every morning.
- **Calendars:** every session gets a `.ics` file and a Google Calendar link, and `/calendar.ics` is a feed people can subscribe to.

## Add a person

Create `src/content/people/first-last.md`:

```markdown
---
name: Nada El Mahmoudi
position: Postdoctoral researcher
affiliation: The Neuro (Montreal Neurological Institute), McGill University
team: true            # shows the person on the About page
order: 1              # position in the team list
interests: [Spatial cognition, Open science]
# photo: /images/uploads/nada.jpg   (put the file in public/images/uploads/)
# website, github, orcid, bluesky, linkedin: full https:// links
---

Short bio in the third person.
```

Without a photo, the profile shows initials on a coloured tile.

## Site-wide links

`src/data/site.json` holds the Discord, newsletter, proposal-form and contact links. Empty values show as `#` in the demo. Set `"demo": false` to remove the preview notice and allow search engines to index the site.

## Run it locally

Needs Node 22.12 or newer (see `.node-version`).

```sh
npm install
npm run dev       # http://localhost:4321
npm test          # time-zone tests
npm run build     # static site in dist/
```

## Publishing

Every push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`. The workflow sets the site address and sub-folder automatically. In the repository settings, set **Pages → Source** to **GitHub Actions**.

## What is still missing

- Discord, newsletter, session-proposal form and contact email (`src/data/site.json`)
- Bios and photos for the tutors, and team roles
- Code of conduct and privacy texts (outlines only)
- A content editor for the team (Sveltia CMS is planned) and a real domain

Design and development: Marin Dauguet.
