import { faker } from '@faker-js/faker';

export type Customer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

/**
 * Builds the shopper details the checkout form asks for.
 *
 * Values are random on every call. Failures stay reproducible because
 * Playwright traces record the exact value typed into each field.
 * Pass overrides for anything a test asserts on.
 */
export function createCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}
