Cypress.Commands.add('renameList', (listId, renameListBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV3') + listId + '/update',
    body: renameListBody
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('setListAsDefault', (listId) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV3') + listId + '/update/default'
  }).then((response) => {
    return response
  })
})
