Cypress.Commands.add('viewTrolley', () => {
  cy.request('GET', Cypress.env('trolleyEndpoint')).then((response) => {
    expect(response.status, 'GET Trolley endpoint response status').to.eql(200)
    return response.body
  })
})
