Cypress.Commands.add('loginViaApi', (shopper) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('loginEndpoint'),
    body: shopper
  }).then((response) => {
    return response.body
  })
})
