/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

Cypress.Commands.add('wowDispatchUpdateCompletedOrder', (shopperId: any, orderId: any, WoolworthsSubtotal: any, testData: any) => {
  testData.ShopperID = shopperId
  testData.OrderID = orderId
  testData.Total = WoolworthsSubtotal
  cy.log('Shopper Id / signUpResp.ShopperId  Updated in wowDispatch.json File is = ' + testData.ShopperID)
  cy.log('OrderID / req.orderId Updated in wowDispatch.json File is = ' + testData.OrderID)
  cy.log('Total / WoolworthsSubtotal Updated in wowDispatch.json File is = ' + testData.Total)
  cy.request({
    method: 'POST',
    url: Cypress.env('wowDispatchUpdateCompletedOrderEndpoint'),
    headers: {
      'Content-Type': 'application/json',
      'wowapi-key': Cypress.env('wowDispatchUpdateCompletedOrderApiKey')
    },
    body: testData
  }).then((response: any) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})
