/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

/*
  Usage: cy.getRefundDetails(140054768)
*/
Cypress.Commands.add('getRefundDetails', (traderOrderId) => {
    var endpoint = String(Cypress.env('refundsEndpoint'))
    endpoint = endpoint.replace('TRADER_ORDER_ID', Number(traderOrderId))
      cy.api({
        method: 'GET',
        url: endpoint
      }).then((response) => {
        expect(response.status).to.eq(200)
        return response.body
      })
    })