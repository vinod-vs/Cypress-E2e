export function getAliasChainableType<T> (alias: string): Cypress.Chainable<T> {
  return cy.get<T>(alias)
}
