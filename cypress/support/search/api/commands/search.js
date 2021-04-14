Cypress.Commands.add('productSearch', (searchBody) => {
  cy.request('POST', Cypress.env('productSearchEndpoint'), searchBody).then((response) => {
    return response.body
  })
})
