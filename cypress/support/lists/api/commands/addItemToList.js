Cypress.Commands.add('addItemToList', (listId, listItemBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPoint') + listId + '/Items',
    body: listItemBody
  }).then((response) => {
    return response
  })
})
