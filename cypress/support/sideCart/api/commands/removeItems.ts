Cypress.Commands.add('removeItems', (removeItemsRequestBody) => {
  cy.request('POST', Cypress.env('removeItemsEndpoint'), removeItemsRequestBody).then((response) => {
    return response.body
  })
})
  