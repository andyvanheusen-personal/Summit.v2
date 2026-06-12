# Summit.v2 — Health Coach Portal (frontend)

React demo portal for health coaches supporting union members prescribed GLP-1
weight-loss medication as a benefit. Sibling project **`../Strata`** is the FastAPI
backend (separate repo); see the workspace `../CLAUDE.md` for how they connect.

## Commands

- **Dev server:** `npm run dev` (Vite; `--port 5180` was used for verification runs)
- **Build + typecheck:** `npm run build` (runs `tsc -b` first — use this to typecheck)
- **Login:** username `demo`, password `password` (mock auth, sessionStorage)
- **Backend proxy:** Vite proxies `/api` → `http://localhost:8000` (Strata)

## Stack

React 19 · TypeScript · Vite · **MUI v9** (@mui/material) · MUI X Charts/Date Pickers ·
react-router-dom v7 · dayjs. Playwright (devDependency) is used for browser
verification with `chromium.launch({ channel: 'chrome', headless: true })`.

## MUI v9 gotchas (cost real debugging time — follow these)

- **System props were removed** from `Stack`/`Typography`: `alignItems`, `justifyContent`,
  `flexWrap`, `fontWeight`, `textAlign` etc. are NOT props — put them in `sx`.
  (`direction` and `spacing` on Stack are still props.) `useFlexGap` is gone.
- `ListItemText`: `primaryTypographyProps`/`secondaryTypographyProps` were removed —
  use `slotProps={{ primary: {...}, secondary: {...} }}`.
- Theme `MuiButton` styleOverrides: variant keys like `containedPrimary` are gone;
  use `contained`.
- Charts: the line-chart area element class is `.MuiLineChart-area`
  (not `.MuiAreaElement-root`).
- `ListItem secondaryAction` only reserves ~48px (icon-button width). Wide chips/buttons
  there overlap long text — instead place the action as a flex child inside the row
  (`flexShrink: 0`) so text wraps beside it. This was fixed in three places already.
- Grid uses the `size={{ xs: 12, md: 6 }}` prop API.

## Architecture

- `src/data/mockData.ts` — ALL demo data. Deterministic (seeded mulberry32 PRNG),
  anchored to fixed `TODAY = 2026-06-12`. 12 members across 4 union locals, on
  Wegovy/Zepbound titration ladders. `Date.now()` is never used. When adding data,
  derive dates from `TODAY` so the demo stays stable.
- `src/types.ts` — domain types (Member, WeightGoal, InternalNote, Message, …).
  Mirror these as Pydantic models when porting domains to Strata.
- `src/context/` — mutable demo state lives in React contexts so every surface stays
  in sync: `MessagesContext` (inbox unread), `InternalNotesContext` (notes, unseen/
  notification state), `auth/AuthContext`. Sidebar badges, dashboard greeting counts
  and pages all read the same context — never duplicate counts from mockData.
- `src/pages/` — Dashboard (Today), Caseload, MemberProfile (tabs: Overview /
  Medication / Goals & Nutrition / Session notes / Internal notes), Inbox,
  InternalNotes (queue), CalendarPage, Reports. `src/components/` — Layout (sidebar
  shell), shared.tsx (avatars, chips, category colors), MemberInternalNotes.
- Theme in `src/theme.ts`: teal `#0E7C72` primary, coral `#F0653C` secondary, Inter font.

## Key product behaviors (decided with the user — don't regress)

- Inbox opens with NO thread selected; a thread is marked read only when clicked.
- Internal notes queue (`/internal-notes`) shows ONLY notes the signed-in coach
  (`CURRENT_STAFF_ID = 's-1'`) is **tagged in** — it's their action queue. Notes they
  author for others appear on the patient page, not their queue. Note creation
  happens only on the member profile's Internal notes tab.
- Notification model: sidebar badge + dashboard greeting count **unseen activity**
  (new tag or new comment on a tagged note). Viewing marks read; a read/unread toggle
  exists on queue rows and patient note cards; own replies never notify.
- Deep link: queue row → `/members/:id?tab=internal-notes&note=:noteId` (tab opens,
  note scrolls into view with a highlight ring).
- Active vs resolved internal notes must stay visually distinct (teal banner +
  left accent bar vs slate banner + greyed rows with Resolved chips).
- Weight-loss goal card: "lose N lbs by DATE", progress from start weight, pace
  status; editable via dialog with a pace warning above 2 lbs/week.

## Verification practice

Changes are verified in the running app: dev server on :5180, Playwright through
system Chrome, screenshots reviewed (including at 1280px width — overlap bugs showed
up there). Mock data is deterministic, so flows are scriptable.

## Roadmap

Replace mockData one domain at a time with Strata endpoints (members → messages →
internal notes → appointments/reports) via the `/api` proxy, ideally generating the
TS client from Strata's OpenAPI schema.
