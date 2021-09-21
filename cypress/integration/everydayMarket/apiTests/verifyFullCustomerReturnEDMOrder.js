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
  describe('[API] RP-5097  Create Everyday Market items self service return - completely returned by the customer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('MPPF-962   Create Everyday Market items self service return - completely returned by the customer', () => {
      const testData = tests.customerSelfServiceReturn
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      const shopperId = shoppers.emAccount2.shopperId
      let totalMarketRefundAmount

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
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        }).then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
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
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).then((response) => {
            lib.verifyEventDetails(response, 'OrderPlaced', testData, shopperId, 1)
            lib.verifyEventDetails(response, 'MarketOrderPlaced', testData, shopperId, 1)
          })

          // Get customers current reward points balance before dispatch
          cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
            expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
            testData.rewardPointBefore = response.queryCardDetailsResp.pointBalance
            cy.log('rewardPointBefore: ' + testData.rewardPointBefore)
          })

          // Dispatch the complete order from MP and verify the events and order statuses
          cy.fullDispatchAnInvoice(testData.edmInvoiceId, testData.trackingNumber, testData.carrier, testData.sellerName).then((response) => {
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
            }).then((response) => {
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
                lib.verifyEventDetails(response, 'MarketOrderShipmentCreate', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
                lib.verifyEventDetails(response, 'MarketOrderDispatched', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
                lib.verifyEventDetails(response, 'MarketRewardsCredited', testData, shopperId, 1)
              })


              // Verify the MP and shipping invoices are available for the customer
              // TO-DO Verify the invoice content
              cy.verifyOrderInvoice(testData)

              // Initiate customer return
              const returnRequestLineItem = [{ stockCode: testData.items[0].stockCode, quantity: testData.items[0].quantity, amount: testData.items[0].pricePerItem, reason: 'Item is faulty', weight: 12, notes: 'Customer Return from EM Test Automation_Full_Return' }]
              cy.log(returnRequestLineItem)
              cy.customerReturn(testData.edmOrderId, testData.orderReference, returnRequestLineItem).then((response) => {
                totalMarketRefundAmount = response.refundAmount
                // Verify Order Projection details
                cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
                  function: function (response) {
                    if (response.body.invoices[0].refunds[0].status !== 'ReturnInitiated') {
                      cy.log('status was ' + response.body.invoices[0].refunds[0].status + ' instead of Return Initiated')
                      throw new Error('status was ' + response.body.invoices[0].refunds[0].status + ' instead of Return Initiated')
                    }
                  },
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout')
                }).then((response) => {
                  expect(response.invoices[0].invoiceStatus).to.be.equal('SENT')
                  expect(response.invoices[0].wowStatus).to.be.equal('Shipped')
                  expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
                  expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
                  expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
                  expect(response.invoices[0].lineItems[0].status).to.be.equal('ALLOCATED')
                  expect(response.invoices[0].refunds[0].status).to.be.equal('ReturnInitiated')
                  expect(response.invoices[0].refunds[0].refundItems[0].lineItem.quantity).to.be.equal(Number(testData.items[0].quantity))
                  expect(response.invoices[0].refunds[0].refundItems[0].lineItem.refundableQuantity).to.be.equal(0)
                  expect(response.invoices[0].refunds[0].refundItems[0].lineItem.quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
                  expect(response.invoices[0].returns[0].returnItems[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
                  expect(response.invoices[0].returns[0].returnItems[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
                  const encodedMarketRefundedId = response.invoices[0].returns[0].marketRefundId
                  //  verify the response status in graphQL endpoint
                  cy.refundRequestReturn(encodedMarketRefundedId).then((response) => {
                    expect(response.data.refundRequestReturn.refundRequest.status).to.be.equal('RETURNED')
                  }) // end of refund request return
                  // Verify Order Projection details
                  cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
                    function: function (response) {
                      if (response.body.invoices[0].invoiceStatus !== 'REFUNDED') {
                        cy.log('invoiceStatus was ' + response.body.invoices[0].invoiceStatus + ' instead of REFUNDED')
                        throw new Error('invoiceStatus was ' + response.body.invoices[0].invoiceStatus + ' instead of REFUNDED')
                      }
                    },
                    retries: Cypress.env('marketApiRetryCount'),
                    timeout: Cypress.env('marketApiTimeout')
                  }).then((response) => {
                    expect(response.invoices[0].invoiceStatus).to.be.equal('REFUNDED')
                    expect(response.invoices[0].wowStatus).to.be.equal('Shipped')
                    expect(response.invoices[0].orderTrackingStatus).to.be.equal('Cancelled')
                    expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
                    expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
                    expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
                    expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
                    expect(response.invoices[0].refunds[0].status).to.be.equal('Returned')
                    expect(response.invoices[0].refunds[0].initiatedBy).to.be.equal('BUYER')
                    expect(response.invoices[0].refunds[0].refundItems[0].lineItem.quantity).to.be.equal(Number(testData.items[0].quantity))
                    expect(response.invoices[0].refunds[0].refundItems[0].lineItem.refundableQuantity).to.be.equal(0)
                    expect(response.invoices[0].refunds[0].refundItems[0].lineItem.quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
                    expect(response.invoices[0].returns[0].returnItems[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
                    expect(response.invoices[0].returns[0].returnItems[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))

                    // Verify the MP and shipping invoices are available for the customer
                    // TO-DO Verify the invoice content
                    cy.verifyOrderInvoice(testData)
                    // Verify "Total Refund Amount" after Customer Return
                    lib.verifyRefundDetails(testData.orderId, totalMarketRefundAmount, testData.edmDeliveryCharges)

                    // Verify the reward points are credited to customers card after EDM dispatch
                    cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
                      testData.rewardPointAfter = response.queryCardDetailsResp.pointBalance
                      const expectedRewardsPoints = Number(testData.edmTotal) + Number(testData.rewardPointBefore)
                      cy.log('Testdata JSON: ' + JSON.stringify(testData))
                      cy.log('EDM Total: ' + testData.edmTotal)
                      cy.log('Previous Rewards Balance: ' + testData.rewardPointBefore)
                      cy.log('Current Rewards Balance: ' + testData.rewardPointAfter)
                      cy.log('Expected New Rewards Balance to be greated than: ' + expectedRewardsPoints)
                      expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(Number(expectedRewardsPoints))
                    })
                    // Verify the events api
                    cy.orderEventsApiWithRetry(orderReference, {
                      function: function (response) {
                        if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderRefund') ||
                        !response.body.data.some((element) => element.domainEvent === 'RefundCompleted')) {
                          cy.log('Expected MarketOrderRefund & RefundCompleted were not present')
                          throw new Error('Expected MarketOrderRefund & RefundCompleted were not present')
                        }
                      },
                      retries: Cypress.env('marketApiRetryCount'),
                      timeout: Cypress.env('marketApiTimeout')
                    }).then((response) => {
                      lib.verifyEventDetails(response, 'MarketOrderRefund', testData, shopperId, 1)
                      lib.verifyEventDetails(response, 'RefundCompleted', testData, shopperId, 1)
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
