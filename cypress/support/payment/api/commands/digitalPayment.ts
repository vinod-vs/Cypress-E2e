/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

import '../../../utilities/api/apiUtilities'

Cypress.Commands.add('digitalPay', (digitalPayment) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('digitalPaymentEndpoint'),
    body: digitalPayment
  }).then((response: any) => {
    return response.body
  })
})

Cypress.Commands.add('openPayDigitalPay', (openPayDigitalPayment) => {
  cy.request('POST', Cypress.env('digitalPaymentEndpoint'), openPayDigitalPayment).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('getDigitalPaymentInstruments', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('digitalPaymentInstrumentsEndpoint')
  }).then((response: any) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('removePaymentInstrument', (paymentInstrumentId: string | Cypress.Chainable) => {
  cy.log('Deleting paymentInstrument: ' + paymentInstrumentId)
  cy.request({
    method: 'POST',
    url: Cypress.env('deletePaymentInstrument'),
    body: {"paymentInstrumentId" : paymentInstrumentId},
    failOnStatusCode: false
  }).then((response) => {
    if (response.body.Success !== true) {
      cy.request({
        method: 'POST',
        url: Cypress.env('deletePaymentInstrument'),
        body: {"paymentInstrumentId" : paymentInstrumentId},
        failOnStatusCode: false
      }).then((secondResponse) => {
        expect(secondResponse.body.Success, 'Deleting Payment Instrument: ' + paymentInstrumentId).to.be.equal(true)
        return secondResponse.body
      })   
    }
    return response.body
  })
})

