---
name: qa-test-cases
description: "Map test scenarios from a user story or feature before any test code is written. Produces an ID, description, type, layer and priority table, and assigns every scenario to a test layer (api, e2e, e2e-anon). Use at the start of any new feature, user story or page to be automated, before generating Page Objects or specs."
---

# qa-test-cases

## Goal
Map complete test scenarios from a feature or user story.

## Expected Input
- User story or feature description
- Accessibility snapshot captured by Playwright MCP (preferred — required for new pages or unknown UI)
- Project context (stack, patterns)

## When MCP is Not Required
- Updating selectors in existing tests
- Fixing minor issues in known stable UI
- Adding assertions to already mapped flows

## Process
1. Confirm scope, risk, and **test layer** before mapping (see below)
2. Identify the main happy path
3. Map flow variations
4. Identify edge cases
5. Identify negative scenarios
6. Prioritize by risk and impact

## Choosing the layer

Every scenario lands in exactly one project. Decide this before writing anything —
it determines the folder, the file name, and what the test is allowed to do.

| Layer | Project | Folder | Use when |
|---|---|---|---|
| API | `api` | `tests/api/` | Correctness of data, validation, status codes, pagination, permissions. Fastest — prefer it. |
| UI, authenticated | `e2e` | `tests/e2e/*.spec.ts` | The behaviour is genuinely visual or interactive, and the user is logged in |
| UI, anonymous | `e2e-anon` | `tests/e2e/*.anon.spec.ts` | Login, registration, session expiry, anything that must start logged out |
| Auth state | `setup` | `tests/setup/*.setup.ts` | Not a scenario — produces `storageState` for the `e2e` project |

Rules of thumb:
- If it can be verified over HTTP, it belongs in the API layer.
- Reserve E2E for flows where the UI *is* the thing under test.
- Setup for a UI test should be seeded over the API, not clicked through.

## Output
Structured list:

| ID | Description | Type | Layer | Priority |
|----|-------------|------|-------|----------|
| TC01 | ... | Functional | e2e | High |
| TC02 | ... | Edge Case | api | Medium |
| TC03 | ... | Negative | e2e-anon | High |

## Scenario Types
- **Functional:** expected flow with valid data
- **Edge Case:** limits, extreme values, boundary behavior
- **Negative:** invalid data, broken flows, expected errors

## Constraints
- Never suggest selectors without a real accessibility snapshot from MCP (for new pages)
- Always consider test independence
- Always include at least 1 negative scenario per feature
- Every scenario must name its layer — an unassigned scenario is not mapped
