# Next.js Boilerplate

An opinionated Next.js web template with batteries included: authentication flow
with deduplicated token refresh, optimistic route guards, dark mode without FOUC,
a complete UI kit, testing set up, and linting that enforces conventions instead
of just documenting them.

It is the web companion of [boilerplate-api](https://github.com/eroque55/boilerplate-api)
(NestJS) and speaks its contract out of the box: JWT access tokens, rotating
refresh tokens and RFC 9457 error responses.

## Stack

|                                    |                                                                   |
| ---------------------------------- | ----------------------------------------------------------------- |
| **Next.js 16.4** · React 19.2      | App Router, Cache Components, Partial Prefetching, React Compiler |
| **TypeScript 6**                   | Strict mode + typed routes                                        |
| **Tailwind CSS 4**                 | CSS-first config with the palette shared with JS                  |
| **TanStack Query 5**               | Server state + typed query keys                                   |
| **Zustand 5**                      | Client state                                                      |
| **React Hook Form** + **Zod 4**    | Forms and validation, pt-BR error messages                        |
| **Axios**                          | HTTP client with automatic 401 refresh deduplication              |
| **Vitest 5** + **Testing Library** | Unit and component testing                                        |

## Get started

1. Start [boilerplate-api](https://github.com/eroque55/boilerplate-api)
   (`yarn db:up && yarn db:migrate && yarn db:seed && yarn dev`). It listens on
   `http://localhost:3333` and its `.env.example` already allows this origin in
   `CORS_ORIGINS`.

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Start the development server:

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and sign in with the
   API's `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## First things to change

1. Replace `changeme` in `package.json` (`name`) and `src/constants/app.ts`
   (`APP_NAME`, `APP_DESCRIPTION`). Cookie and `localStorage` keys derive from
   `APP_NAME` automatically via `src/constants/storageKeys.ts`.
2. Point `NEXT_PUBLIC_API_URL` at your deployed API, including the `/v1`
   prefix.

## Project structure

```
assets/
  icons/            SVG icons + typed IconName registry
src/
  app/              Routes (Next.js App Router)
    page.tsx        Root route — a dispatcher, never a screen
    (auth)/         Unauthenticated routes (/login)
    (main)/         Authenticated shell + routes (/home)
  components/
    ui/             UI kit (Button, Input, Checkbox, Switch, Tab, Shimmer, DefaultModal, …)
    layout/         App chrome (AppHeader, ClientOnly, Providers)
    screens/        Screen implementations mirroring src/app/
  constants/        App metadata, routes, storage keys, typed query keys
  contexts/         AuthContext
  hooks/
    api/            Server calls (React Query)
    common/         Reusable hooks (useDebounce, useDisableDelay, useTheme, …)
  services/         Axios HTTP client, API layer, SSR-safe QueryClient
  store/            Zustand stores (defaultModalStore)
  test/             Test helpers (renderWithProviders)
  theme/            colors.ts and global.css
  types/            Domain and API types
  utils/            Pure helpers (format, masks, validators, cookies, session, handleError)
  validation/       Zod pt-BR config and form schemas
  env.ts            Environment variable validation
  proxy.ts          Optimistic session route guard
@types/             Ambient declarations and TanStack Query module augmentation
```

## What's included

**Authentication** — `AuthContext` + `session.ts` + `services/http.ts` talk to
the API's `/auth/login`, `/auth/refresh`, `/auth/logout` and `/users/me`.
"Manter-me conectado" decides whether the session cookies survive closing the
browser. Concurrent `401` responses share a single in-flight refresh promise so
rotating refresh tokens never get invalidated by parallel requests, and logout
revokes the refresh token on the server before clearing the cookies.

**Route guards & caching** — `src/proxy.ts` redirects unauthenticated visitors
away from private routes (preserving `?redirect=…`) and authenticated users away
from `/login`. Next.js 16.4 `cacheComponents` and `partialPrefetching` keep
layouts statically prerendered while `<ClientOnly>` cleanly mounts
session-dependent screens.

**Error handling** — every failed mutation passes through `handleError`, which
reads the pt-BR `detail` of the API's RFC 9457 Problem Details and surfaces it
in the global `DefaultModal`. `getFieldErrors` maps a `422`'s
`errors[].pointer` to form field names for `setError`.

**Theme & Dark Mode** — `src/theme/colors.ts` is the single color source of
truth, shared between TypeScript and Tailwind CSS 4 via `@config`. A tiny inline
script in `app/layout.tsx` applies `.dark` before first paint (zero FOUC), paired
with `useTheme()` (`useSyncExternalStore`).

## Conventions

**Enforced by ESLint** (these fail the lint, they are not suggestions):

- Import `Image` from `@/components/ui`, never from `next/image`
- Import `z` from `@/validation/zod`, never from `zod` — the local instance is configured with pt-BR messages
- Import `render` / `renderWithProviders` from `@/test/utils`, never `render` from `@testing-library/react`
- No relative imports deeper than two levels; use the `@/` alias
- No circular dependencies (`import-x/no-cycle`)
- Imports and JSX props are grouped and alphabetized automatically

**By agreement:**

- Code, comments, tests, and docs in English. Portuguese only for strings the user reads.
- Components live in `Component/index.tsx`, with sub-components in nested folders.
- Prefer `type` over `interface`.

## Testing

Tests live next to the code they cover: `validators.ts` → `validators.test.ts`,
`Button/index.tsx` → `Button/index.test.tsx`.

```bash
yarn test              # run once
yarn test:watch        # watch mode
yarn test:coverage     # V8 coverage report in coverage/
```

### Writing a component test

Use `renderWithProviders` from `@/test/utils`, which wraps the component in a
fresh `QueryClientProvider` per test and re-exports everything from Testing
Library:

```tsx
import { vi } from 'vitest';

import { fireEvent, renderWithProviders, screen } from '@/test/utils';

it('calls onClick when clicked', () => {
  const onClick = vi.fn();
  renderWithProviders(<Button text="Enviar" onClick={onClick} />);

  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

  expect(onClick).toHaveBeenCalledTimes(1);
});
```

## Useful commands

```bash
yarn dev            # start Next.js dev server
yarn build          # build for production
yarn typecheck      # next typegen && tsc --noEmit
yarn lint           # ESLint (0 warnings)
yarn lint:fix       # ESLint with --fix
yarn format         # Prettier over the whole project
```

## Contributing

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) in
English, enforced by a commitlint hook and CI. See
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Author

Built and maintained by **Eduardo Roque** — [@eroque55](https://github.com/eroque55).
