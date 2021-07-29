Cypress.Commands.add('loginViaApi', (shopper) => {
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
})

Cypress.Commands.add('logOutViaApi', () => {
  cy.api({
    method: 'POST',
    url: Cypress.env('logoutEndpoint')
  }).then((response) => {
    return response
  })
})
