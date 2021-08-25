Cypress.Commands.add('amendOrder', (orderId) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('amendOrderEndPoint'),
    body: { OrderId: orderId }
  }).then((response) => {
    return response
  })
})
