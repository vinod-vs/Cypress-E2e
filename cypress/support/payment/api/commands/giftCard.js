Cypress.Commands.add('addGiftCardToAccount', (cardRequest) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('addGiftCardEndpoint'),
    body: cardRequest
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getGCPaymentInstrumentId', (giftCardPaymentResponse) => {
  let paymentInstrumentId = 0
  paymentInstrumentId = giftCardPaymentResponse.body.GiftCard.PaymentInstrumentId
  cy.log('Gift card payment instrument ID ' + paymentInstrumentId)

  return cy.wrap(paymentInstrumentId)
})
