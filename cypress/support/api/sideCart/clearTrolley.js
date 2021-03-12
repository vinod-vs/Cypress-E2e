Cypress.Commands.add('clearTrolley', () => {
  cy.request('POST', Cypress.env('clearTrolleyEndpoint')).then((response) => {
    return response.body
  })
})
