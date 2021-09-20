import amendOrderRequest from '../../../../fixtures/order/amendOrder.json'

Cypress.Commands.add('amendOrder', (orderId) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('amendOrderEndPoint'),
    body: { OrderId: orderId }
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getCurrentlyAmendingOrder', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('amendingOrderEndPoint'),
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('cancelAmendingOrder', (traderOrderId, revertExistingAmend) => {
  const requestBody = amendOrderRequest
  requestBody.OrderId = traderOrderId
  requestBody.RevertExistingAmend = revertExistingAmend
  cy.api({
    method: 'POST',
    url: Cypress.env('amendOrderEndPoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body.Success).to.eq(true)
    return response.body
  })
})

Cypress.Commands.add('clearAnyOrderAmendments', () => {
  cy.getCurrentlyAmendingOrder().as('amedOrderResponse')
  cy.get('@amedOrderResponse').then((amedOrderResponse) => {
    if(amedOrderResponse.OrderId !== null) {
      cy.log('Found ' + amedOrderResponse.OrderId + ' in currently amending state. Canceling its amendment now.')
      cy.cancelAmendingOrder(amedOrderResponse.OrderId, true)
    } else {
      cy.log('Found no orders in currently amending state.')
    }
  })
})


