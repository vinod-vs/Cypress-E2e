Cypress.Commands.add('loginViaUi', (shopper) => {
  cy.visit('shop/securelogin')

  cy.get('#loginForm-Email').type(shopper.email)

  cy.get('#loginForm-Password').type(shopper.password)

  cy.get('.primary-legacy').click()

  cy.get('#header-panel a.coreHeader-signupButton').contains('My Account').click()

  cy.get('shared-navigation-menu a[queryparamshandling]').contains('Logout').click()

  cy.url().should('eq', Cypress.config().baseUrl)
})
