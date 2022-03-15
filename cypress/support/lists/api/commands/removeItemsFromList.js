Cypress.Commands.add('removeItemsFromList', (removeItemBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV1') + 'deleteitem',
    body: removeItemBody
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('removeFreeTextFromList', (freeTextId, createdListId) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV1') + 'deletefreetexttag/' + freeTextId,
    body: createdListId
  }).then((response) => {
    return response
  })
})
