# tests/

Specs, split by layer. Each layer is a project in `playwright.config.ts`.

| Folder | Project(s) | Purpose |
|---|---|---|
| `setup/` | `setup` | Produces auth state. Not specs. |
| `e2e/` | `e2e`, `e2e-anon` | UI end-to-end flows |
| `api/` | *(pass 2)* | API-layer specs, no browser |

## Naming

- `<feature>.spec.ts` — runs authenticated, in the `e2e` project
- `<feature>.anon.spec.ts` — runs with no auth state, in the `e2e-anon` project
- `<role>.setup.ts` — produces a `storageState` file

`*.anon.spec.ts` is how a spec opts out of authentication. Do **not** use an
in-file `test.use({ storageState: ... })`: that still inherits
`dependencies: ['setup']`, so broken auth would take out the very login tests
you need to diagnose it. The `e2e-anon` project has no such dependency.

## Tags

Tags go in the details object, not the title:

```typescript
test('LOGIN-01 valid credentials reach inventory', { tag: '@smoke' }, async ({ loginPage }) => { ... });
```

- `@smoke` — core critical path, runs on every deploy
- `@regression` — full suite, nightly or on release
- `@wip` — excluded from CI until stable

Run with `npx playwright test --grep @smoke`.
