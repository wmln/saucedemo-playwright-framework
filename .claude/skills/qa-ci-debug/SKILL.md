---
name: qa-ci-debug
description: "Investigate Playwright test failures in CI: classify them as flaky, environment, real bug or config, map to likely causes, and propose a fix without raising global timeouts or adding waitForTimeout. Use when a test fails in GitHub Actions or CI, passes locally but fails in CI, or fails intermittently."
---

# qa-ci-debug

## Goal
Investigate and fix test failures in CI/CD.

## Investigation Process

### 1. Classify the failure type
- **Flaky test:** passes locally, intermittently fails in CI
- **Environment:** passes locally, always fails in CI
- **Real bug:** fails both locally and in CI
- **Config:** pipeline configuration issue

### 2. Most common causes by type

**Flaky / Environment:**
- Race condition — element not ready when test acts
- Animations — element visible but still animating
- Shared data — tests not isolated
- Timeouts — CI slower than local machine
- Ports and services — unstable external dependencies

**Config:**
- Browsers not installed in CI
- Missing environment variables
- Incorrect baseURL for the environment

### 3. Solution by cause
- Race condition → `waitForResponse()` or `waitForLoadState()`
- Animation → `waitFor: 'stable'` on locator
- Shared data → isolate with fixtures and beforeEach
- Timeout → increase specific timeout with justification comment
- Browser → add `playwright install --with-deps` to workflow

### 4. Document and prevent
After fixing, update this skill with the new pattern learned.

## Constraints
- Never increase global timeout — always specific and justified timeout
- Never use waitForTimeout as a final solution
