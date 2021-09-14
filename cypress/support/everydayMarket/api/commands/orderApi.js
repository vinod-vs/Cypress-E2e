/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />
import '../../../utilities/api/apiUtilities'

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

Cypress.Commands.add(
  'ordersApiByShopperIdAndTraderOrderIdWithRetry',
  (shopperId, traderOrderId, retryOptions) => {
    const endPoint = String(
      Cypress.env('ordersApiByShopperIdAndTraderOrderIdEndpoint')
    )
      .replace('SHOPPER_ID', shopperId)
      .replace('ORDER_ID', traderOrderId)

    cy.retryRequest(Cypress.env('ordersApiEndpoint') + endPoint, {
      method: 'GET',
      retries: retryOptions.retries,
      timeout: retryOptions.timeout,
      function: retryOptions.function
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
  }
)

Cypress.Commands.add(
  'ordersApiByEdmInvoiceIdWithRetry', (invoiceId, retryOptions) => {
    const endPoint = String(Cypress.env('ordersApiByInvoiceIdEndpoint'))
      .replace('INVOICE_ID', invoiceId)

    cy.retryRequest(Cypress.env('ordersApiEndpoint') + endPoint, {
      method: 'GET',
      retries: retryOptions.retries,
      timeout: retryOptions.timeout,
      function: retryOptions.function
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body[0]
    })
  }
)

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

Cypress.Commands.add(
  'orderEventsApiWithRetry',
  (traderOrderReference, retryOptions) => {
    const endPoint = String(
      Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiEventsEndpoint') + '?orderReference=' + traderOrderReference
    )

    cy.retryRequest(endPoint, {
      method: 'GET',
      retries: retryOptions.retries,
      timeout: retryOptions.timeout,
      function: retryOptions.function
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
  }
)

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
