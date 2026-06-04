# AI Rules

## Tech Stack
- React 18 single-page application built with Vite 6.
- Source files live under `src/`; this codebase currently uses mostly `.jsx` files, with TypeScript available for new typed utilities when appropriate.
- Routing is handled with `react-router-dom` v6 in `src/App.jsx`; page components live in `src/pages/` and shared UI lives in `src/components/`.
- Styling is done with Tailwind CSS, with shared utility composition through `clsx`, `tailwind-merge`, and `class-variance-authority`.
- UI primitives come from the local shadcn/ui component set in `src/components/ui/`, backed by Radix UI packages.
- Icons should come from `lucide-react` unless a custom SVG is specifically required.
- Server/backend and auth/data access integrate through `@base44/sdk` in `src/api/base44Client.js`.
- Client server-state and async data caching should use `@tanstack/react-query` via the shared client in `src/lib/query-client.js`.
- Forms should use `react-hook-form` with `zod` validation for non-trivial user input.
- Charts, rich visualizations, and specialized UI should use installed libraries already present in the app, such as `recharts`, `framer-motion`, `react-leaflet`, or `react-markdown`, only when they directly fit the feature.

## Library and Code Rules
- Prefer existing shadcn/ui components from `src/components/ui/` for buttons, dialogs, forms, tabs, tables, toasts, and other common interface elements; do not edit shadcn/ui source files unless explicitly requested.
- Use Tailwind utility classes for layout, spacing, colors, responsive behavior, and state styling; avoid adding custom CSS unless Tailwind cannot express the requirement cleanly.
- Keep routes centralized in `src/App.jsx` and add new screens as page components under `src/pages/`.
- Put reusable feature components under `src/components/`, grouped by feature when useful, and keep page files focused on composition and data flow.
- Use the shared React Query client for remote data reads/mutations instead of ad-hoc global state for server data.
- Use Base44 client helpers for app data/auth interactions; do not introduce a second backend or database client unless the user explicitly requests it.
- Use `sonner` or the existing shadcn toaster components for user-facing notifications; keep notification style consistent with existing screens.
- Use `date-fns` for new date formatting/manipulation code; avoid adding new date libraries.
- Keep implementations small and maintainable: avoid unnecessary abstractions, placeholder code, and unused dependencies.
