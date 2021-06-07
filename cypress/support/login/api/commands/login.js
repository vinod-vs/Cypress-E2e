Cypress.Commands.add('loginViaApi', (shopper) => {
  if (shopper.platform === 'B2C') {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })

    cy.api({
      method: 'POST',
      url: Cypress.env('loginEndpoint'),
      body: shopper
    }).then((response) => {
      return response.body
    })
  } else if (shopper.platform === 'B2B') {
    cy.api({ url: Cypress.env('b2bUat') }).then((response) => {
      expect(response.status).to.eq(200)
    })

    cy.api({
      method: 'POST',
      url: Cypress.env('b2bUat') + Cypress.env('loginEndpoint'),
      body: shopper
    }).then((response) => {
      return response.body
    })
  } else {
    cy.log('Invalid application platform!')
  }
})

Cypress.Commands.add('logOutViaApi', () => {
  cy.api({
    method: 'POST',
    url: Cypress.env('logoutEndpoint')
  }).then((response) => {
    return response
  })
})
