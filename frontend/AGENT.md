# BakeMate Front-End Agent Guide

> **Mission:** Ship a polished, SSR-first web app that lets bakers run their bakeries with zero friction—orders, quotes, recipe costing, and inventory in one buttery‑smooth UI.

---

## 1. Tech Stack at a Glance

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js (React + TypeScript) | Server‑side rendering for fast first paint, great SEO, and cookie‑based sessions |
| **Styling** | Tailwind CSS + shadcn/ui | Utility‑first speed plus accessible Radix primitives |
| **State / Data** | Zustand + SWR (bundled inside generated hooks) | Tiny, uncomplicated, and RSC‑friendly |
| **API Client** | openapi‑typescript‑codegen | Generates fully‑typed SDK straight from `openapi.json` |
| **Auth** | Cookie JWT (`bm_session`, HttpOnly, SameSite=Lax) | Works perfectly with SSR & Nginx |
| **Testing** | Jest + React Testing Library + Playwright | Unit/Component/E2E coverage |
| **CI / CD** | GitHub Actions → Docker → GHCR → Nginx | Single‑command prod deploys |

---

## 2. Directory Structure

```text
bakemate/
└─ frontend/
   ├─ AGENT.md           ← you are here
   ├─ src/
   │  ├─ api/            ← generated SDK & typed hooks
   │  ├─ components/     ← shared UI (Button, DataTable…)
   │  ├─ features/
   │  │  ├─ orders/
   │  │  ├─ recipes/
   │  │  └─ inventory/
   │  ├─ lib/            ← auth, cookies, helpers
   │  └─ pages/          ← Next.js Pages Router
   ├─ public/
   ├─ .env.example
   └─ Dockerfile
└─ nginx/
   └─ nginx.conf        ← default.conf (static + proxy_pass /api)
```

---

## 3. Quick Start (local dev)

```bash
# Prereqs: Node 18+, pnpm, Docker Desktop

pnpm install          # 1. Install deps
pnpm gen:client       # 2. Generate typed API SDK from openapi.json
pnpm dev              # 4. Next dev at http://localhost:3000
```

---

## 4. Style Guide

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | **#F2B705** | Buttons, links, active nav |
| `--color-accent`  | **#FF8C42** | Badges, call‑to‑action hovers |
| `--color-surface` | **#FFF7EF** | App background |
| `--color-neutral` | **#3B3B3B** | Body text & icons |
| Display font      | **“Lobster Two”** |
| Body font         | **Inter, sans‑serif** |
| Elevation         | `0 2px 8px rgba(0,0,0,.05)` |
| Visual motif      | Subtle “glaze” gradient backgrounds + whisk iconography |

> Run `pnpm ui:new <Component>` to scaffold Tailwind + shadcn/ui components already wired to these tokens.

---

## 5. Auth & Sessions

* **Login** → `POST /api/v1/auth/login/access-token` ➜ server sets **`bm_session`** cookie.  
* **Middleware** → `src/middleware.ts` verifies cookie on every request; unauth users → `/login`.  
* **Cookie flags** → `HttpOnly`, `Secure` (in prod), `SameSite=Lax`, `Path=/`.  
* **Refresh** → 401 triggers `/auth/refresh` (to be added) which rotates the cookie.

---

## 6. API Client Generation

```bash
pnpm gen:client        # alias for:
openapi \
  --input ./data/openapi.json \
  --output src/api \
  --client axios \
  --useUnionTypes \
  --postfix Client
```

Results in typed clients (`OrdersClient`) **and** React hooks (`useOrdersControllerFindAll`).

---

## 7. Data Patterns

```tsx
import { useOrdersControllerFindAll } from '@/api/orders';

export default function OrdersTable() {
  const { data: orders, isLoading } = useOrdersControllerFindAll({
    page: 1,
    limit: 20,
  });
  …
}
```

* **Zustand** slices (`useAuthStore`) hold session/UI state.  
* **SWR** inside generated hooks handles caching.  
* Mutations raise toast notifications via `lib/toast.ts`.

---

## 8. Testing

| Layer             | Command          | Stack |
|-------------------|------------------|-------|
| Unit/Component    | `pnpm test`      | Jest + RTL |
| Storybook Visual  | `pnpm storybook` | Chromatic snapshots |
| End‑to‑end (E2E)  | `pnpm e2e`       | Playwright |

All components require a Story and ≥80 % unit coverage.

---

## 9. Conventional Commits

```
feat(orders): add calendar‑kanban hybrid
fix(auth): handle expired token on SSR
chore: bump deps
docs(agent): update style guide
```

`release.yml` generates changelogs and semantic tags automatically.

---

## 11. Environment Variables

```bash
NEXT_PUBLIC_API_BASE=/api/v1
NEXT_PUBLIC_APP_NAME=BakeMate
COOKIE_NAME=bm_session
```

---

## 12. FAQ

|              |                                               |
|--------------|-----------------------------------------------|
| **Why not App Router?** | Simpler SSR auth right now; migrate when React Cache matures. |
| **Add a new endpoint?** | Update `openapi.json`, run `pnpm gen:client`, commit. |
| **Design files?** | Check `/docs/design/figma-links.md` (work‑in‑progress). |

---

## 13. Contributing Checklist

1. **Branch off** `main`.  
2. `pnpm install && pnpm dev` – no errors.  
3. Write code **+** tests **+** Storybook stories.  
4. `pnpm lint && pnpm test && pnpm e2e` – all green.  
5. Open a PR with screenshots/GIFs and a clear title.

---

### Key philosophy  
_Keep it clean, keep it delightful, and always think like the baker who’s checking orders at **5 AM** with frosting on their fingers._ 🍰