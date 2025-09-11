# Frontend AGENT Guide

## Commands
- install: `npm install`
- lint: `npm run lint`
- test: `npm test`

## Tools & Libraries
- React + TypeScript via Vite
- Tailwind CSS for styling and layout
- Recharts for data visualization
- React Router for navigation
- Vitest + React Testing Library for unit tests
- TanStack Query for data fetching
- TanStack Table for tables and grouping
- react-hook-form + zod for forms and validation
- date-fns for date handling
- PapaParse for CSV export
- jsPDF + html2canvas for PDF export
- lucide-react for icons

## Style Standards
- **Colors**: soft pastel palette
  - Sidebar & accents: `bg-blue-600` / `hover:bg-blue-500`
  - Backgrounds: `bg-pink-100`
  - Charts: pink `#f9a8d4`, blue `#60a5fa`
  - Alerts: `text-red-600`
- **Fonts**: Tailwind `font-sans` stack (Inter / system UI)
- Prefer a minimalist layout with generous whitespace and subtle shadows

## Page Guidelines
- Reuse existing card and chart components when possible.
- Keep components modular and colocate tests with source files.
- Ensure responsiveness: sidebar collapses on mobile; layouts adjust via Tailwind breakpoints.
- Run lint and tests before committing changes.
- Place new pages in `src/pages` and add matching links in the sidebar.

