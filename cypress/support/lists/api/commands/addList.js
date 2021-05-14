Cypress.Commands.add('addList', (listname) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addNewListEndPoint'),
    body: listname
  }).then((response) => {
    return response.body
  })
})
