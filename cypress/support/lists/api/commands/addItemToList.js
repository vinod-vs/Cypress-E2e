Cypress.Commands.add('addItemToList', (listId, listItemBody) => {
  cy.request('POST', Cypress.env('myListsEndPoint') + listId + '/Items', listItemBody).then((response) => {
    return response
  })
})
