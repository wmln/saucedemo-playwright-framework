# factories/

Test data generators, built on [Faker](https://fakerjs.dev/).

Factories exist to produce *varied* entities. Current factories:

- `customer.factory.ts` — shopper details for the checkout form

Credentials are not generated here: they are fixed per environment and live in
environment variables.

## Contract

One file per entity, named `<entity>.factory.ts`, exporting a
`create<Entity>(overrides)` function:

```typescript
// factories/customer.factory.ts
import { faker } from '@faker-js/faker';

export function createCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}
```

Rules:
- Exported functions, not classes and not builder chains
- Values come from Faker, so each call is different and data never collides
  between parallel tests
- Random values stay reproducible: Playwright traces record exactly what was
  typed. Pass `overrides` for any value a test asserts on
- `overrides` spread last, so callers always win
- Named presets ("traits") are applied before overrides
- Factories generate data; they never talk to the network. Seeding via API
  belongs in a fixture that calls a factory for its payload.

## What does not belong here

Credentials. They are environment variables (`.env.example` → `.env.local`),
because on a real client project they are secrets. A `create<User>()` returning
a constant is not a factory.
