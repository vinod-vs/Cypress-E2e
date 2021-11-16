/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import rewardsDetails from '../../../fixtures/everydayMarket/rewards.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/refunds/api/commands/commands'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import tests from '../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../support/everydayMarket/api/commands/commonHelpers'

const rewardsCardNumber = shoppers.emAccount2.rewardsCardNumber
TestFilter(['EDM', 'API'], () => {
  describe('[API] RP-5040 - Multiple Partial Dispatch Everyday Market order via Marketplacer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5040 - Multiple Partial Dispatch Everyday Market order via Marketplacer', () => {
      const testData = tests.VerifyMultiplePartialDispatchedEDMOrder
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      const shopperId = shoppers.emAccount2.shopperId
      let lineItemLegacyId
      let trackingId1
      let trackingId2
      let partialDispatchNumber

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(shoppers.emAccount2, testData).then((response) => {
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, response)

        // Invoke the order api and verify the projection content
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== 'Placed') {
              cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Placed')
              throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Placed')
            }
          },
          retries: 10,
          timeout: 5000
        }).then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          lineItemLegacyId = response.invoices[0].lineItems[0].legacyId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
          // Verify the projection details
          lib.verifyInitialOrderDetails(response, testData, shopperId)

          // Invoke the events api and verify the content
          cy.orderEventsApiWithRetry(orderReference, {
            function: function (response) {
              if (!response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced')) {
                cy.log('Expected OrderPlaced & MarketOrderPlaced were not present')
                throw new Error('Expected OrderPlaced & MarketOrderPlaced were not present')
              }
            },
            retries: 15,
            timeout: 5000
          }).then((response) => {
            lib.verifyEventDetails(response, 'OrderPlaced', testData, shopperId, 1)
            lib.verifyEventDetails(response, 'MarketOrderPlaced', testData, shopperId, 1)
          })

          // Get customers current reward points balance before dispatch
          cy.getRewardsCardDetails(rewardsDetails.partnerId, rewardsDetails.siteId, rewardsDetails.posId, rewardsDetails.loyaltySiteType, rewardsCardNumber).then((response) => {
            expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
            testData.rewardPointBefore = response.queryCardDetailsResp.pointBalance
          })

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

          // Dispatch partial order with a unique tracking id
          trackingId1 = lib.generateRandomString()
          cy.log('First Tracking Id :' + trackingId1)
          const data1 = [{ line_item_id: lineItemLegacyId, quantity: 1 }]
          cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, data1, trackingId1, testData.carrier, testData.items[0].sellerName).then((response) => {
            partialDispatchNumber = 1
            expect(response.data.attributes.shipment_tracking_number).to.be.equal(trackingId1)
            expect(response.data.attributes.shipment_carrier).to.be.equal(testData.carrier)
            expect(Number(response.data.relationships.invoice.id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.data.relationships.line_items[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].attributes.invoice_id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.included[1].attributes.line_item_id)).to.be.equal(lineItemLegacyId)
            // verify order projection
            verifyOrderProjectionDetails(shopperId, orderId, testData, trackingId1, orderReference, partialDispatchNumber)
          })

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

          trackingId2 = lib.generateRandomString()
          cy.log('Second Tracking Id :' + trackingId2)
          const data2 = [{ line_item_id: lineItemLegacyId, quantity: 1 }]
          cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, data2, trackingId2, testData.carrier, testData.items[0].sellerName).then((response) => {
            partialDispatchNumber = 2
            expect(response.data.attributes.shipment_tracking_number).to.be.equal(trackingId2)
            expect(response.data.attributes.shipment_carrier).to.be.equal(testData.carrier)
            expect(Number(response.data.relationships.invoice.id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.data.relationships.line_items[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].attributes.invoice_id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.included[1].attributes.line_item_id)).to.be.equal(lineItemLegacyId)
            // verify order projection
            verifyOrderProjectionDetails(shopperId, orderId, testData, trackingId2, orderReference, partialDispatchNumber)
          })

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

          // Verify NO refund details
          lib.verifyRefundDetails(testData.orderId, 0, 0)
        })
        // Invoke OQS TMO api and validate it against the projection
        lib.verifyOQSOrderStatus(testData.orderId, 'Received', false, testData)
      })
    })
  })
})

