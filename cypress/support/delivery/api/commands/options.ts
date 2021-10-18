Cypress.Commands.add('setDeliveryOptionsViaApi', (optionsRequest) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('deliveryOptionsEndpoint'),
    body: optionsRequest
  }).then((response: any) => {
    return response.body
  })
})