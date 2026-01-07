# SafetyHub - Safety Traceability Demo

A fast MVP web app demonstrating traceability between Hazards → Safety Requirements → Verification Tests, plus a Gap Finder for safety consulting firms.

## Features

- **Dashboard**: KPI tiles and Gap Finder lists with navigation to all pages
- **Hazards Page**: Table view with filters (Risk, Status, Search), detail panel, and "Link requirements" modal
- **Requirements Page**: Coverage view with "Covered/Not covered" badges, filter for uncovered requirements, and "Link tests" modal
- **Tests Page**: Evidence hygiene tracking with "Missing evidence" filter and detail view
- **Status Report Page**: Printable client-ready report with KPIs, coverage summary, gaps, and high-risk hazards
- **Traceability**: Three-column drilldown UI showing Hazards → Requirements → Tests
- **Risk Calculation**: Automatic risk level computation (High/Medium/Low)
- **Gap Detection**: Identifies missing requirements, tests, and evidence links
- **Interactive Linking**: Multi-select modals to link hazards to requirements and requirements to tests
- **Local Storage**: Data persists across page refreshes

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage for data persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```



## Project Structure

```
app/
  page.tsx              # Dashboard page
  hazards/
    page.tsx            # Hazards table view with filters and linking
  requirements/
    page.tsx            # Requirements coverage view with linking
  tests/
    page.tsx            # Tests evidence hygiene view
  status-report/
    page.tsx            # Printable status report
  traceability/
    page.tsx            # Traceability drilldown page
  layout.tsx            # Root layout
  globals.css           # Global styles
lib/
  utils.ts              # Utility functions (risk calculation, etc.)
  storage.ts            # localStorage helpers
  demoData.ts           # Seeded demo data
types/
  index.ts              # TypeScript type definitions
```

## Pages Overview

### Dashboard (`/`)
- KPI tiles showing key metrics
- Gap Finder lists (top 5 each)
- Navigation cards to all pages
- Reset demo data button

### Hazards (`/hazards`)
- Filterable table view with Risk, Status, and Search filters
- Detail panel with full hazard information
- "Link requirements" modal for creating relationships
- Jump to Traceability link

### Requirements (`/requirements`)
- Coverage view with "Covered/Not covered" badges
- Filter to show only uncovered requirements
- Detail panel showing linked hazards and tests
- "Link tests" modal for creating relationships

### Tests (`/tests`)
- Evidence hygiene tracking
- Filter to show tests missing evidence
- Detail panel with evidence links and linked requirements

### Status Report (`/status-report`)
- Client-ready printable report format
- KPIs, coverage summary, top gaps, and high-risk hazards
- Print button for generating PDFs

### Traceability (`/traceability`)
- Three-column drilldown interface
- Select hazard → see requirements → see tests
- Real-time counts and risk calculations

## Demo Data

The app comes pre-seeded with demo data for "UAV Flight Control System (Demo)" including:
- 6 Hazards (with at least 2 High risk)
- 10 Requirements
- 8 Tests
- Intentional gaps for demonstration purposes

Use the "Reset Demo Data" button on the Dashboard to restore the original seeded data.

## Notes

- No authentication required
- Single hardcoded project
- Data stored in browser localStorage
- No database setup needed
- Linking modals allow creating relationships between hazards, requirements, and tests
- All changes persist automatically to localStorage
- Status Report is optimized for printing (hides navigation when printing)

