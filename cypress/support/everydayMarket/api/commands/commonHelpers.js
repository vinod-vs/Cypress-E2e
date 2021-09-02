/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />
import '../../../refunds/api/commands/commands'

export function verifyEventDetails(response, expectedEventIndex, expectedEventName, expectedTotalEventsLength, testData, shopperId) {
  // Verify the event contents
  expect(response.data[expectedEventIndex].orderId).to.equal(Number(testData.orderId))
  expect(response.data[expectedEventIndex].orderReference).to.be.equal(testData.orderReference)
  expect(response.data[expectedEventIndex].shopperId).to.be.equal(Number(shopperId))
  expect(response.data[expectedEventIndex].domainEvent).to.be.equal(expectedEventName)
  expect(response.data[expectedEventIndex].payload).to.not.be.null
  // Verify there are only expectedTotalEventsLength events
  expect(response.data).to.have.length(expectedTotalEventsLength)
}

export function verifyCommonOrderDetails(response, testData, shopperId) {
  // Order details
  expect(response.orderId).to.equal(Number(testData.orderId))
  expect(response.orderReference).to.be.equal(testData.orderReference)
  expect(response.shopperId).to.be.equal(Number(shopperId))
  expect(response.orderStatus).to.be.equal('Placed')
  expect(response.thirdPartyOrderId).to.not.be.null
  expect(response.thirdPartyName).to.be.equal('Marketplacer')
  expect(response.createdTimeStampUtc).to.not.be.null
  expect(response.shippingPdfLink).to.not.be.null
  expect(response.shippingAmount).to.not.be.null
  expect(response.invoices.length).to.be.equal(1)
}

export function verifyOrderTotals(testData, confirmOrderResponse) {
  testData.edmDeliveryCharges = confirmOrderResponse.Order.MarketDeliveryFee
  testData.packagingFee = confirmOrderResponse.Order.PackagingFee
  testData.teamDiscount = confirmOrderResponse.Order.TeamDiscount
  testData.orderDiscountWithoutTeamDiscount = confirmOrderResponse.Order.OrderDiscountWithoutTeamDiscount
  testData.orderTotal = Number(Number(testData.edmTotal) + Number(testData.edmDeliveryCharges) + Number(testData.wowTotal) + Number(testData.packagingFee) + Number(testData.wowDeliveryCharges)
  - Number(testData.teamDiscount) - Number(testData.orderDiscountWithoutTeamDiscount))
  cy.log('Testdata JSON: ' + JSON.stringify(testData))
  cy.log('ExpectedTotalIncludingGst: ' + testData.orderTotal)
  cy.log('TeamDiscount: ' + testData.teamDiscount)
  cy.log('OrderDiscountWithoutTeamDiscount: ' + testData.orderDiscountWithoutTeamDiscount)
  expect(confirmOrderResponse.Order.WoolworthsSubtotal).to.be.equal(Number(testData.wowTotal))
  expect(confirmOrderResponse.Order.MarketSubtotal).to.be.equal(Number(testData.edmTotal))
  expect(confirmOrderResponse.Order.Subtotal).to.be.equal(Number(testData.edmTotal) + Number(testData.wowTotal))
  //expect(confirmOrderResponse.Order.TotalIncludingGst).to.be.equal(Number(testData.edmTotal) + Number(testData.edmDeliveryCharges) + Number(testData.wowTotal) + Number(testData.packagingFee) + Number(testData.wowDeliveryCharges))
  expect(confirmOrderResponse.Order.TotalIncludingGst).to.be.equal(Number(Number.parseFloat(testData.orderTotal).toFixed(2)))
}

export function generateRandomString() {
  var randomStr = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 10; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return randomStr
}

export function verifyRefundDetails(traderOrderId, expectedEdmRefundTotal, expectedEdmShippingFeeRefund) {
  cy.getRefundDetails(traderOrderId).then((response) => {
    expect(response.Total).to.be.equal(Number(Number.parseFloat(Number(expectedEdmRefundTotal) + Number(expectedEdmShippingFeeRefund)).toFixed(2)))
    expect(response.Summaries.Market[0].Value).to.be.equal(Number(expectedEdmRefundTotal))
    expect(response.Summaries.Market[1].Value).to.be.equal(Number(expectedEdmShippingFeeRefund))
  })
}
