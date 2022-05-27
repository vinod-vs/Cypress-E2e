/* eslint-disable no-unused-expressions */

Cypress.Commands.add('navigatingToCreditCardIframe', () => {
  cy.request('POST', Cypress.env('creditCardIframeEndpoint')).then((response) => {
    expect(response.status, 'Credit Card iFrame response status').to.eql(200)
    expect(response.body.Success, 'Credit Card Success Property').to.be.true
    expect(response.body.IframeUrl, 'Credit Card iFrame URL').to.not.be.null
    return response.body
  })
})

Cypress.Commands.add('addCreditCardViaApi', (creditCardDetails) => {
  cy.navigatingToCreditCardIframe().then((response) => {
    const urlSplit = response.IframeUrl.toString().split('/')
    expect(urlSplit, 'Splitting Iframe url (to get session header)').to.not.be.null
    const creditCardSessionHeader = {
      creditcardSessionId: urlSplit[urlSplit.length - 1],
    }
    cy.creditcardTokenisation(creditCardDetails, creditCardSessionHeader).then(
      (response) => {
        expect(
          response.status.responseCode,
          'Credit Card initialisation response code'
        ).to.eql('00')
        return response.body
      }
    )
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
    expect(response.status, 'Credit Card tokenisation response status').to.eql(200)
    expect(response.body, 'Credit Card Tokenisation body').to.not.be.undefined
    return response.body
  })
})

Cypress.Commands.add(
  'getCCPaymentInstrumentId',
  (creditCardPaymentResponse) => {
    let paymentInstrumentId = 0
    if (
      creditCardPaymentResponse.itemId !== undefined &&
      creditCardPaymentResponse.itemId !== null
    ) {
      paymentInstrumentId = creditCardPaymentResponse.itemId
      cy.log(
        'Credit card instrument ID creditCardPaymentResponse.itemId: ' +
          creditCardPaymentResponse.itemId
      )
    } else {
      paymentInstrumentId = creditCardPaymentResponse.paymentInstrument.itemId
      cy.log(
        'Credit card instrument ID creditCardPaymentResponse.paymentInstrument.itemId: ' +
          creditCardPaymentResponse.paymentInstrument.itemId
      )
    }
    return cy.wrap(paymentInstrumentId)
  }
)
