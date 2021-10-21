/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />
import '../../../refunds/api/commands/commands'
import '../../../invoices/api/commands/commands'
import '../../../oqs/api/commands/oqs'

export function verifyEventDetails(response, expectedEventName, testData, shopperId, expectedEventCount) {
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
  testData.wowDeliveryCharges = confirmOrderResponse.Order.WoolworthsDeliveryFee
  testData.packagingFee = confirmOrderResponse.Order.PackagingFee
  testData.teamDiscount = confirmOrderResponse.Order.TeamDiscount
  testData.orderDiscountWithoutTeamDiscount = confirmOrderResponse.Order.OrderDiscountWithoutTeamDiscount
  testData.orderTotal = Number(Number.parseFloat(Number(Number(testData.edmTotal) + Number(testData.edmDeliveryCharges) + Number(testData.wowTotal) + Number(testData.packagingFee) + Number(testData.wowDeliveryCharges) -
    Number(testData.teamDiscount) - Number(testData.orderDiscountWithoutTeamDiscount))).toFixed(2))
  cy.log('Testdata JSON: ' + JSON.stringify(testData))
  cy.log('ExpectedTotalIncludingGst: ' + testData.orderTotal)
  cy.log('TeamDiscount: ' + testData.teamDiscount)
  cy.log('OrderDiscountWithoutTeamDiscount: ' + testData.orderDiscountWithoutTeamDiscount)
  expect(confirmOrderResponse.Order.WoolworthsSubtotal).to.be.equal(Number(Number.parseFloat(Number(testData.wowTotal)).toFixed(2)))
  expect(confirmOrderResponse.Order.MarketSubtotal).to.be.equal(Number(Number.parseFloat(Number(testData.edmTotal)).toFixed(2)))
  expect(confirmOrderResponse.Order.Subtotal).to.be.equal(Number(Number.parseFloat(Number(testData.edmTotal) + Number(testData.wowTotal)).toFixed(2)))
  expect(confirmOrderResponse.Order.TotalIncludingGst).to.be.equal(Number(Number.parseFloat(testData.orderTotal).toFixed(2)))
}

