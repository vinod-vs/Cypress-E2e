Cypress.Commands.add('logOutViaApi', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('logoutEndpoint'),
    }).then((response) => {
      return response
    })
  })
  