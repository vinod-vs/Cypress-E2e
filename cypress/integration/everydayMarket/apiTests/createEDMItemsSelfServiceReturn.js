/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/invoices/api/commands/commands'
import '../../../support/refunds/api/commands/commands'
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
  describe('[API] RP-5097 | EM | MPer | Create Everyday Market items self service return - completely returned by the customer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('MPPF-962 | EM | MPer | Create Everyday Market items self service return - completely returned by the customer', () => {
      const testData = tests.VerifyFullyDispatchedEDMOrder
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      const shopperId = shoppers.emAccount2.shopperId

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
        cy.wait(Cypress.config('tenSecondWait') * 3)
        cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
          // Verify the projection details
          verifyOrderDetails(response, testData, shopperId)

          // Invoke the events api and verify the content
          cy.wait(Cypress.config('twoSecondWait'))
          cy.events(shopperId, orderId, orderReference).then((response) => {
            lib.verifyEventDetails(response, 0, 'OrderPlaced', 2, testData, shopperId)
            lib.verifyEventDetails(response, 1, 'MarketOrderPlaced', 2, testData, shopperId)
          })

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

          // Get customers current reward points balance before dispatch
          cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
            expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
            testData.rewardPointBefore = response.queryCardDetailsResp.pointBalance
          })

          // Dispatch the complete order from MP and verify the events and order statuses
          cy.fullDispatchAnInvoice(testData.edmInvoiceId, testData.trackingNumber, testData.carrier, testData.sellerName).then((response) => {
            cy.wait(Cypress.config('tenSecondWait') * 3)

            // After dispatch, Invoke the order api and verify the projection content is updated acordingly
            cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
              // Order details
              lib.verifyCommonOrderDetails(response, testData, shopperId)
              // Seller details
              expect(response.invoices[0].seller.sellerId).to.not.be.null
              expect(response.invoices[0].seller.sellerName).to.be.equal(testData.sellerName)
              // Invoice details
              expect(response.invoices[0].invoiceStatus).to.be.equal('SENT')
              expect(response.invoices[0].wowStatus).to.be.equal('Shipped')
              expect(response.invoices[0].wowId).to.not.be.null
              expect(response.invoices[0].shipments.length).to.be.equal(1)
              expect(response.invoices[0].lineItems.length).to.be.equal(1)
              expect(response.invoices[0].legacyId).to.not.be.null
              expect(response.invoices[0].legacyIdFormatted).to.not.be.null
              expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
              expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
              expect(response.invoices[0].refunds.length).to.be.equal(0)
              expect(response.invoices[0].orderTrackingStatus).to.be.equal('Shipped')
              expect(response.invoices[0].pdfLink).to.not.be.null
              expect(response.invoices[0].legacyIdFormatted).to.be.equal(testData.edmOrderId)
              // Line item details
              expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
              expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
              expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
              expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
              expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
              expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
              expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(Number(testData.items[0].quantity))
              expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
              expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
              expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
              expect(response.invoices[0].lineItems[0].status).to.be.equal('ALLOCATED')
              // Shipments
              expect(response.invoices[0].shipments.length).to.be.equal(1)
              expect(response.invoices[0].shipments[0].carrier).to.be.equal(testData.carrier)
              expect(response.invoices[0].shipments[0].shipmentItemId).to.not.be.null
              expect(response.invoices[0].shipments[0].trackingLink).to.not.be.null
              expect(response.invoices[0].shipments[0].trackingNumber).to.be.equal(testData.trackingNumber)
              expect(response.invoices[0].shipments[0].dispatchedAtUtc).to.not.be.null
              expect(response.invoices[0].shipments[0].shippedItems.length).to.be.equal(1)
              expect(response.invoices[0].shipments[0].shippedItems[0].variantId).to.be.equal(response.invoices[0].lineItems[0].variantId)
              expect(response.invoices[0].shipments[0].shippedItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
              expect(response.invoices[0].shipments[0].shippedItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
              // Rewards Details
              // expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETPOINTS')
              expect(response.invoices[0].lineItems[0].reward.offerId).to.not.be.null
              expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.not.be.null
              expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))

              // After dispatch, Invoke the events api and verify the events are updated acordingly
              cy.wait(Cypress.config('twoSecondWait'))
              cy.events(shopperId, orderId, orderReference).then((response) => {
                // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
                lib.verifyEventDetails(response, 2, 'MarketOrderShipmentCreate', 5, testData, shopperId)
                // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
                lib.verifyEventDetails(response, 3, 'MarketOrderDispatched', 5, testData, shopperId)
                // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
                lib.verifyEventDetails(response, 4, 'MarketRewardsCredited', 5, testData, shopperId)
              })

              // Verify the reward points are credited to customers card after EDM dispatch
              cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
                testData.rewardPointAfter = response.queryCardDetailsResp.pointBalance
                const expectedRewardsPoints = Number(testData.edmTotal) + Number(testData.rewardPointBefore)
                cy.log('Testdata JSON: ' + JSON.stringify(testData))
                cy.log('EDM Total: ' + testData.edmTotal)
                cy.log('Previous Rewards Balance: ' + testData.rewardPointBefore)
                cy.log('Expected New Rewards Balance: ' + Math.floor(expectedRewardsPoints) + ' , OR: ' + Number(Number(Math.round(expectedRewardsPoints + 1))))
                expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
                // Rewards has a logic of rouding to an even number if odd
                // expect(response.queryCardDetailsResp.pointBalance).to.be.equal(expectedRewardsPoints)
                expect(response.queryCardDetailsResp.pointBalance).to.be.within(Math.floor(expectedRewardsPoints), Number(Math.round(expectedRewardsPoints + 1)))
              })

              // Verify No refund details
              lib.verifyRefundDetails(testData.orderId, 0, 0)

              // Verify the MP and shipping invoices are available for the customer
              // TO-DO Verify the invoice content
              cy.verifyOrderInvoice(testData)
            })
            // ADDING RETURN API LOGIC AS IT HAS TO BE CHAINED BECAUSE IT USES ORDERREF / EM Order Id etc..
            cy.wait(Cypress.config('twoSecondWait'))
            cy.log('Calling partialCustomerReturn Method')
            // cy.partialCustomerReturn(edmOrderId, orderReference, 1073744438, 1, 31.49)
            // cy.partialCustomerReturn(testData.edmOrderId, testData.orderReference, testData.items[0].stockCode, testData.items[0].quantity-1, testData.items[0].pricePerItem)
            // WITH DATA ARRAY APPROACH AS TEMPLATE-
            // const data1 = [{line_item_id: 32422, quantity: 1}]
            // const returnRequestData = [{quantity: testData.items[0].quantity-1}]
            const returnRequestLineItem = [{ stockCode: testData.items[0].stockCode, quantity: testData.items[0].quantity, amount: testData.items[0].pricePerItem, reason: 'Item is faulty', weight: 12, notes: 'Customer Return from EM Test Automation_Partial_Return' }]
            // const returnRequestMultipleLineItem = [{stockCode:testData.items[0].stockCode, quantity:testData.items[0].quantity-1, amount:testData.items[0].pricePerItem, reason:"Item is faulty", weight:1, notes:"Customer Return from EM Test Automation_Partial_Return" },
            //                                       {stockCode:testData.items[1].stockCode, quantity:testData.items[1].quantity-1, amount:testData.items[1].pricePerItem, reason:"Change of mind", weight:2, notes:"Customer Return from EM Test Automation_Partial_Return" }]
            // cy.partialDispatchOfLineItemsInInvoice(27208, data1, "123456", "Australia Post", "Pet Culture")
            // cy.partialCustomerReturn(testData.edmOrderId, testData.orderReference, testData.items[0].stockCode, returnRequestData, testData.items[0].pricePerItem)
            cy.log(returnRequestLineItem)
            cy.customerReturn(testData.edmOrderId, testData.orderReference, returnRequestLineItem)
            cy.log('Called CustomerReturn Method Completed')
          })
        })
      })
    })
  })
})

function verifyOrderDetails(response, testData, shopperId) {
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
  // expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETPOINTS')
  expect(response.invoices[0].lineItems[0].reward.offerId).to.not.be.null
  expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.not.be.null
  expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))
}
