# Tabloom

Tabloom is a local-first action-surface mapper for product and platform teams. Inventory an operation once, record its UI, API, CLI, and MCP paths, and immediately see which important actions are still trapped in a dashboard.

No account, backend, paid API, or secret is required. Workspace data stays in browser storage and can be exported as JSON or Markdown.

## Why now

Several current builder signals converged on a practical shift from visual dashboards to action surfaces that both people and agents can use:

- WorkOS founder Michael Grinich described the company's Management MCP as a “headless dashboard” and reported early adoption in [this X post](https://x.com/grinich/status/2077177978761646286).
- Resend CEO Zeno Rocha outlined a goal of exposing dashboard operations through APIs, SDKs, and MCP in [this X post](https://x.com/zenorocha/status/2077034980828754024).
- Vercel published an [Agent Readability specification](https://vercel.com/kb/guide/agent-readability-spec) focused on making web content understandable and navigable to agents.
- WorkOS documents the primary product example in its [Management MCP changelog](https://workos.com/changelog/management-mcp-server).

These sources are inspiration, not dependencies. A brief GitHub preflight for “headless dashboard coverage” and “agent readability audit” returned no maintained, dedicated tool for mapping action parity across UI, API, CLI, and MCP. Tabloom complements content-readability audits by focusing on operational capability gaps.

## Features

- Add and edit product operations with product area and risk level.
- Compare UI, API, CLI, and MCP coverage in one responsive matrix.
- Flag actions that are dashboard-only and calculate overall surface coverage.
- Filter UI-trapped or headless-ready operations and search across names and paths.
- Persist everything locally with a clear recovery message when storage is unavailable.
- Export portable JSON or a Markdown table.
- Restore a useful demo workspace at any time.
- Keyboard-visible focus, semantic controls, reduced-motion support, and responsive layouts.

## Run locally

    npm run dev

Open http://localhost:4173.

## Validate and build

    npm test
    npm run check
    npm run build

The dependency-free production output is written to dist/.

## Privacy

Tabloom makes no network requests after page load. Data is stored under the tabloom.operations.v1 browser-storage key. Export a copy before clearing site data.

## License

[MIT](LICENSE)
