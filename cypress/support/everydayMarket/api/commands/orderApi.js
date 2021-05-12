Cypress.Commands.add('ordersByInvoice', (invoiceNumber) => {
  const queryParams = {
    invoiceId: invoiceNumber
  }

  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

  cy.request('GET', Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiByInvoiceIdEndpoint') + '?' + queryString).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('ordersByShopperId', (shopperId) => {
  let endPoint = String(Cypress.env('ordersApiByShopperIdEndpoint')).replace('SHOPPER_ID', shopperId)
  
  cy.request('GET', Cypress.env('ordersApiEndpoint') + endPoint).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('ordersApiByShopperIdAndTraderOrderId', (shopperId, traderOrderId) => {

  let endPoint = String(Cypress.env('ordersApiByShopperIdAndTraderOrderIdEndpoint')).replace('SHOPPER_ID', shopperId).replace('ORDER_ID', traderOrderId)
  
  cy.request('GET', Cypress.env('ordersApiEndpoint') + endPoint).then((response) => {
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

  cy.request('GET', Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiEventsEndpoint') + '?' + queryString).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('returns', (returnsRequestPayload) => {

  const requestPayload = {
    "from": {
      "street1": "U 52 1 Mcdonald St",
      "state": "NSW",
      "postCode": "2011",
      "suburb": "POTTS POINT NSW",
      "name": "customer",
      "phone": "0411022918"
    },
    "lineItems": [
      {
        "stockCode": '1073741883',
        "quantity": '1',
        "amount": '75.50',
        "reason": "Rajiv - change of mind"
      }
    ],
    "invoiceId": "EM0007977",
    "orderReference": "92JWX-1G9DQY",
    "createdBy": "Trader"
  }

  cy.request('POST', Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiReturnsEndpoint'), returnsRequestPayload).then((response) => {
    return response.body
  })
})



