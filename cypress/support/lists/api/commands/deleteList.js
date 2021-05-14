Cypress.Commands.add('deleteList', (listIdToDelete) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('deleteListEndPoint') + listIdToDelete
  }).then((response) => {
    return response
  })
})