function verifyOrderProjectionDetails (shopperId, orderId, testData, trackingId, orderReference, partialDispatchNumber) {
  cy.log('Partial Dispatch :' + partialDispatchNumber + ':: Tracking ID ::' + trackingId)
  // After dispatch, Invoke the order api and verify the projection content is updated acordingly
  cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
    function: function (response) {
      if (partialDispatchNumber === 1) {
        if (response.body.invoices[0].wowStatus !== 'PartiallyShipped') {
          cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of PartiallyShipped')
          throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of PartiallyShipped')
        }
      } else {
        if (response.body.invoices[0].wowStatus !== 'Shipped') {
          cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of PartiallyShipped')
          throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of PartiallyShipped')
        }
      }
    },
    retries: 10,
    timeout: 5000
  }).as('finalProjection').then((response) => {
    // Order details
    lib.verifyCommonOrderDetails(response, testData, shopperId)
    // Seller details
    expect(response.invoices[0].seller.sellerId).to.not.be.null
    expect(response.invoices[0].seller.sellerName).to.be.equal(testData.items[0].sellerName)
    // Invoice details
    if (partialDispatchNumber === 1) {
      expect(response.invoices[0].invoiceStatus).to.be.equal('PARTIALLY_SENT')
      expect(response.invoices[0].wowStatus).to.be.equal('PartiallyShipped')
      expect(response.invoices[0].orderTrackingStatus).to.be.equal('PartiallySent')
      expect(response.invoices[0].shipments.length).to.be.equal(1)
      // refundable quantity is 1 for the first dispatch
      expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(1)
      // Shipments
      expect(response.invoices[0].shipments[0].shippedItems[0].quantity).to.be.equal(1)
      expect(response.invoices[0].shipments.length).to.be.equal(1)
      expect(response.invoices[0].shipments[0].trackingNumber).to.be.equal(trackingId)
      expect(response.invoices[0].shipments[0].carrier).to.be.equal(testData.carrier)
      expect(response.invoices[0].shipments[0].shipmentItemId).to.not.be.null
      expect(response.invoices[0].shipments[0].trackingLink).to.not.be.null
      expect(response.invoices[0].shipments[0].dispatchedAtUtc).to.not.be.null
      expect(response.invoices[0].shipments[0].shippedItems.length).to.be.equal(1)
      expect(response.invoices[0].shipments[0].shippedItems[0].variantId).to.be.equal(response.invoices[0].lineItems[0].variantId)
      expect(response.invoices[0].shipments[0].shippedItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
    } else {
      expect(response.invoices[0].invoiceStatus).to.be.equal('SENT')
      expect(response.invoices[0].wowStatus).to.be.equal('Shipped')
      expect(response.invoices[0].orderTrackingStatus).to.be.equal('Shipped')
      expect(response.invoices[0].shipments.length).to.be.equal(2)
      // refundable quantity is 1 for the first dispatch
      expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(2)
      // Shipments
      expect(response.invoices[0].shipments[1].shippedItems[0].quantity).to.be.equal(1)
      expect(response.invoices[0].shipments.length).to.be.equal(2)
      expect(response.invoices[0].shipments[1].trackingNumber).to.be.equal(trackingId)
      expect(response.invoices[0].shipments[1].carrier).to.be.equal(testData.carrier)
      expect(response.invoices[0].shipments[1].shipmentItemId).to.not.be.null
      expect(response.invoices[0].shipments[1].trackingLink).to.not.be.null
      expect(response.invoices[0].shipments[1].dispatchedAtUtc).to.not.be.null
      expect(response.invoices[0].shipments[1].shippedItems.length).to.be.equal(1)
      expect(response.invoices[0].shipments[1].shippedItems[0].variantId).to.be.equal(response.invoices[0].lineItems[0].variantId)
      expect(response.invoices[0].shipments[1].shippedItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
    }
    expect(response.invoices[0].wowId).to.not.be.null
    expect(response.invoices[0].lineItems.length).to.be.equal(1)
    expect(response.invoices[0].legacyId).to.not.be.null
    expect(response.invoices[0].legacyIdFormatted).to.not.be.null
    expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
    expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
    expect(response.invoices[0].refunds.length).to.be.equal(0)
    expect(response.invoices[0].pdfLink).to.not.be.null
    expect(response.invoices[0].legacyIdFormatted).to.be.equal(testData.edmOrderId)
    // Line item details
    expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
    expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
    expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
    expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
    expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
    expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
    expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
    expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
    expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
    expect(response.invoices[0].lineItems[0].status).to.be.equal('ALLOCATED')
    // Rewards Details
    // expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETPOINTS')
    expect(response.invoices[0].lineItems[0].reward.offerId).to.not.be.null
    expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.not.be.null
    expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))

    // After dispatch, Invoke the events api and verify the events are updated acordingly
    cy.orderEventsApiWithRetry(orderReference, {
      function: function (response) {
        if (partialDispatchNumber === 1) {
          if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
            !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched') ||
            !response.body.data.some((element) => element.domainEvent === 'MarketRewardsCredited')) {
            cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
            throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
          }
        } else {
          if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
            !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched') ||
            !response.body.data.some((element) => element.domainEvent === 'MarketRewardsCredited')) {
            cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
            throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
          }
        }
      },
      retries: 15,
      timeout: 5000
    }).then((response) => {
      if (partialDispatchNumber === 1) {
        // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
        lib.verifyEventDetails(response, 'MarketOrderShipmentCreate', testData, shopperId, 1)
        // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
        lib.verifyEventDetails(response, 'MarketOrderDispatched', testData, shopperId, 1)
        // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
        lib.verifyEventDetails(response, 'MarketRewardsCredited', testData, shopperId, 1)
      } else {
        // Verify there are  8 events. New event after dispatch is MarketOrderShipmentCreate
        lib.verifyEventDetails(response, 'MarketOrderShipmentCreate', testData, shopperId, 2)
        // Verify there are  8 events. New event after dispatch is "MarketOrderDispatched"
        lib.verifyEventDetails(response, 'MarketOrderDispatched', testData, shopperId, 2)
        // Verify there are  8 events. New event after dispatch is "MarketRewardsCredited"
        lib.verifyEventDetails(response, 'MarketRewardsCredited', testData, shopperId, 2)
      }
    })

    // Verify the reward points are credited to customers card after EDM dispatch
    cy.getRewardsCardDetails(rewardsDetails.partnerId, rewardsDetails.siteId, rewardsDetails.posId, rewardsDetails.loyaltySiteType, rewardsCardNumber).then((response) => {
      testData.rewardPointAfter = response.queryCardDetailsResp.pointBalance
      const expectedRewardsPoints = Math.floor(Number(testData.edmTotal) + Number(testData.rewardPointBefore))
      cy.log('Testdata JSON: ' + JSON.stringify(testData))
      cy.log('EDM Total: ' + testData.edmTotal)
      cy.log('Previous Rewards Balance: ' + testData.rewardPointBefore)
      cy.log('Expected New Rewards Balance: ' + Math.floor(expectedRewardsPoints) + ' , OR: ' + Number(Number(Math.round(expectedRewardsPoints + 1))))
      expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
      // Rewards has a logic of rouding to an even number if odd
      // expect(response.queryCardDetailsResp.pointBalance).to.be.equal(expectedRewardsPoints)
      if (partialDispatchNumber === 1) {
        const expectedRewardsPtsPartialDispatch = Math.floor(expectedRewardsPoints - testData.items[0].pricePerItem)
        expect(response.queryCardDetailsResp.pointBalance).to.be.gte(expectedRewardsPtsPartialDispatch)
      } else {
        expect(response.queryCardDetailsResp.pointBalance).to.be.gte(expectedRewardsPoints)
      }
    })
  })
}
