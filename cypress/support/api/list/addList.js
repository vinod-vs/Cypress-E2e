Cypress.Commands.add('addList', (listname) => {
  cy.request('POST', Cypress.env('addNewListEndPoint'), listname).then((response) => {
    return response.body
  })
})
