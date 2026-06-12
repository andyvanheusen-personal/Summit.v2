# Summit — Health Coach Portal

A demo coach-facing portal for a GLP-1 weight-loss benefit program offered to union member
employees. Built with React 19, TypeScript, Vite, MUI (Material UI) v9, and MUI X Charts.

## Running

```bash
npm install
npm run dev
```

Then open the printed local URL and sign in with the demo credentials:

- **Username:** `demo`
- **Password:** `password`

## Features

- **Login** — mock authentication with demo credentials
- **Today dashboard** — caseload KPIs, severity-ranked alert triage (side effects → missed
  doses → engagement lapses), prioritized task queue, today's sessions
- **Caseload** — searchable/filterable member panel with phase, medication, weight loss,
  goal progress, adherence, and at-risk flags
- **Member profile**
  - Weight-loss goal card (e.g. "Lose 40 lbs by Aug 14") with progress from start
    weight toward goal, pace status, and an edit dialog with target-date picker
  - Weight trend chart from captured scale readings with goal reference line
  - Medication tab: titration ladder, weekly dose adherence log, side-effect history with
    one-click escalation to clinician
  - Goals & nutrition tab: SMART goals, GLP-1 protein/muscle-preservation guidance
  - Session notes tab: SOAP-format notes with sign-and-lock workflow
- **Inbox** — threaded secure messaging with unread states and quick replies
- **Calendar** — weekly session view with completed/no-show tracking
- **Reports** — caseload outcomes plus de-identified union benefit-fund cohort summary

All data is deterministic mock data (12 members across 4 union locals) generated in
`src/data/mockData.ts`, anchored to a fixed demo date of June 12, 2026.
