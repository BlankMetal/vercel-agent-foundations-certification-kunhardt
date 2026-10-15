# Ship It Shop

Submission for the Vercel Agent Foundations Certification. Ship It Shop is a Next.js storefront for Vercel swag, backed by the live Vercel Swag Store API, with three agents built on top of it:

- **Shopping assistant** (side panel on every store page): finds and compares products, answers questions about a specific item with live stock, and starts returns after the shopper confirms.
- **Store admin agent** (`/admin`): answers back-office questions about sales, returns, inventory, and support tickets, computing exact figures in a Vercel Sandbox, and keeps shared notes and reusable report scripts between conversations.
- **Back-office agent** (`my-agent/`): a standalone [eve](https://eve.dev) project with the same back-office data tools, two skills (weekly briefing, product ideation), a research subagent, and a Vercel MCP connection.

Production deployment: https://vercel-agent-foundations-certificat-omega-eight.vercel.app

## Running locally

Prerequisites: Node.js 24, [pnpm](https://pnpm.io), the [Vercel CLI](https://vercel.com/docs/cli), and a Vercel project on a team with access to AI Gateway and Vercel Sandbox.

```bash
pnpm install
vercel link                    # link this directory to your Vercel project
vercel env pull .env.local     # writes VERCEL_OIDC_TOKEN, plus any project env vars
```

`vercel env pull` overwrites `.env.local`. If `BYPASS_SECRET` isn't stored in the Vercel project's Development environment, add it to `.env.local` after pulling (see `.env.example`). Then:

```bash
pnpm dev                       # http://localhost:3000
```

The local OIDC token expires after about 12 hours. When agent requests start failing with authentication errors, run `vercel env pull .env.local` again.

### Trying the features

| Feature | How to reach it |
| --- | --- |
| Storefront | `/`, `/search`, `/products/<id or slug>`; the cart opens from the header |
| Shopping assistant | The orbit icon in the header, or "Ask the agent" on the homepage. The panel's open state is kept in a `?chat=open` URL param |
| Returns | Ask the assistant to return an order. The API's sample order IDs are `11111`, `22222`, and `33333`. The assistant asks for confirmation in the chat before anything runs |
| Store admin agent | `/admin`, signing in at `/admin/login` with the demo password `letmeinadminagent` (see [Admin access](#admin-access)) |

### Running the eve agent

```bash
cd my-agent
pnpm install
cp .env.example .env.local     # fill in API_BASE_URL and BYPASS_SECRET
pnpm dev                       # eve dev: opens the interactive terminal UI
```

On first run, eve asks for a model credential in the terminal UI: sign in with a Vercel account (it checks the team's AI Gateway access) or paste an AI Gateway key. The Vercel MCP connection asks you to authorize Vercel in the browser the first time a tool uses it.

## Environment variables

Templates with every name and no values: [`.env.example`](.env.example) for the app and [`my-agent/.env.example`](my-agent/.env.example) for the eve agent. Both `.env.local` files are gitignored.

### App (repository root)

| Variable | Required | Description |
| --- | --- | --- |
| `BYPASS_SECRET` | Yes | Deployment-protection bypass secret for the Vercel Swag Store API, provided with the certification. Sent as the `x-vercel-protection-bypass` header on every API call. Server-only: it must never get a `NEXT_PUBLIC_` prefix. |
| `VERCEL_OIDC_TOKEN` | Yes, locally | Authenticates AI Gateway (all model calls) and Vercel Sandbox (the admin agent's `bash` tool). Written by `vercel env pull`; on Vercel deployments it is injected automatically, so don't set it there. |
| `AI_GATEWAY_API_KEY` | No | Alternative AI Gateway credential. If set, model calls use it instead of the OIDC token. Sandbox still needs `VERCEL_OIDC_TOKEN`. |
| `API_BASE_URL` | No | Swag Store API base URL. Defaults to `https://vercel-agentic-swag-store-api.vercel.app/api`. |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL used for metadata and Open Graph links. Defaults to `http://localhost:3000`. |

### eve agent (`my-agent/`)

| Variable | Required | Description |
| --- | --- | --- |
| `API_BASE_URL` | Yes | Swag Store API base URL, e.g. `https://vercel-agentic-swag-store-api.vercel.app/api`. Unlike the app, the eve agent has no default. |
| `BYPASS_SECRET` | Yes | Same Swag Store API bypass secret as the app. |
| `AI_GATEWAY_API_KEY` | No | Model credential for deployments. Locally, eve's terminal UI connects a credential for you; deployed agents need it set on the Vercel project. |

## Deploying

Merges to `main` deploy to Vercel. In the Vercel project, set `BYPASS_SECRET` for Production and Preview. AI Gateway and Sandbox authenticate with the deployment's OIDC token, so they need no keys. Durable chats run on Vercel Workflow, wired in by `withWorkflow()` in `next.config.mjs`.

`pnpm build` should report `/` as static (`○`), `/products/[param]` as SSG (`●`), and `/search` as dynamic (`ƒ`).

## How it works

### Storefront

`lib/api.ts` is a typed `fetch` wrapper for the Swag Store API. It runs only on the server, so the bypass secret never reaches the browser. Catalog reads are cached for 5 minutes with tags; stock and cart calls are uncached. Cart mutations are Server Actions, and the API's cart token lives in an `httpOnly` cookie. The root layout is synchronous, which keeps the home page static and product pages statically generated.

### Shopping assistant

- **Agent:** `lib/workflows/chat-flow.ts` runs the assistant as a `WorkflowAgent` (`@ai-sdk/workflow`) inside a Vercel Workflow, so a reply keeps running if the shopper reloads or the connection drops. The client stores the run ID and reconnects through `/api/chat/[id]/stream`; chat history is kept in `localStorage`.
- **Tools** (`lib/tools.ts`): `searchProducts`, `getProductDetails`, `getAllCategories`, and `returnOrder`. Results render as product cards in the chat rather than as text.
- **Search:** the API's `search` parameter matches a single substring, so "black hoodie" finds nothing. Both catalog tools rank the cached catalog locally instead (`lib/product-match.ts`), weighting matches in names and tags above matches in descriptions.
- **Returns:** `returnOrder` requires the shopper's approval in the UI before it runs. It checks the order exists, then starts `lib/workflows/return-flow.ts` as a separate workflow: notify, preauthorize the refund, file the return, with each call a retried step.

### Store admin agent

- **Agent:** `lib/workflows/admin-chat-flow.ts`, a `WorkflowAgent` with read-only tools for sales, returns, inventory, support tickets, and the catalog. `/admin` and `/api/admin/*` are gated by `proxy.ts`.
- **Sandbox computation:** each data tool saves its full result as JSON in a persistent Vercel Sandbox (`lib/sandbox.ts`), and the agent computes rates, totals, and joins with a `bash` tool running Python over those files, instead of doing arithmetic in the model. The sandbox has no network access, because the data includes customer-written ticket text that could carry a prompt injection.
- **Memory:** the agent keeps a notes file and saved report scripts in the sandbox, shared by every admin, and reads the notes into each conversation.
- **History:** admin chat history is stored per browser in `localStorage`.

### Design

The UI is black and white, built from generative SVG and canvas primitives in `components/art/`: seeded Ponti-style tile walls, an evil-eye hero whose iris follows the pointer and projects the featured product card on hover, a contour-line canvas in the footer, and an isometric cube field behind the admin pages. Light and dark themes follow the system setting, and all looping animation stops under `prefers-reduced-motion`.

## Project structure

```
app/
  (store)/                  storefront: home, /search, /products/[param]
  admin/                    /admin workspace and /admin/login
  api/chat/                 shopper chat route + stream reconnect route
  api/admin/chat/           admin chat route + stream reconnect route
lib/
  api.ts, types.ts          Swag Store API client and types (server-only)
  agent.ts, tools.ts        shopping agent definition and all agent tools
  agent-instructions.ts     shopping assistant system prompt
  workflows/                chat, admin chat, and return workflows
  sandbox.ts                persistent Vercel Sandbox for the admin agent
  product-match.ts          local catalog ranking for agent search
  cart-*.ts, admin-*.ts     cart and admin Server Actions and helpers
components/
  art/                      generative art primitives
  agent-*.tsx               shopping assistant UI and product cards
  admin-*.tsx               admin workspace, chat, and history drawer
  ui/, ai-elements/         shadcn/ui and AI Elements components
my-agent/                   standalone eve back-office agent
proxy.ts                    admin gate for /admin and /api/admin
```

## Admin access

The admin gate is the demo gate supplied by the certification scaffold: a hardcoded password in `lib/admin-auth.ts`, stored as the cookie value after sign-in. It keeps casual visitors out of `/admin` and is not real authentication.

## Limitations

- Checkout is disabled; the cart stops at the subtotal.
- There is no test suite. `pnpm lint` is wired to `eslint .`, but ESLint is not installed, so it fails.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, inherited from the scaffold. `npx tsc --noEmit` passes.
