---
name: mcp-setup
description: "Configure and use the Playwright MCP server with Claude Code to snapshot a page's accessibility tree before automating it. Use when setting up MCP on a new machine or project, when exploring a page that has no Page Object yet, or when UI changes break selectors."
---

# mcp-setup

## Playwright MCP — configuration for Claude Code

### Add the server

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

Or declare it in the project's `.mcp.json` so it travels with the repo:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Verify with `/mcp` in an interactive session — the server must show as connected
before its tools are callable. A server needing authorization cannot be
authorized from a non-interactive run.

### Permissions

MCP tools prompt like any other tool. The ones this project uses regularly are
already allowlisted in `.claude/settings.local.json`:

```
mcp__playwright__browser_navigate
mcp__playwright__browser_snapshot
mcp__playwright__browser_click
```

### Artifacts

The server writes page snapshots and console logs to `.playwright-mcp/`. That
directory is gitignored — it is exploration output, not source.

## When to use MCP

- Before creating any Page Object for a page whose DOM is unknown
- When the UI changes and selectors break
- To confirm an element still exists after a UI update
- Exploratory analysis of a new application

## When MCP is not required

- Updating existing tests against known stable UI
- Adding assertions to already-mapped flows
- Refactoring test structure without selector changes

## What MCP captures

- Interactive elements with roles and accessible names
- Page accessibility structure
- Element states (disabled, checked, expanded)
- Visible text and aria-labels

The accessibility snapshot is what makes `getByRole()` and `getByLabel()`
choosable — read roles and names off it rather than guessing, and only fall to
`getByTestId()` when the snapshot shows no accessible handle.

## QA flow

1. Confirm the Playwright MCP server is connected (`/mcp`)
2. Ask for a snapshot of the target page
3. Map scenarios with `qa-test-cases` against the real accessibility tree
4. Scaffold the Page Object and spec with `playwright-structure`
5. Review with `qa-test-reviewer` before accepting

## Constraint

Never invent selectors for a page that has not been snapshotted. The selector
priority in `playwright-selectors` only holds if the roles and labels it
references are real.
