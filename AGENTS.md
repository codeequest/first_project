<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nexa Academy — working rules

Read `README.md` for the product and `prisma/schema.prisma` for the domain.
This file is only the things that are easy to get wrong.

## Verify, don't recall

Next.js 16, React 19, Tailwind v4, Prisma 7, Auth.js v5 — all recent enough
that trained-in knowledge is often wrong. Before using an API you have not
already verified in this session, check `node_modules/next/dist/docs/` or the
installed source. Two that have already bitten us:

- `metadataBase` does **not** apply to `sitemap.ts`. Next writes each `url`
  into `<loc>` verbatim, so sitemap entries must be absolute.
- Next 16 renamed `middleware` to `proxy` (`src/proxy.ts`).

## Environment

- The Bash tool is **Git Bash (POSIX sh)**, not PowerShell. Use heredocs for
  multi-line strings; PowerShell here-strings (`@'…'@`) silently corrupt the
  input — they have landed a literal `@` in a commit subject before.
- Postgres runs in Docker on port **5433** (`docker compose up -d`).
- `npm run build` needs a reachable database, because pages are prerendered
  from it. Code that runs at build time should degrade rather than throw.

## Never do these without asking first

Three files cause most of our merge conflicts:

| File | Rule |
|---|---|
| `prisma/schema.prisma` | One owner at a time. Changes ship in their own PR, via `npm run db:migrate --name …` — never `db:push`. |
| `src/app/globals.css` | Only the design owner edits the `@theme` block. Everyone else uses the tokens. |
| `package.json` | Announce new dependencies before adding them. |

No hardcoded hex colours anywhere. No hardcoded company name — it lives in
`src/lib/site.ts`.

## Security

Every server action that touches private data must call `requireRole()` from
`src/lib/session.ts`. `src/proxy.ts` does not run for direct server-action
invocations, so it can never be the only check. This is a mandatory review
item on every PR.

## Track ownership

Work is split into vertical slices, not by layer. Stay inside your track's
folders; if a task needs another track's files, say so rather than editing
across the boundary.

| Track | Owns |
|---|---|
| A — Public site & SEO | `src/app/{courses,contact,legal}/`, `sitemap.ts`, `robots.ts` |
| B — Enrollment loop | `src/app/admin/enrollments/`, `src/lib/actions/enrollment.ts` |
| C — Learning experience | `src/app/dashboard/courses/` |
| D — Assessment & certificates | `src/app/dashboard/quiz/`, `src/app/verify/` |
| E — Admin back office | `src/app/admin/{courses,users}/` |
| F — Platform | `src/lib/email/`, `.github/` |

Shared: `src/components/`, `src/lib/site.ts`, the root layout. Touching those
affects everyone — call it out in the PR description.

## Definition of Done

- `npm run build` passes (includes the TypeScript check)
- Every protected data path calls `requireRole()`
- No hardcoded colours, no hardcoded company name
- Checked at mobile width, not just on a laptop
- The roadmap checkbox in `README.md` is ticked
- Reviewed and approved by one other person

Prefer small PRs (~400 lines). Branch names: `feat/courses-catalog`,
`fix/login-redirect`, `chore/ci-workflow`.

## Cheap habits

- Never grep `node_modules` without excluding sourcemaps (`--glob '!*.map'`) —
  a single `.map` hit will flood the context window.
- Verify a change by running the app and driving the route, not only by a
  green build. A type check will not catch wrong copy or a broken layout.
