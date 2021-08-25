Cypress.Commands.add('digitalPay', (digitalPayment) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('digitalPaymentEndpoint'),
    body: digitalPayment
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('openPayDigitalPay', (openPayDigitalPayment) => {
  cy.request('POST', Cypress.env('digitalPaymentEndpoint'), openPayDigitalPayment).then((response) => {
    return response.body
  })
})
