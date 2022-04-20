Cypress.Commands.add('addProductNoteViaApi', (productNoteRequest: any) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('productNoteEndpoint'),
    body: productNoteRequest
  }).then((response: any) => {
    expect(response.body.Success, 'Product Note Response').to.eql(true)
    return response.body
  })
})