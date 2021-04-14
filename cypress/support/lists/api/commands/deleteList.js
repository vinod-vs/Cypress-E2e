Cypress.Commands.add('deleteList', (listIdToDelete) => {
  cy.request('POST', Cypress.env('deleteListEndPoint') + listIdToDelete).then((response) => {
    return response
  })
})
