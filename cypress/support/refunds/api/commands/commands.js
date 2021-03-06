/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

import '../../../utilities/api/apiUtilities'

/*
  Usage: cy.getRefundDetails(140054768)
*/
Cypress.Commands.add('getRefundDetails', (traderOrderId) => {
  let endpoint = String(Cypress.env('refundsEndpoint'))
  endpoint = endpoint.replace('TRADER_ORDER_ID', Number(traderOrderId))
  cy.api({
    method: 'GET',
    url: endpoint
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('getRefundDetailsWithRetry', (traderOrderId, retryOptions) => {
  let endpoint = String(Cypress.env('refundsEndpoint'))
  endpoint = endpoint.replace('TRADER_ORDER_ID', Number(traderOrderId))
  cy.retryRequest(endpoint, {
    method: 'GET',
    retries: retryOptions.retries,
    timeout: retryOptions.timeout,
    function: retryOptions.function
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})
