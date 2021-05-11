Cypress.Commands.add('loginViaApi', (shopper) => {
  if (shopper.platform === 'B2C') {
    cy.request('/').then((response) => {
      expect(response.status).to.eq(200)
    })

    cy.request('POST', Cypress.env('loginEndpoint'), shopper).then((response) => {
      return response.body
    })
  } else if (shopper.platform === 'B2B') {
    cy.request(Cypress.env('b2bUat')).then((response) => {
      expect(response.status).to.eq(200)
    })

    cy.request('POST', Cypress.env('b2bUat') + Cypress.env('loginEndpoint'), shopper).then((response) => {
      return response.body
    })
  } else {
    cy.log('Invalid application platform!')
  }
})
