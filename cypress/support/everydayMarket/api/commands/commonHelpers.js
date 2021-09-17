/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />
import '../../../refunds/api/commands/commands'
import '../../../invoices/api/commands/commands'

export function verifyEventDetails (response, expectedEventName, testData, shopperId, expectedEventCount) {
  cy.log('Expected Event Name: ' + expectedEventName + ' , expected count: ' + expectedEventCount)
  const events = response.data.filter(event => event.domainEvent === String(expectedEventName))
  cy.log('Expected events: ' + JSON.stringify(events))

  events.forEach(event => {
    // Verify the event contents
    expect(event.orderId).to.equal(Number(testData.orderId))
    expect(event.orderReference).to.be.equal(testData.orderReference)
    expect(event.shopperId).to.be.equal(Number(shopperId))
    expect(event.domainEvent).to.be.equal(expectedEventName)
    expect(event.payload).to.not.be.null
  })

  // Verify there are only expectedEventCount events
  expect(events).to.have.length(expectedEventCount)
}

export function verifyCommonOrderDetails (response, testData, shopperId) {
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

export function verifyOrderTotals (testData, confirmOrderResponse) {
  testData.edmDeliveryCharges = confirmOrderResponse.Order.MarketDeliveryFee
  testData.wowDeliveryCharges = confirmOrderResponse.Order.WoolworthsDeliveryFee
  testData.packagingFee = confirmOrderResponse.Order.PackagingFee
  testData.teamDiscount = confirmOrderResponse.Order.TeamDiscount
  testData.orderDiscountWithoutTeamDiscount = confirmOrderResponse.Order.OrderDiscountWithoutTeamDiscount
  testData.orderTotal = Number(Number(testData.edmTotal) + Number(testData.edmDeliveryCharges) + Number(testData.wowTotal) + Number(testData.packagingFee) + Number(testData.wowDeliveryCharges) -
    Number(testData.teamDiscount) - Number(testData.orderDiscountWithoutTeamDiscount))
  cy.log('Testdata JSON: ' + JSON.stringify(testData))
  cy.log('ExpectedTotalIncludingGst: ' + testData.orderTotal)
  cy.log('TeamDiscount: ' + testData.teamDiscount)
  cy.log('OrderDiscountWithoutTeamDiscount: ' + testData.orderDiscountWithoutTeamDiscount)
  expect(confirmOrderResponse.Order.WoolworthsSubtotal).to.be.equal(Number(testData.wowTotal))
  expect(confirmOrderResponse.Order.MarketSubtotal).to.be.equal(Number(testData.edmTotal))
  expect(confirmOrderResponse.Order.Subtotal).to.be.equal(Number(testData.edmTotal) + Number(testData.wowTotal))
  // expect(confirmOrderResponse.Order.TotalIncludingGst).to.be.equal(Number(testData.edmTotal) + Number(testData.edmDeliveryCharges) + Number(testData.wowTotal) + Number(testData.packagingFee) + Number(testData.wowDeliveryCharges))
  expect(confirmOrderResponse.Order.TotalIncludingGst).to.be.equal(Number(Number.parseFloat(testData.orderTotal).toFixed(2)))
}

export function generateRandomString () {
  let randomStr = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 10; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return randomStr
}

export function verifyRefundDetails (traderOrderId, expectedEdmRefundTotal, expectedEdmShippingFeeRefund) {
  cy.getRefundDetails(traderOrderId).then((response) => {
    expect(response.Total).to.be.equal(Number(Number.parseFloat(Number(expectedEdmRefundTotal) + Number(expectedEdmShippingFeeRefund)).toFixed(2)))
    expect(response.Summaries.Market[0].Value).to.be.equal(Number(expectedEdmRefundTotal))
    expect(response.Summaries.Market[1].Value).to.be.equal(Number(expectedEdmShippingFeeRefund))
  })
}

export function verifyInvoiceDetails (invoice, testData) {
  expect(invoice).to.not.be.null
  expect(invoice.InvoiceId).to.be.equal(Number(testData.orderId))
  expect(invoice.CollectionType).to.be.equal('Courier')
  // MP Invoice
  expect(invoice.MarketInvoices[0].InvoiceId).to.be.equal(String(testData.edmOrderId))
  expect(invoice.MarketInvoices[0].InvoiceUrl).to.not.be.null
  expect(invoice.MarketInvoices[0].SellerName).to.not.be.null
  expect(invoice.MarketInvoices[0].Total).to.be.equal(Number(testData.edmTotal))
  expect(invoice.MarketInvoices[0].OrderDate).to.not.be.null
  expect(invoice.MarketInvoices[0].Address).to.not.be.null
  expect(invoice.MarketInvoices[0].DayRangeDispatchNote).to.not.be.null
  // Shipping Invoice
  expect(invoice.MarketInvoices[1].InvoiceId).to.be.equal('Shipping')
  expect(invoice.MarketInvoices[1].InvoiceUrl).to.not.be.null
  expect(invoice.MarketInvoices[1].SellerName).to.be.null
  expect(invoice.MarketInvoices[1].Total).to.be.equal(Number(testData.edmDeliveryCharges))
  expect(invoice.MarketInvoices[1].OrderDate).to.be.null
  expect(invoice.MarketInvoices[1].Address).to.not.be.null
  expect(invoice.MarketInvoices[1].DayRangeDispatchNote).to.be.null
}

export function verifyInitialOrderDetails (response, testData, shopperId) {
  // Common Order details
  verifyCommonOrderDetails(response, testData, shopperId)

  // Seller details
  expect(response.invoices[0].seller.sellerId).to.not.be.null
  expect(response.invoices[0].seller.sellerName).to.be.equal(testData.sellerName)

  // Invoice details
  expect(response.invoices[0].invoiceStatus).to.be.equal('PAID')
  expect(response.invoices[0].wowId).to.not.be.null
  expect(response.invoices[0].wowStatus).to.be.equal('Placed')
  expect(response.invoices[0].seller.sellerId).to.not.be.null
  expect(response.invoices[0].seller.sellerName).to.not.be.null
  expect(response.invoices[0].shipments.length).to.be.equal(0)
  expect(response.invoices[0].lineItems.length).to.be.equal(1)
  expect(response.invoices[0].legacyId).to.not.be.null
  expect(response.invoices[0].legacyIdFormatted).to.not.be.null
  expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
  expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
  expect(response.invoices[0].refunds.length).to.be.equal(0)
  expect(response.invoices[0].orderTrackingStatus).to.be.equal('Received')
  expect(response.invoices[0].pdfLink).to.not.be.null
  expect(response.invoices[0].legacyIdFormatted).to.be.equal(testData.edmOrderId)
  // Line item details
  expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
  expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
  expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
  expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
  expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
  expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
  expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
  expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
  expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
  expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
  expect(response.invoices[0].lineItems[0].variantLegacyId).to.not.be.null
  // Rewards Details
  // expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETREWARD')
  expect(response.invoices[0].lineItems[0].reward.offerId).to.not.be.null
  expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.not.be.null
  expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))
}