export function generateRandomString() {
  let randomStr = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 10; i++) {
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

export function verifyCompleteRefundDetails(traderOrderId, expectedWOWRefundTotal, expectedWOWReusableBagsRefund, expectedEdmRefundTotal, expectedEdmShippingFeeRefund) {
  cy.getRefundDetails(traderOrderId).then((response) => {
    expect(response.Total).to.be.equal(Number(Number.parseFloat(Number(expectedEdmRefundTotal) + Number(expectedEdmShippingFeeRefund) + Number(expectedWOWRefundTotal) + Number(expectedWOWReusableBagsRefund)).toFixed(2)))
    expect(response.Summaries.Woolworths[0].Value).to.be.equal(Number(expectedWOWRefundTotal))
    expect(response.Summaries.Woolworths[1].Value).to.be.equal(Number(expectedWOWReusableBagsRefund))
    expect(response.Summaries.Market[0].Value).to.be.equal(Number(expectedEdmRefundTotal))
    expect(response.Summaries.Market[1].Value).to.be.equal(Number(expectedEdmShippingFeeRefund))
  })
}

export function verifyCompleteRefundDetailsWithRetry(traderOrderId, expectedWOWRefundTotal, expectedWOWReusableBagsRefund, expectedEdmRefundTotal, expectedEdmShippingFeeRefund) {
  const total = Number.parseFloat(Number(expectedWOWRefundTotal) + Number(expectedWOWReusableBagsRefund) + Number(expectedEdmRefundTotal) + Number(expectedEdmShippingFeeRefund)).toFixed(2)
  cy.getRefundDetailsWithRetry(traderOrderId, {
    function: function (response) {
      if (response.body.Total !== Number(total)) {
        cy.log('Total expected was ' + total + ' , but api returned ' + response.body.Total)
        throw new Error('Total expected was ' + total + ' , but api returned ' + response.body.Total)
      }
    },
    retries: Cypress.env('refundApiRetryCount'),
    timeout: Cypress.env('refundApiTimeout')
  }).then((response) => {
    expect(response.Total).to.be.equal(Number(Number.parseFloat(Number(expectedEdmRefundTotal) + Number(expectedEdmShippingFeeRefund) + Number(expectedWOWRefundTotal) + Number(expectedWOWReusableBagsRefund)).toFixed(2)))
    expect(response.Summaries.Woolworths[0].Value).to.be.equal(Number(expectedWOWRefundTotal))
    expect(response.Summaries.Woolworths[1].Value).to.be.equal(Number(expectedWOWReusableBagsRefund))
    expect(response.Summaries.Market[0].Value).to.be.equal(Number(expectedEdmRefundTotal))
    expect(response.Summaries.Market[1].Value).to.be.equal(Number(expectedEdmShippingFeeRefund))
  })
}

export function verifyInvoiceDetails(invoice, testData) {
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

export function verifyInitialOrderDetails(response, testData, shopperId) {
  // Common Order details
  verifyCommonOrderDetails(response, testData, shopperId)

  // Seller details
  expect(response.invoices[0].seller.sellerId).to.not.be.null
  expect(response.invoices[0].seller.sellerName).to.be.equal(testData.items[0].sellerName)

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

/**
 *
 * @param {*} traderOrderId
 * @param {*} expectedWOWOrderStatus
 * @param {*} isMarketOnly
 * @param {*} testData
 * * @param {*} args[0] skipStatusVerification -> true if you want to skip status verification else false
 *
 * Make sure your latest projection is saved as 'finalProjection'. OQS response is verified against this projection
 */
export function verifyOQSOrderStatus(traderOrderId, expectedWOWOrderStatus, isMarketOnly, testData, ...args) {
  // Invoke OQS api
  cy.getOrderStatus(traderOrderId).then((oqsResponse) => {
    cy.log(JSON.stringify(oqsResponse))
  }).as('oqsResponse')

  // Verify the response against the projection
  cy.all(
    cy.get('@finalProjection'),
    cy.get('@oqsResponse')
  ).then(([projection, oqsResponse]) => {
    // Verify common details
    expect(oqsResponse.OrderId).to.be.equal(Number(traderOrderId))
    expect(oqsResponse.ShopperId).to.be.equal(projection.shopperId)
    expect(oqsResponse.MarketDeliveryStreet1).to.not.be.null
    expect(oqsResponse.MarketDeliveryStreet2).to.not.be.null
    expect(oqsResponse.MarketDeliverySuburb).to.not.be.null
    expect(oqsResponse.MarketDeliveryPostCode).to.not.be.null
    expect(oqsResponse.IsMarketOnly).to.be.equal(isMarketOnly)
    expect(oqsResponse.MarketOrders.length).to.be.greaterThan(0)
    expect(oqsResponse.MarketShippingPdfLink).to.be.equal(projection.shippingPdfLink)
    expect(oqsResponse.CurrentStatus).to.be.equal(expectedWOWOrderStatus)

    // If marketOnly order, verify there are no WOW products
    if (isMarketOnly) {
      expect(oqsResponse.OrderProducts).to.be.empty
    }

    // Verify wow order details
    // Filter WOW items from testdata
    const wowItems = testData.items.filter(item => item.isEDMProduct === String(false))
    expect(oqsResponse.OrderProducts.length).to.be.gte(wowItems.length)
    if (wowItems.length !== 0) {
      // Verify the WOW items count match the OQS response. If there is a promo like 'Woolworths Disney+ Ooshie Collectibles'
      // This will also be added under OrderedProducts. Hence checking length to be for greater than or equal from testdata
      wowItems.forEach(function (item, k) {
        expect(oqsResponse.OrderProducts[k].Ordered.StockCode).to.be.equal(item.stockCode)
        expect(oqsResponse.OrderProducts[k].Ordered.Quantity).to.be.equal(item.quantity)
        expect(oqsResponse.OrderProducts[k].Ordered.SalePrice.Value).to.be.equal(item.pricePerItem)
        expect(oqsResponse.OrderProducts[k].Ordered.Total).to.be.equal(Number(Number.parseFloat(Number(item.pricePerItem * item.quantity)).toFixed(2)))
      })
    } else {
      //On WOW order cancellations the OQS response with the new traderOrderId will have empty OrderProducts as the WOW items will be removed and only the EDM products will be retained in the new traderorderId
      expect(oqsResponse.OrderProducts).to.be.empty
    }

    // Verify edm order details
    // Verify the edm products count matches with the invoices count
    expect(oqsResponse.MarketOrders.length).to.be.equal(projection.invoices.length)
    // Verify each edm item
    oqsResponse.MarketOrders.forEach(function (item, i) {
      // Verify the edm items per product/invoice count matches with the lineItems of each invoices count
      expect(oqsResponse.MarketOrders[i].Products.length).to.be.equal(projection.invoices[i].lineItems.length)
      oqsResponse.MarketOrders[i].Products.forEach(function (item, j) {
        expect(oqsResponse.MarketOrders[i].LegacyIdFormatted).to.be.equal(projection.invoices[i].legacyIdFormatted)
        expect(oqsResponse.MarketOrders[i].SellerName).to.be.equal(projection.invoices[i].seller.sellerName)
        // Verify order status
        if (args.length > 0 && args[0] !== true) {
          if (projection.invoices[i].wowStatus === 'SellerCancelled') {
            expect(oqsResponse.MarketOrders[i].Status).to.be.equal('Cancelled')
          } else if (projection.invoices[i].wowStatus === 'Placed') {
            expect(oqsResponse.MarketOrders[i].Status).to.be.equal('Received')
          } else {
            expect(oqsResponse.MarketOrders[i].Status).to.be.equal(projection.invoices[i].wowStatus)
          }
        } else {
          cy.log('Skipping status validation. Projection Status: ' + projection.invoices[i].wowStatus + ' , OQS Status: ' + oqsResponse.MarketOrders[i].Status)
        }
        expect(oqsResponse.MarketOrders[i].Total).to.be.equal(projection.invoices[i].invoiceTotal)
        expect(oqsResponse.MarketOrders[i].MarketShippingFee).to.be.equal(projection.shippingAmount)
        expect(oqsResponse.MarketOrders[i].PdfLink).to.be.equal(projection.invoices[i].pdfLink)
        expect(oqsResponse.MarketOrders[i].CreatedDate).to.not.be.null
        expect(oqsResponse.MarketOrders[i].UpdatedDate).to.not.be.null
        expect(oqsResponse.MarketOrders[i].DeliveryInfo).to.not.be.null
        // Verify if there are any Shipments
        // When Projection shipments lenght is 0, the OQS response will still have shipments with field DispatchedAtUtc.
        // Hence checking for length before verification starts
        //For shipments, only the first shipment is sent to OQS from order update service. Hence just checking for the first shipment and not all the shipments in the projection.
        if (projection.invoices[i].shipments.length !== 0) {
          expect(oqsResponse.MarketOrders[i].Shipment.Carrier).to.be.equal(projection.invoices[i].shipments[0].carrier)
          expect(oqsResponse.MarketOrders[i].Shipment.TrackingLink).to.be.equal(projection.invoices[i].shipments[0].trackingLink)
          expect(oqsResponse.MarketOrders[i].Shipment.TrackingNumber).to.be.equal(projection.invoices[i].shipments[0].trackingNumber)
        } else {
          expect(projection.invoices[i].shipments).to.be.empty
          expect(oqsResponse.MarketOrders[i].Shipment.Carrier).to.be.undefined
          expect(oqsResponse.MarketOrders[i].Shipment.TrackingLink).to.be.undefined
          expect(oqsResponse.MarketOrders[i].Shipment.TrackingNumber).to.be.undefined
        }
        // Verify if there are any refunds
        if (projection.invoices[i].refunds.length !== 0) {
          oqsResponse.MarketOrders[i].Refunds.forEach(function (oqsRefund, m) {
            expect(oqsRefund.Id).to.be.equal(projection.invoices[i].refunds[m].id)
            expect(oqsRefund.RefundAmount).to.be.equal(projection.invoices[i].refunds[m].refundAmount)
            expect(oqsRefund.Status).to.be.equal(projection.invoices[i].refunds[m].status)
            expect(oqsRefund.InitiatedBy).to.be.equal(projection.invoices[i].refunds[m].initiatedBy)
            expect(oqsRefund.UpdatedUtc).to.be.equal(projection.invoices[i].refunds[m].updatedUtc)
            // Notes
            expect(JSON.stringify(oqsRefund.Notes).toLowerCase()).to.deep.equal(JSON.stringify(projection.invoices[i].refunds[m].notes).toLowerCase())
            // RefundItems
            oqsRefund.RefundItems.forEach(function (oqsRefundItem, n) {
              expect(oqsRefundItem.Id).to.be.equal(projection.invoices[i].refunds[m].refundItems[n].id)
              expect(oqsRefundItem.Reason).to.be.equal(projection.invoices[i].refunds[m].refundItems[n].reason)
              expect(oqsRefundItem.Quantity).to.be.equal(projection.invoices[i].refunds[m].refundItems[n].quantity)
              expect(oqsRefundItem.Amount).to.be.equal(projection.invoices[i].refunds[m].refundItems[n].amount)
              expect(oqsRefundItem.Quantity).to.be.equal(projection.invoices[i].refunds[m].refundItems[n].quantity)
              expect(oqsRefundItem.StockCode).to.be.equal(projection.invoices[i].refunds[m].refundItems[n].lineItem.stockCode)
            })
          })
        } else {
          expect(projection.invoices[i].refunds).to.be.empty
          expect(oqsResponse.MarketOrders[i].Refunds).to.be.undefined
        }

        // Verify if there are any returns
        if (projection.invoices[i].returns.length !== 0) {
          oqsResponse.MarketOrders[i].Returns.forEach(function (oqsReturn, m) {
            expect(oqsReturn.ReturnId).to.be.equal(projection.invoices[i].returns[m].returnId)
            expect(oqsReturn.MarketRefundId).to.be.equal(projection.invoices[i].returns[m].marketRefundId)
            expect(oqsReturn.RefundAmount).to.be.equal(projection.invoices[i].returns[m].refundAmount)
            expect(oqsReturn.TrackingId).to.be.equal(projection.invoices[i].returns[m].trackingId)
            expect(oqsReturn.ConsignmentId).to.be.equal(projection.invoices[i].returns[m].consignmentId)
            expect(oqsReturn.CreatedUtc).to.be.equal(projection.invoices[i].returns[m].createdUtc)
            // Labels
            oqsReturn.Labels.forEach(function (oqsReturnLabel, p) {
              expect(oqsReturnLabel.Url).to.be.equal(projection.invoices[i].returns[m].labels[p].url)
            })
            // ReturnItems
            oqsReturn.ReturnItems.forEach(function (oqsReturnItem, n) {
              expect(oqsReturnItem.Id).to.be.equal(projection.invoices[i].returns[m].returnItems[n].id)
              oqsReturnItem.LineItems.forEach(function (oqsReturnLineItem, o) {
                expect(oqsReturnLineItem.Id).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].id)
                expect(oqsReturnLineItem.StockCode).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].stockCode)
                expect(oqsReturnLineItem.Quantity).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].quantity)
                expect(oqsReturnLineItem.Amount).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].amount)
                expect(oqsReturnLineItem.Reason).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].reason)
                expect(oqsReturnLineItem.Weight).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].weight)
                expect(oqsReturnLineItem.Notes).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].notes)
                expect(oqsReturnLineItem.TrackingId).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].trackingId)
                expect(oqsReturnLineItem.ConsignmentId).to.be.equal(projection.invoices[i].returns[m].returnItems[n].lineItems[o].consignmentId)
              })
            })
          })
        } else {
          expect(projection.invoices[i].returns).to.be.empty
          expect(oqsResponse.MarketOrders[i].Returns).to.be.undefined
        }

        // Products
        expect(oqsResponse.MarketOrders[i].Products[j].StockCode).to.be.equal(projection.invoices[i].lineItems[j].stockCode)
        expect(oqsResponse.MarketOrders[i].Products[j].Quantity).to.be.equal(projection.invoices[i].lineItems[j].quantity)
        expect(oqsResponse.MarketOrders[i].Products[j].RefundableQuantity).to.be.equal(projection.invoices[i].lineItems[j].refundableQuantity)
        expect(oqsResponse.MarketOrders[i].Products[j].Total).to.be.equal(projection.invoices[i].lineItems[j].totalAmount)
        expect(oqsResponse.MarketOrders[i].Products[j].SalePrice).to.be.equal(projection.invoices[i].lineItems[j].salePrice)
      })
    })
  })
}
