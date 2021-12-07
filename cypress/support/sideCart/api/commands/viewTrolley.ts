Cypress.Commands.add('viewTrolley', () => {
  cy.request('GET', Cypress.env('trolleyEndpoint')).then((response) => {
    return response.body
  })
})
  