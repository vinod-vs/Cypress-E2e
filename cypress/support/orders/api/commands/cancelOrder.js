Cypress.Commands.add('cancelOrder', (orderId) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('cancelOrderEndPoint'),
    body: { OrderId: orderId }
  }).then((response) => {
    expect(response.body.Success).to.be.equal(true)
    return response
  })
})
