Cypress.Commands.add('ordersByInvoice', (invoiceNumber) => {
  const queryParams = {
    invoiceId: invoiceNumber
  }

  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

  cy.request({
    method: 'GET',
    url: Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiByInvoiceIdEndpoint') + '?' + queryString
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('ordersByShopperId', (shopperId) => {
  const endPoint = String(Cypress.env('ordersApiByShopperIdEndpoint')).replace('SHOPPER_ID', shopperId)

  cy.request({
    method: 'GET',
    url: Cypress.env('ordersApiEndpoint') + endPoint
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('ordersApiByShopperIdAndTraderOrderId', (shopperId, traderOrderId) => {
  const endPoint = String(Cypress.env('ordersApiByShopperIdAndTraderOrderIdEndpoint')).replace('SHOPPER_ID', shopperId).replace('ORDER_ID', traderOrderId)

  cy.request({
    method: 'GET',
    url: Cypress.env('ordersApiEndpoint') + endPoint
  }).then((response) => {
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

  cy.request({
    method: 'GET',
    url: Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiEventsEndpoint') + '?' + queryString
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('returns', (returnsRequestPayload) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiReturnsEndpoint'),
    body: returnsRequestPayload
  }).then((response) => {
    return response.body
  })
})
