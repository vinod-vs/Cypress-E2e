Cypress.Commands.add('digitalPay', (digitalPayment) => {
  cy.request('POST', Cypress.env('digitalPaymentEndpoint'), digitalPayment).then((response) => {
    return response.body
  })
})
