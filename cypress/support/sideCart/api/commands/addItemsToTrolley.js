Cypress.Commands.add('addItemsToTrolley', (addItemsBody) => {
  cy.request('POST', Cypress.env('addItemsToTrolleyEndpoint'), addItemsBody).then((response) => {
    return response.body
  })
})
