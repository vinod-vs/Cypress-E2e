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
