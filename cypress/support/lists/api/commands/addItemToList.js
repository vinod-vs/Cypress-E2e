Cypress.Commands.add('addItemToList', (listId, listItemBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV1') + listId + '/Items',
    body: listItemBody
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('addFreeText', (freeTextBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV1') + 'FreeTextTag',
    body: freeTextBody
  }).then((response) => {
    return response.body
  })
})
