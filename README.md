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

Requires Node.js 20+ and either Docker or a PostgreSQL connection string.

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Configure the environment
cp .env.example .env
npx auth secret        # writes AUTH_SECRET into .env

# 3. Start PostgreSQL (skip if you already have one — just set DATABASE_URL)
docker compose up -d

# 4. Create the tables and load the seed data
npm run db:push
npm run db:seed

# 5. Run it
npm run dev            # http://localhost:3000
```

`npm run db:seed` creates the four courses, their categories, placeholder legal
pages, and an **admin account** using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
from `.env`. Change that password before deploying anywhere public.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build **+ TypeScript check** |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync the schema to the database (development) |
| `npm run db:migrate` | Create a versioned migration (use before deploying) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Load seed data |
| `npm run db:studio` | Browse the database in a GUI |
| `npm run db:reset` | Drop everything and re-seed |

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout: fonts, header, footer, metadata
│   ├── page.tsx              # Home page  ← built
│   ├── globals.css           # Design tokens (colors, type scale, animation)
│   ├── sitemap.ts            # Generated sitemap.xml      ← built
│   ├── robots.ts             # Generated robots.txt       ← built
│   ├── courses/
│   │   ├── page.tsx          # Catalog + filters          ← built
│   │   └── [slug]/page.tsx   # Course detail              ← built
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
    ├── site.ts               # Site name, nav, contact details, base URL
    └── courses.ts            # Public catalog queries + display helpers
```

## Branding

Everything visual is driven by tokens. To rebrand:

1. **Colors and typography** — `src/app/globals.css`, the `@theme` block at the top. Change `--color-brand-*` and `--color-accent-*`.
2. **Logo** — `src/components/logo.tsx`. Drop the logo file in `public/` and swap the placeholder `<span>` for a `next/image`.
3. **Name, contact details, nav** — `src/lib/site.ts`.

No component hardcodes a color or the company name.

## SEO

`sitemap.xml` and `robots.txt` are generated from the database at
`src/app/sitemap.ts` and `src/app/robots.ts`. Course pages carry `Course` and
`BreadcrumbList` JSON-LD; the catalog carries `ItemList`; the home page carries
`EducationalOrganization`.

**Set `NEXT_PUBLIC_SITE_URL` in every environment.** It is the base for
canonical links, OpenGraph tags and the sitemap. Next.js writes sitemap `<loc>`
values verbatim — `metadataBase` does not apply there — so a wrong value here
publishes a sitemap full of `localhost` URLs.

Filtered catalog views (`/courses?level=…`) are served `noindex, follow` and
canonicalise to `/courses`, so they do not compete with it in search results.

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

## Authentication

Auth.js v5 with email + password (bcrypt, cost 12) and JWT sessions.

- `src/auth.config.ts` — **edge-safe** config: route rules, JWT/session callbacks. No database, no bcrypt, because `proxy.ts` runs on the edge runtime.
- `src/auth.ts` — full config: Credentials provider, Prisma adapter. Node runtime only.
- `src/proxy.ts` — route protection (Next.js 16 renamed `middleware` to `proxy`).
- `src/lib/session.ts` — `requireUser()` / `requireRole()` for server-side checks.

**Authorization is checked twice on purpose.** `proxy.ts` blocks unauthenticated
navigation, and every protected page calls `requireRole()` again. The proxy does
not run for direct server-action invocations, so it can never be the only check.
When you add a server action that touches private data, call `requireRole()`
inside it.

An OAuth provider (Google, Microsoft) can be added without schema changes — the
`Account` table and the Prisma adapter are already in place.

### Not done yet

- **Email verification.** New accounts are created `ACTIVE`. Once transactional
  email is wired up, switch to `PENDING_VERIFICATION` in
  `src/lib/actions/auth.ts` and gate login on a verified address.
- **Password reset.** The `PasswordResetToken` table exists; the flow does not.
- **Rate limiting** on login and signup.

## Roadmap

- [x] Project scaffold, design tokens, header/footer
- [x] Home page
- [x] Prisma schema + PostgreSQL (full v1 domain model)
- [x] Auth.js with the three roles + route protection
- [x] Dashboard shells for student, instructor and admin
- [x] Courses catalog + course detail page
- [ ] Enrollment request flow + admin approval actions
- [ ] Contact form (validation + spam protection)
- [ ] Legal pages with real content
- [ ] Lesson player (PDF, YouTube, quizzes)
- [ ] Progress tracking + certificate generation with public verification
- [ ] Email verification, password reset, rate limiting
- [ ] Full admin CRUD (courses, modules, lessons, users)
- [ ] French / English i18n

## Contributing

Branch off `main`, one branch per feature (`feat/courses-catalog`), open a PR.
`npm run build` must pass before merging — it runs the TypeScript check.
