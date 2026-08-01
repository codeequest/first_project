# Nexa Academy — IT Training Platform

An educational platform for IT certification training: **Power BI**, **Generative AI**, **PMP** and **Scrum Master**.

> ⚠️ Branding is a **placeholder**. Logo, name and colors are swapped in two files — see [Branding](#branding).

## Tech stack

| Layer | Choice |
|---|---|
| Language | **TypeScript** (front end + back end) |
| Framework | Next.js 16 (App Router, React Server Components) |
| UI | React 19 + Tailwind CSS v4 |
| Database | PostgreSQL + Prisma _(not wired up yet)_ |
| Auth | Auth.js — roles: `admin`, `instructor`, `student` _(not wired up yet)_ |
| i18n | next-intl — French + English _(not wired up yet)_ |
| Email | Resend _(not wired up yet)_ |

One language across the whole stack, so any collaborator can work on both the pages and the API.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

Other scripts:

```bash
npm run build     # production build + TypeScript check
npm run start     # serve the production build
npm run lint      # eslint
```

Requires Node.js 20 or newer.

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout: fonts, header, footer, metadata
│   ├── page.tsx              # Home page  ← built
│   ├── globals.css           # Design tokens (colors, type scale, animation)
│   ├── courses/
│   │   ├── page.tsx          # Catalog                    ← placeholder
│   │   └── [slug]/page.tsx   # Course detail              ← placeholder
│   ├── contact/page.tsx      # Contact form               ← placeholder
│   ├── legal/[slug]/page.tsx # Privacy / Terms / Cookies  ← placeholder
│   ├── login/page.tsx        # Login                      ← placeholder
│   └── signup/page.tsx       # Registration               ← placeholder
├── components/
│   ├── ui.tsx                # Container, ButtonLink, SectionHeading, Eyebrow
│   ├── site-header.tsx       # Sticky header + mobile menu
│   ├── site-footer.tsx       # Footer
│   ├── logo.tsx              # Placeholder logo
│   ├── course-card.tsx       # Course card
│   ├── reveal.tsx            # Scroll-reveal animation wrapper
│   └── coming-soon.tsx       # Temporary placeholder page body
└── lib/
    ├── site.ts               # Site name, nav, contact details
    └── courses.ts            # Seed course data (replaced by DB later)
```

## Branding

Everything visual is driven by tokens. To rebrand:

1. **Colors and typography** — `src/app/globals.css`, the `@theme` block at the top. Change `--color-brand-*` and `--color-accent-*`.
2. **Logo** — `src/components/logo.tsx`. Drop the logo file in `public/` and swap the placeholder `<span>` for a `next/image`.
3. **Name, contact details, nav** — `src/lib/site.ts`.

No component hardcodes a color or the company name.

## How enrollment works

Payment is handled **offline** — the platform does not process cards.

```
Student signs up
   → requests enrollment on a course (price + hours are displayed)
   → status: PENDING
   → admin approves in the dashboard
   → status: ACTIVE, course content unlocks
   → student completes lessons (PDF + YouTube video) and passes quizzes
   → status: COMPLETED, certificate issued with a verification code
```

## Roles

- **Student** — browse, request enrollment, consume content, take quizzes, earn certificates.
- **Instructor** — public profile, sees assigned courses and enrolled students, views quiz results. Does not upload content in v1.
- **Admin** — everything: users, courses, lessons, PDF uploads, YouTube links, quizzes, **enrollment approvals**, certificates, testimonials, contact inbox, legal pages.

## Roadmap

- [x] Project scaffold, design tokens, header/footer
- [x] Home page
- [ ] Courses catalog + course detail page
- [ ] Contact form (validation + spam protection)
- [ ] Legal pages with real content
- [ ] Prisma schema + PostgreSQL
- [ ] Auth.js with the three roles
- [ ] Student dashboard + lesson player (PDF, YouTube, quizzes)
- [ ] Progress tracking + certificate generation with public verification
- [ ] Admin dashboard + enrollment approval queue
- [ ] French / English i18n

## Contributing

Branch off `main`, one branch per feature (`feat/courses-catalog`), open a PR.
`npm run build` must pass before merging — it runs the TypeScript check.
