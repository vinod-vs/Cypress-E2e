Cypress.Commands.add('zero', () => {
  cy.api({
    method: 'POST',
    url: Cypress.env('payOrderZeroEndpoint')
  }).then((response) => {
    return response.body
  })
})
