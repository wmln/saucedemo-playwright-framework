---
name: qa-prompt-templates
description: "Reusable prompt templates for this QA framework, each with the Mode, Model and Reason header: explore UI with MCP, generate a Page Object, generate tests, add an API test, review tests, debug a CI failure, refactor the suite. Use when starting one of these tasks or writing a prompt for Claude Code."
---

# prompt-templates

## Prompt Format Standard
Every prompt must include at the top:
```
Mode: [Plan | Auto | Execute]
Model: [best available for this task]
Reason: [brief explanation of mode choice]
```

## Explore UI with MCP
```
Mode: Auto
Model: Best available
Reason: Single exploration task, no file changes

Access [URL] and map all interactive elements on the page.
For each element return: type, role, label/text, state.
```

## Generate Page Object
```
Mode: Plan
Model: Best available
Reason: Creates new file, needs review before execution

Using the accessibility snapshot below and following the pattern of
pages/LoginPage.ts, create the Page Object for [page name] at
pages/[PageName].ts.

Then register it in fixtures/base.fixture.ts — add it to the Fixtures type
and add its fixture. Do not create a new fixture file.

Snapshot:
[paste snapshot captured by MCP]

Reference file: pages/LoginPage.ts
```

## Generate Tests
```
Mode: Plan
Model: Best available
Reason: Creates multiple test scenarios, needs review before execution

Based on the scenarios below, create Playwright tests for [feature name] at
tests/e2e/[feature].spec.ts.

Requirements:
- Import { test, expect } from '../../fixtures/base.fixture' — never from
  @playwright/test
- Use the [PageName] fixture; do not instantiate Page Objects in the spec
- Tags in the details object: test('ID description', { tag: '@smoke' }, ...)
- Credentials via requireEnv() from config/env.ts — never literals
- If the flow must run unauthenticated, name the file
  tests/e2e/[feature].anon.spec.ts instead

Scenarios:
[paste scenario list]
```

## Add an API Test
```
Mode: Plan
Model: Best available
Reason: Creates new file in a layer with its own conventions

Create API tests for [endpoint] at tests/api/[resource].spec.ts.

Requirements:
- No browser — do not use the `page` fixture
- Use the request/APIRequestContext fixtures from fixtures/base.fixture.ts
- Assert status, body shape, and error responses (400/401/403/404/422)
```

## Review Tests
```
Mode: Auto
Model: Best available
Reason: Read-only review task, no file changes

Use the qa-test-reviewer skill to review the tests in [file path].
Do not modify anything — only report issues found by category with severity.
```

## Debug CI Failure
```
Mode: Plan
Model: Best available
Reason: Investigation may lead to file changes, needs review

The test [test name] is failing in CI with the error below.
Use the qa-ci-debug skill to investigate the cause and propose a fix.
State which project it ran in (setup / e2e / e2e-anon).

Error:
[paste error log]
```

## Refactor Suite
```
Mode: Plan
Model: Best available
Reason: Large structural change across multiple files, always needs review

Refactor tests under tests/ that do not yet follow the current architecture:
- specs importing from @playwright/test instead of fixtures/base.fixture.ts
- Page Objects instantiated in beforeEach instead of via fixtures
- hardcoded credentials instead of requireEnv()
- tags in the title instead of the details object

Use existing Page Objects in pages/ where available; create new ones following
the playwright-structure skill.
```
