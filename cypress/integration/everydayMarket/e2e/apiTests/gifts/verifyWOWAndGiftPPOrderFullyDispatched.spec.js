/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import rewardsDetails from '../../../../../fixtures/everydayMarket/rewards.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/search/api/commands/search'
import '../../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../../support/invoices/api/commands/commands'
import '../../../../../support/refunds/api/commands/commands'
import '../../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../../support/checkout/api/commands/confirmOrder'
import '../../../../../support/payment/api/commands/creditcard'
import '../../../../../support/payment/api/commands/digitalPayment'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import tests from '../../../../../fixtures/everydayMarket/apiTests.json'
import { verifyOrderTotals, verifyInitialOrderDetails, verifyEventDetails, verifyCommonOrderDetails, verifyRefundDetails, verifyOQSOrderStatus } from '../../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API] RP-5432 - EM| Gifting | Verify Gifting details on Checkout, Order Confirmation page and on MarketPlacer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5432 - EM| Gifting | Verify Gifting details on Checkout, Order Confirmation page and on MarketPlacer', () => {
      const testData = tests.GiftWOWPlusEDMPPPaymentTestData
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      const shopperId = shoppers.emAccountWithRewards5.shopperId
      const rewardsCardNumber = shoppers.emAccountWithRewards5.rewardsCardNumber

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(shoppers.emAccountWithRewards5, testData).then((response) => {
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        expect(response.Order.HasMarketOrderGiftingDetails).to.be.true
        cy.log('HasMarketOrderGiftingDetails tag is= ' + response.Order.HasMarketOrderGiftingDetails)
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        // Verify the order totals are as expected
        verifyOrderTotals(testData, response)

        // Invoke the order api and verify the projection content
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== 'Placed') {
              cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Placed')
              throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Placed')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        }).as('projection').then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
          // Verify the projection details
          verifyInitialOrderDetails(response, testData, shopperId)

          // Invoke the events api and verify the content
          cy.orderEventsApiWithRetry(orderReference, {
            function: function (response) {
              if (!response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                                !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced')) {
                cy.log('Expected OrderPlaced & MarketOrderPlaced were not present')
                throw new Error('Expected OrderPlaced & MarketOrderPlaced were not present')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).then((response) => {
            verifyEventDetails(response, 'OrderPlaced', testData, shopperId, 1)
            verifyEventDetails(response, 'MarketOrderPlaced', testData, shopperId, 1)
          })

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

          // Get customers current reward points balance before dispatch
          if (Cypress.env('marketRewardPointsValidationSwitch')) {
            cy.log('marketRewardPointsValidationSwitch is enabled. Performing validations.')

            cy.getRewardsCardDetails(rewardsDetails.partnerId, rewardsDetails.siteId, rewardsDetails.posId, rewardsDetails.loyaltySiteType, rewardsCardNumber).then((response) => {
              expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
              testData.rewardPointBefore = response.queryCardDetailsResp.pointBalance
            })
          }
          // Verify the gifting message has been passed to Marketplacer
          cy.get('@projection').then((projection) => {
            cy.getInvoiceDetails(projection.invoices[0].invoiceId).then((marketplaceInvoiceResponse) => {
              cy.get('@giftingResponse').then((giftingResponse) => {
                expect(marketplaceInvoiceResponse.data.node.order.messageToSeller).to.include(giftingResponse.Message)
                expect(marketplaceInvoiceResponse.data.node.order.messageToSeller).to.include(giftingResponse.Sender)
                expect(marketplaceInvoiceResponse.data.node.order.messageToSeller).to.include(giftingResponse.Recipient)
                cy.log('messageToSeller: ' + marketplaceInvoiceResponse.data.node.order.messageToSeller)
                cy.log(JSON.stringify(giftingResponse))
              })
            })
          })

          // Dispatch the complete order from MP and verify the events and order statuses
          cy.fullDispatchAnInvoice(testData.edmInvoiceId, testData.trackingNumber, testData.carrier, testData.items[0].sellerName).then((response) => {
            // After dispatch, Invoke the order api and verify the projection content is updated acordingly
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
              function: function (response) {
                if (response.body.invoices[0].wowStatus !== 'Shipped') {
                  cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                  throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
            }).as('finalProjection').then((response) => {
              // Order details
              verifyCommonOrderDetails(response, testData, shopperId)
              // Seller details
              expect(response.invoices[0].seller.sellerId).to.not.be.null
              expect(response.invoices[0].seller.sellerName).to.be.equal(testData.items[0].sellerName)
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
              cy.orderEventsApiWithRetry(orderReference, {
                function: function (response) {
                  if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
                                        !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched') ||
                                        !response.body.data.some((element) => element.domainEvent === 'MarketRewardsCredited')) {
                    cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
                    throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }).then((response) => {
                // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
                verifyEventDetails(response, 'MarketOrderShipmentCreate', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
                verifyEventDetails(response, 'MarketOrderDispatched', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
                verifyEventDetails(response, 'MarketRewardsCredited', testData, shopperId, 1)
              })

              // Verify the reward points are credited to customers card after EDM dispatch
              if (Cypress.env('marketRewardPointsValidationSwitch')) {
                cy.log('marketRewardPointsValidationSwitch is enabled. Performing validations.')

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
                  expect(response.queryCardDetailsResp.pointBalance).to.be.gte(expectedRewardsPoints)
                })
              }

              // Verify No refund details
              verifyRefundDetails(testData.orderId, 0, 0)

              // Verify the MP and shipping invoices are available for the customer
              // TO-DO Verify the invoice content
              cy.verifyOrderInvoice(testData)

              // Invoke OQS TMO api and validate it against the projection
              verifyOQSOrderStatus(testData.orderId, 'Received', false, testData)
            })
          })
        })
      })
    })
  })
})
