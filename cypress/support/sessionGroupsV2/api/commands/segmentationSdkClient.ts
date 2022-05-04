Cypress.Commands.add('evaluateSessionGroup', (requestBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('segmentationSdkClientEndpoint'),
    body: requestBody
  }).then((response: { status: any, body: any }) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})
