Cypress.Commands.add('loginb2c', (creds = {}) => {
  cy.request({
    url: Cypress.env('loginEndpoint'),
    method: 'POST',
    body: {
      email: creds.b2c.email,
      password: creds.b2c.password
    }
  })
})

Cypress.Commands.add('buildQueryString', (queryString) => {
  return cy.wrap('?' + Object.keys(queryString).map(key => key + '=' + queryString[key]).join('&'))
})
