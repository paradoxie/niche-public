# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages, layouts, and route handlers.
- `src/components`: Reusable UI components and feature-specific widgets.
- `src/lib`: Shared utilities, server actions, schemas, and helpers.
- `src/db`: Drizzle ORM schema and database wiring.
- `src/i18n`: Locale JSON files and translation helpers.
- `drizzle`: Database migrations and Drizzle config artifacts.
- `public`: Static assets served at the site root.

## Build, Test, and Development Commands
- `npm run dev`: Start the Next.js dev server at `http://localhost:3000`.
- `npm run build`: Produce a production build.
- `npm run start`: Run the production build locally.
- `npm run lint`: Run ESLint with the project rules.
- `npm run pages:build`: Build the Cloudflare Pages output using `next-on-pages`.

## Coding Style & Naming Conventions
- Use TypeScript with React function components and hooks.
- Follow existing formatting: 2-space indentation, double quotes, and semicolons.
- Prefer Tailwind utility classes for styling; use the `cn` helper for class merging.
- Name components and files in `kebab-case` (e.g., `project-card.tsx`).
- Keep server actions and data helpers under `src/lib/actions` and `src/lib`.

## Testing Guidelines
- There is no dedicated test suite yet; rely on manual checks and linting.
- Before PRs, run `npm run lint` and smoke-test key pages in `npm run dev`.
- If you add tests, document the command here and keep them close to features.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes seen in history: `feat:`, `fix:`, or scoped forms like `feat(projects):`.
- Keep commit subjects short and action-oriented.
- PRs should include a concise summary, linked issues (if any), and screenshots for UI changes.
- Call out database schema or migration updates explicitly.

## Security & Configuration Notes
- Runtime configuration targets Cloudflare Pages/Workers; see `wrangler.toml` and `src/env.d.ts`.
- Never commit secrets; use environment bindings or local `.env` files when needed.
