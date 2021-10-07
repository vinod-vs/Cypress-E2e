Cypress.Commands.add('addGiftCardToAccount', (cardRequest) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('addGiftCardEndpoint'),
    body: cardRequest
  }).then((response) => {
    return response
  })
})