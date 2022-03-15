Cypress.Commands.add('renameList', (listId, renameListBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV3') + listId + '/update',
    body: renameListBody
  }).then((response) => {
    return response
  })
})
