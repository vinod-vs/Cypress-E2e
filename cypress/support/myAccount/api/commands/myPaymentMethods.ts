Cypress.Commands.add('availableDigitalPaymentInstruments', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('digitalPaymentInstrumentsAvailableEndpoint')
  }).then((response: any) => {
    expect(response.status).to.eq(200)

    return response.body
  })
})
