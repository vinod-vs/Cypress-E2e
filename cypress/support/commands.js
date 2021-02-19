Cypress.Commands.add('loginb2c', (creds = {}) => {
  cy.request({
    url: Cypress.env('b2cLoginEndpoint'),
    method: 'POST',
    body: {
      email: creds.b2c.email,
      password: creds.b2c.password
    }
  })
})
