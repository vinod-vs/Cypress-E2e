/* eslint-disable no-unused-expressions */

Cypress.Commands.add('navigatingToCreditCardIframe', () => {
  cy.request('POST', Cypress.env('creditCardIframeEndpoint')).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('addCreditCardViaApi', (creditCardDetails) => {
  cy.navigatingToCreditCardIframe().then((response) => {
    const urlSplit = response.IframeUrl.toString().split('/')
    const creditCardSessionHeader = {
      creditcardSessionId: urlSplit[urlSplit.length - 1]
    }
    cy.creditcardTokenisation(creditCardDetails, creditCardSessionHeader).then((response) => {
      expect(response.status.responseCode, 'Credit Card initialisation response code').to.eql('00')
      return response.body
    })
  })
})

Cypress.Commands.add('creditcardTokenisation', (creditcardPayment, creditcardSessionHeader) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('creditCardTokenisationEndpoint'),
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
  if (creditCardPaymentResponse.itemId !== undefined || creditCardPaymentResponse.itemId !== null) {
    paymentInstrumentId = creditCardPaymentResponse.itemId
    cy.log('Credit card instrument ID creditCardPaymentResponse.itemId: ' + creditCardPaymentResponse.itemId)
  } else {
    paymentInstrumentId = creditCardPaymentResponse.paymentInstrument.itemId
    cy.log('Credit card instrument ID creditCardPaymentResponse.paymentInstrument.itemId: ' + creditCardPaymentResponse.paymentInstrument.itemId)
  }
  return cy.wrap(paymentInstrumentId)
})
