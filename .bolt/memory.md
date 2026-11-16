# Project memory

## Product intent & audience

- Personal portfolio website for an individual who is a Deni Avdija fan and NBA follower.
- Features: social links, photo gallery, weekly NBA highlights section, dedicated Deni Avdija videos section.
- Audience: friends, visitors, and fellow basketball fans.

## Brand personality & voice

- Personal, casual, and authentic tone — not corporate.
- Site content/copy is in English (e.g. gallery caption about girlfriend "Ilay" and Thailand trip).
- The user communicates in Hebrew; implementation responses should be in Hebrew, but the site itself uses English copy.

## Visual design & UX direction

- Vite + React + Tailwind CSS + Lucide React icons (per `.bolt/prompt`).
- `@/` path alias maps to `src/`.
- Photo gallery displays personal trip photos with a descriptive heading; expects real images wired correctly (no placeholder/duplicate files).
- Design goal: beautiful, production-worthy, non-cookie-cutter (per `.bolt/prompt`).

## Decisions, constraints & rationale

- Gallery updated to six specific Thailand trip images: `IMG_8127.JPEG`, `Screenshot_2026-11-14_at_19.21.33.png`, `101.JPEG`, `125.JPEG`, `281.JPEG`, `GPTempDownload.JPG`.
- Removed duplicate `copy` image files that were causing incorrect references.
- Gallery heading explicitly references girlfriend "Ilay" and their Thailand trip.
- NBA highlights are refreshed weekly; Deni Avdija has a dedicated video section.

## Open questions & assumptions

- Exact source/structure of NBA highlights and Deni Avdija videos (embedded YouTube? API? manual links?) not yet confirmed.
- Whether site copy should remain English or eventually support Hebrew is assumed English for now.
- Image file organization/folders may still be inconsistent — gallery references should be verified after any asset changes.