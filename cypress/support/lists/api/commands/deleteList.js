Cypress.Commands.add('deleteList', (listIdToDelete) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV3') + listIdToDelete + '/delete'
  }).then((response) => {
    return response
  })
})
