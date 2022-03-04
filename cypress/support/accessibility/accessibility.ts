import 'cypress-axe'

Cypress.Commands.add("checkPageA11y", () => {
    cy.injectAxe()
    cy.checkA11y()
  });