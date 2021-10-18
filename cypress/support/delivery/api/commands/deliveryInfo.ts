Cypress.Commands.add('getDeliveryInfo', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('deliveryInfoEndpoint')
  }).then((response: any) => {
    return response.body
  }) 
})
