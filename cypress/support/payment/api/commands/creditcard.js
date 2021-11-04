Cypress.Commands.add('navigatingToCreditCardIframe', () => {
  cy.request('POST', Cypress.env('creditCardIframeEndpoint')).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('creditcardPayment', (creditcardPayment, creditcardSessionHeader) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('creditCardPaymentEndpoint'),
    headers: {
      Authorization: 'Bearer ' + creditcardSessionHeader.creditcardSessionId
    },
    body: creditcardPayment
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('getCCPaymentInstrumentId', (creditCardPaymentResponse) => {
  let paymentInstrumentId = 0
  if (creditCardPaymentResponse.itemId != undefined || creditCardPaymentResponse.itemId != null) {
    paymentInstrumentId = creditCardPaymentResponse.itemId
    cy.log('Credit card instrument ID creditCardPaymentResponse.itemId: ' + creditCardPaymentResponse.itemId)
  } else {
    paymentInstrumentId = creditCardPaymentResponse.paymentInstrument.itemId
    cy.log('Credit card instrument ID creditCardPaymentResponse.paymentInstrument.itemId: ' + creditCardPaymentResponse.paymentInstrument.itemId)
  }
  return cy.wrap(paymentInstrumentId)
})
