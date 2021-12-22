Cypress.Commands.add('digitalPay', (digitalPayment) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('digitalPaymentEndpoint'),
    body: digitalPayment
  }).then((response: any) => {
    return response.body
  })
})

Cypress.Commands.add('openPayDigitalPay', (openPayDigitalPayment) => {
  cy.request('POST', Cypress.env('digitalPaymentEndpoint'), openPayDigitalPayment).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('getDigitalPaymentInstruments', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('digitalPaymentInstrumentsEndpoint')
  }).then((response: any) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('removePaymentInstrument', (paymentInstrumentId: string | Cypress.Chainable) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('deletePaymentInstrument'),
    body: {
      paymentInstrumentId: paymentInstrumentId
    }
  }).then((response: any) => {
    expect(response.body.Success).to.eql(true)
    return response.body
  })
})

