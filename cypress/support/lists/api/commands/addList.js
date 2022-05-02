Cypress.Commands.add('addList', (listname) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('myListsEndPointV3'),
    body: listname
  }).then((response) => {
    return response.body
  })
})
