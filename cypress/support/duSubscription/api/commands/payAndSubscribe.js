Cypress.Commands.add('payAndSubscribeViaApi', (payAndSubscribe) => {
  cy.api({ url: '/' }).then((response) => {
    expect(response.status).to.eq(200)
  })
    cy.api({
      method: 'POST',
      url: Cypress.env('payAndSubscribeEndpoint'),
      body: payAndSubscribe
    }).then((response) => {
      return response
    })
  })