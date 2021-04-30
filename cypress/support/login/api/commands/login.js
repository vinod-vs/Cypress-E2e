Cypress.Commands.add('loginViaApi', (shopper) => {
  cy.request('/').then((response) => {
    expect(response.status).to.eq(200)
  })

  cy.request('POST', Cypress.env('b2cLoginEndpoint'), shopper).then((response) => {
    return response.body
  })
})
