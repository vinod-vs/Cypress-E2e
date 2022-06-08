/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

import '../../../utilities/api/apiUtilities'

Cypress.Commands.add('digitalPay', (digitalPayment) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('digitalPaymentEndpoint'),
    body: digitalPayment
  }).then((response: any) => {
    expect(response.status, 'Digital Payment endpoint request success status').to.eql(200)
    return response.body
  })
})

Cypress.Commands.add('openPayDigitalPay', (openPayDigitalPayment) => {
  cy.request('POST', Cypress.env('digitalPaymentEndpoint'), openPayDigitalPayment).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('getDigitalPaymentInstruments', () => {
  //Adding a 2 second wait coz sometimes an empty payment instruments is returned even if the test account has registered payment instruments especially the gift cards
  cy.wait(Cypress.config('twoSecondWait'))
  cy.api({
    method: 'GET',
    url: Cypress.env('digitalPaymentInstrumentsEndpoint')
  }).then((response: any) => {
    expect(response.status, 'Digital Payment Instruments get request status').to.eq(200)
    expect(response.body.Success, 'Digital Payment Instruments response success status').to.eql(true)
    return response.body
  })
})

Cypress.Commands.add('removePaymentInstrument', (paymentInstrumentId: string | Cypress.Chainable) => {
  cy.log('Deleting paymentInstrument: ' + paymentInstrumentId)
  cy.request({
    method: 'POST',
    url: Cypress.env('deletePaymentInstrument'),
    body: { paymentInstrumentId: paymentInstrumentId },
    failOnStatusCode: false
  }).then((response) => {
    if (response.body.Success !== true) {
      cy.request({
        method: 'POST',
        url: Cypress.env('deletePaymentInstrument'),
        body: { paymentInstrumentId: paymentInstrumentId },
        failOnStatusCode: false
      }).then((secondResponse) => {
        expect(secondResponse.body.Success, 'Deleting Payment Instrument: ' + paymentInstrumentId).to.be.equal(true)
        return secondResponse.body
      })
    }
    expect(response.status, 'Remove Payment Instrument endpoint response status').to.eql(200)
    expect(response.body, 'Remove Payment Instrument response body').to.not.be.undefined

    return response.body
  })
})
