Cypress.Commands.add('loginViaApi', (shopper) => {
  cy.request('/')

  cy.request('POST', Cypress.env('b2cLoginEndpoint'), shopper).then((response) => {
    return response.body
  })
})
