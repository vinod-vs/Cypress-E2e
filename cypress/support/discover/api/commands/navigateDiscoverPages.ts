Cypress.Commands.add('navigateDiscoverPage', (endPoint) => {
  cy.api({
    method: 'GET',
    url: Cypress.env(endPoint)
  }).then((response: { status: any; body: any }) => {
    expect(response.status).to.eq(200)

    return response.body
  })
})
