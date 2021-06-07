Cypress.Commands.add('signUpViaApi', (userInfo) => {
  cy.api({ url: '/' }).then((response) => {
    expect(response.status).to.eq(200)
  })

  cy.api({
    method: 'POST',
    url: Cypress.env('signUpEndpoint'),
    body: userInfo
  }).then((response) => {
    return response
  })
})
