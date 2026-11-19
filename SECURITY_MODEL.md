# Security model — Coworkers

What this system protects, who can reach it, and which attackers count. Security scans and reviewers use it to judge findings. Facts marked **(owner)** come from the repo owner; the rest is drawn from the code.

## Components

| Component | Code |
|---|---|
| Coworkers Worker | `src/server.ts`, `src/lib/auth.ts` (Cloudflare Access), `src/control` (operation access checks), `src/routes/api` (hooks with token), `src/mcp` (OAuth, MCP server) |
| Coworkers Agents | `src/agents` (BotAgent, UserHub, AppLive apps runtime, browser, dynamic workers, email) |
| Coworkers Installer | `installer/` (Cloudflare OAuth, deploy upload) |

## Trust boundaries and entry points

one Worker behind Cloudflare Access (JWT, `ACCESS_TEAM_DOMAIN`/`ACCESS_AUD`); without Access configured everyone is the `demo` user. Users reach only their own UserHub and bots (`ownsInstance`). Bots run AI agents with browsers, dynamic workers (code execution), email, per-bot secrets, and build apps served at `/apps/*` authenticated by link token; webhooks at `/api/hooks/$userId/$botId/$token`; outside agents via MCP OAuth. Prompt injection from web pages/email into bot actions, and destructive ops gated by user approval (`runOperation`), are central.

## Assets

All assets matter equally **(owner)**.

- Bot secrets, browser sessions and logins.
- The ability to run code and send email as the owner.
- Cloudflare credentials used by the installer.

## Attackers that matter

Every attacker below matters **(owner)**.

- Anyone on the internet if Cloudflare Access is not configured (everyone becomes the `demo` user).
- Malicious web pages and emails read by bots (prompt injection).
- Holders of app link tokens, webhook tokens or MCP OAuth tokens.

## Existing controls

Cloudflare Access JWT; `ownsInstance` limits users to their own hub and bots; `runOperation` checks caller, level, input, approval for destructive ops, and ceilings.

## Out of scope / accepted risk

Nothing is out of scope; demo, prototype and tooling code count too **(owner)**.
