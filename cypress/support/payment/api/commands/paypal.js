import '../../../../support/payment/api/commands/digitalPayment'
/*
    This cypress command searches for the paypal accounts linked to the logged in account.
    Gets the first enabled paypal accounts paypalPaymentInstrumentId and places an order with it.
    If no paypal accounts are linked to the account, this command will not work and fail.
      Usage
      cy.payWithLinkedPaypalAccount(digitalPaymentRequest).then((response) => {
        expect(response.TransactionReceipt).to.not.be.null
        expect(response.PlacedOrderId).to.not.be.null
  })
*/
Cypress.Commands.add('payWithLinkedPaypalAccount', (digitalPaymentRequest) => {
  // Get all payment instruments for the logged in user
  cy.getDigitalPaymentInstruments().as('paymentInstrumentsResponse')

  // Find out the linked paypal accounts PaymentInstrumentId
  cy.get('@paymentInstrumentsResponse').then((paymentInstruments) => {
    expect(paymentInstruments.Paypal).to.not.be.null
    expect(paymentInstruments.Paypal).to.not.be.empty
    expect(paymentInstruments.Paypal.Enabled).to.be.equal(true)
    expect(paymentInstruments.Paypal.Instruments.length).to.be.greaterThan(0)

    // const paypalPaymentInstruments = paymentInstruments.Paypal.Instruments.filter(instrument => instrument.Status === 'VERIFIED' && instrument.Allowed)
    const paypalPaymentInstruments = paymentInstruments.Paypal.Instruments.filter(instrument => instrument.Allowed)
    cy.log('paypalPaymentInstruments: ' + JSON.stringify(paypalPaymentInstruments))
    expect(paypalPaymentInstruments).to.have.length(1)
    const paypalPaymentInstrumentId = paypalPaymentInstruments[0].PaymentInstrumentId
    digitalPaymentRequest.payments[0].paymentInstrumentId = paypalPaymentInstrumentId
    cy.log('paypalPaymentInstrumentId: ' + paypalPaymentInstrumentId)

    // Pay using paypal PaymentInstrumentId
    cy.api({
      method: 'POST',
      url: Cypress.env('digitalPaymentEndpoint'),
      body: digitalPaymentRequest
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
  })
})

Cypress.Commands.add('getLinkedPayPalAccountInstrumentId', () => {
  cy.getDigitalPaymentInstruments().then((instruments) => {
    const paypalInstruments = instruments.Paypal.Instruments.filter(instrument => instrument.Status === 'VERIFIED' && instrument.Allowed)
    return paypalInstruments[0].PaymentInstrumentId
  })
})
