Cypress.Commands.add('setPurchaseOrderCode', (poNumber) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('purchaseOrderCodeEndpoint'),
    body: poNumber
  }).then((response: any) => {
    return response
  })
})
