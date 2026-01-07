# SafetyHub - Safety Traceability Demo

A fast MVP web app demonstrating traceability between Hazards → Safety Requirements → Verification Tests, plus a Gap Finder for safety consulting firms.

## Features

- **Dashboard**: KPI tiles and Gap Finder lists
- **Traceability**: Three-column drilldown UI showing Hazards → Requirements → Tests
- **Risk Calculation**: Automatic risk level computation (High/Medium/Low)
- **Gap Detection**: Identifies missing requirements, tests, and evidence links
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

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Vercel will automatically detect Next.js and configure the build
5. Click "Deploy"

That's it! Your app will be live in minutes.

Alternatively, use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
app/
  page.tsx              # Dashboard page
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

