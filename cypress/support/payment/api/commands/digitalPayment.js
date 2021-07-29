Cypress.Commands.add('digitalPay', (digitalPayment) => {
  cy.request('POST', Cypress.env('digitalPaymentEndpoint'), digitalPayment).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('openPayDigitalPay', (openPayDigitalPayment) => {
  cy.request('POST', Cypress.env('digitalPaymentEndpoint'), openPayDigitalPayment).then((response) => {
    return response.body
  })
})
