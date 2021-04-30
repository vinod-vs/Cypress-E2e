Cypress.Commands.add('navigateToCheckout', () => {
  cy.request('GET', Cypress.env('navigateToCheckoutEndpoint')).then((response) => {
    return response.body
  })
})
