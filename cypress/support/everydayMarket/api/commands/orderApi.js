/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

Cypress.Commands.add('ordersByShopperId', (shopperId) => {
  const endPoint = String(Cypress.env('ordersApiByShopperIdEndpoint')).replace('SHOPPER_ID', shopperId)

  cy.api({
    method: 'GET',
    url: Cypress.env('ordersApiEndpoint') + endPoint
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('ordersApiByShopperIdAndTraderOrderId', (shopperId, traderOrderId) => {
  const endPoint = String(Cypress.env('ordersApiByShopperIdAndTraderOrderIdEndpoint')).replace('SHOPPER_ID', shopperId).replace('ORDER_ID', traderOrderId)

  cy.api({
    method: 'GET',
    retryOnStatusCodeFailure: true,
    url: Cypress.env('ordersApiEndpoint') + endPoint
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('events', (shopperId, traderOrderId, orderReference) => {
  const queryParams = {
    shopperId: shopperId,
    orderReference: orderReference,
    orderId: traderOrderId
  }

  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

  cy.api({
    method: 'GET',
    url: Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiEventsEndpoint') + '?' + queryString
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('returns', (returnsRequestPayload) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiReturnsEndpoint'),
    body: returnsRequestPayload
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})
