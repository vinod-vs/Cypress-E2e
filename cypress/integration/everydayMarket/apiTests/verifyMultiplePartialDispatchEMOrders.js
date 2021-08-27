/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/deliveryDateAndWindow/api/commands/deliveryDateAndWindow'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import tests from '../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API] MPPF-903 | EM | MPer | Multiple Partial Dispatch Everyday Market order via Marketplacer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('MPPF-903 | EM | MPer | Multiple Partial Dispatch Everyday Market order via Marketplacer', () => {
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

      // Login
      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      // Select a regular delivery slot
      cy.getRegularDeliveryTimeSlot(testData).then((response) => {
        cy.fulfilmentWithSpecificDeliveryDateAndTime(testData.deliveryAddressId, testData.timeSlotId, testData.windowDate).then((response) => {
          expect(response).to.have.property('IsSuccessful', true)
          expect(response).to.have.property('IsNonServiced', false)
        })
      })

      // clear the trolley before placing an order
      cy.clearTrolley().then((response) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      // Search for the desired products and add them to cart
      searchBody.SearchTerm = testData.searchTerm
      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)

        cy.getTestProductFromProductSearchResponse(response, testData)
      })

      // Checkout, make a CC payment and place the order
      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })
      cy.navigatingToCreditCardIframe().then((response) => {
        expect(response).to.have.property('Success', true)
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })
      cy.creditcardPayment(creditCardPayment, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText).to.be.eqls('ACCEPTED')
        digitalPayment.payments[0].paymentInstrumentId = response.itemId
      })
      cy.digitalPay(digitalPayment).then((response) => {
        expect(response.TransactionReceipt).to.not.be.null
        expect(response.PlacedOrderId).to.not.be.null
        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })

      // Confirm the orders or place the order
      cy.wait(Cypress.config('fiveSecondWait'))
      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, response)

        // Invoke the order api and verify the projection content
        cy.wait(Cypress.config('tenSecondWait') * 3)
        cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          lineItemLegacyId = response.invoices[0].lineItems[0].legacyId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
          // Verify the projection details
          verifyOrderDetails(response, testData, shopperId)

          // Invoke the events api and verify the content
          cy.wait(Cypress.config('twoSecondWait'))
          cy.events(shopperId, orderId, orderReference).then((response) => {
            lib.verifyEventDetails(response, 0, 'OrderPlaced', 2, testData, shopperId)
            lib.verifyEventDetails(response, 1, 'MarketOrderPlaced', 2, testData, shopperId)
          })

          // Get customers current reward points balance before dispatch
          cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
            expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
            testData.rewardPointBefore = response.queryCardDetailsResp.pointBalance
          })
          // Dispatch partial order with a unique tracking id
          trackingId1 = lib.generateRandomString()
          cy.log('First Tracking Id :' + trackingId1)
          const data1 = [{ line_item_id: lineItemLegacyId, quantity: 1 }]
          cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, data1, trackingId1, testData.carrier, testData.sellerName).then((response) => {
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

          trackingId2 = lib.generateRandomString()
          cy.log('Second Tracking Id :' + trackingId2)
          const data2 = [{ line_item_id: lineItemLegacyId, quantity: 1 }]
          cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, data2, trackingId2, testData.carrier, testData.sellerName).then((response) => {
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
        })
      })
    })
  })
})

function verifyOrderDetails (response, testData, shopperId) {
  // Common Order details
  lib.verifyCommonOrderDetails(response, testData, shopperId)

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
  // expect(response.invoices[0].lineItems[0].status).to.be.equal('ALLOCATED')
  // Rewards Details
  expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETPOINTS')
  expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.be.equal(0.1)
  expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))
}

function verifyOrderProjectionDetails (shopperId, orderId, testData, trackingId, orderReference, partialDispatchNumber) {
  cy.wait(Cypress.config('tenSecondWait') * 3)
  cy.log('Partial Dispatch :' + partialDispatchNumber + ':: Tracking ID ::' + trackingId)
  // After dispatch, Invoke the order api and verify the projection content is updated acordingly
  cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
    // Order details
    lib.verifyCommonOrderDetails(response, testData, shopperId)
    // Seller details
    expect(response.invoices[0].seller.sellerId).to.not.be.null
    expect(response.invoices[0].seller.sellerName).to.be.equal(testData.sellerName)
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
    expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETPOINTS')
    expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.be.equal(0.1)
    expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))

    // After dispatch, Invoke the events api and verify the events are updated acordingly
    cy.wait(Cypress.config('twoSecondWait'))
    cy.events(shopperId, orderId, orderReference).then((response) => {
      if (partialDispatchNumber === 1) {
        // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
        lib.verifyEventDetails(response, 2, 'MarketOrderShipmentCreate', 5, testData, shopperId)
        // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
        lib.verifyEventDetails(response, 3, 'MarketOrderDispatched', 5, testData, shopperId)
        // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
        lib.verifyEventDetails(response, 4, 'MarketRewardsCredited', 5, testData, shopperId)
      } else {
        // Verify there are  8 events. New event after dispatch is MarketOrderShipmentCreate
        lib.verifyEventDetails(response, 5, 'MarketOrderShipmentCreate', 8, testData, shopperId)
        // Verify there are  8 events. New event after dispatch is "MarketOrderDispatched"
        lib.verifyEventDetails(response, 6, 'MarketOrderDispatched', 8, testData, shopperId)
        // Verify there are  8 events. New event after dispatch is "MarketRewardsCredited"
        lib.verifyEventDetails(response, 7, 'MarketRewardsCredited', 8, testData, shopperId)
      }
    })

    // Verify the reward points are credited to customers card after EDM dispatch
    cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
      testData.rewardPointAfter = response.queryCardDetailsResp.pointBalance
      const expectedRewardsPoints = Number(testData.edmTotal) + Number(testData.rewardPointBefore)
      cy.log('Testdata JSON: ' + JSON.stringify(testData))
      cy.log('EDM Total: ' + testData.edmTotal)
      cy.log('Previous Rewards Balance: ' + testData.rewardPointBefore)
      cy.log('Expected New Rewards Balance: ' + expectedRewardsPoints + ' , OR: ' + Number(Number(expectedRewardsPoints) + 1))
      expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
      // Rewards has a logic of rouding to an even number if odd
      // expect(response.queryCardDetailsResp.pointBalance).to.be.equal(expectedRewardsPoints)
      if (partialDispatchNumber === 1) {
        const expectedRewardsPtsPartialDispatch = expectedRewardsPoints - 10
        expect(response.queryCardDetailsResp.pointBalance).to.be.within(expectedRewardsPtsPartialDispatch, Number(expectedRewardsPtsPartialDispatch) + 1)
      } else {
        expect(response.queryCardDetailsResp.pointBalance).to.be.within(expectedRewardsPoints, Number(expectedRewardsPoints) + 1)
      }
    })
  })
}
