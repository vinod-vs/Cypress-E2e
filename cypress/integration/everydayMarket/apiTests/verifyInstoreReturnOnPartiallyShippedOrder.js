/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import rewardsDetails from '../../../fixtures/everydayMarket/rewards.json'
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
import shipment from '../../../fixtures/everydayMarket/shipment.json'

TestFilter(['EDM-API'], () => {
  describe('[API] RP-5215 - Instore Return On Partially Shipped Order', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5215 - Instore Return On Partially Shipped Order', () => {
      const testData = tests.VerifyInstoreReturnOnPartiallyShippedEDMOrder
      let marketRefundId
      let totalMarketRefundAmount
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      const shopperId = shoppers.emAccount2.shopperId
      const rewardsCardNumber = shoppers.emAccount2.rewardsCardNumber
      let trackingId
      let lineItemLegacyId
      const dispatchQty = 1
      let encodedInvoiceId
      let encodedLineItem

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
          cy.log('Testdata JSON: ' + JSON.stringify(testData))
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          lineItemLegacyId = response.invoices[0].lineItems[0].legacyId
          encodedLineItem = response.invoices[0].lineItems[0].lineItemId
          encodedInvoiceId = response.invoices[0].invoiceId
          
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId + ' , EncodedInvoiceId: ' + encodedInvoiceId + ' , EncodedLineItemLegacyId: ' + encodedLineItem)
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
          cy.getRewardsCardDetails(rewardsDetails.partnerId, rewardsDetails.siteId, rewardsDetails.posId, rewardsDetails.loyaltySiteType, rewardsCardNumber).then((response) => {
            expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
            testData.rewardPointBefore = response.queryCardDetailsResp.pointBalance
          })
          // Dispatch partial order with a unique tracking id
          cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, [{ line_item_id: lineItemLegacyId, quantity: dispatchQty }], shipment.postageTrackingnumber, testData.carrier, testData.items[0].sellerName).then((response) => {
            expect(response.data.attributes.shipment_tracking_number).to.be.equal(shipment.postageTrackingnumber)
            expect(response.data.attributes.shipment_carrier).to.be.equal(testData.carrier)
            expect(Number(response.data.relationships.invoice.id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.data.relationships.line_items[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].attributes.invoice_id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.included[1].attributes.line_item_id)).to.be.equal(lineItemLegacyId)

            // Verify the projections
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, testData.orderId, {
              function: function (response) {
                if (response.body.invoices[0].wowStatus !== 'PartiallyShipped') {
                  throw new Error('Still not shipped yet')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
            }).then((response) => {
              expect(response.invoices[0].invoiceStatus).is.equal('PARTIALLY_SENT')
              expect(response.invoices[0].wowStatus).is.equal('PartiallyShipped')
              // Validate line items
              expect(response.invoices[0].lineItems[0].refundableQuantity).is.equal(dispatchQty)
              // Validate refunds
              expect(response.invoices[0].refunds).is.empty
              // Validate shipments
              expect(response.invoices[0].shipments[0].carrier).is.equal(shipment.postageCarrier)
              expect(response.invoices[0].shipments[0].trackingNumber).is.equal(shipment.postageTrackingnumber)
              expect(response.invoices[0].shipments[0].shippedItems[0].stockCode).is.equal(testData.items[0].stockCode)
              expect(response.invoices[0].shipments[0].shippedItems[0].quantity).is.equal(dispatchQty)
              // Create a Instore Return initiated by ADMIN
              cy.refundRequestCreateInitiatedBy(encodedInvoiceId, encodedLineItem, dispatchQty, true, 'ADMIN').then((response) => {
                expect(response.data.refundRequestCreate.refundRequest.status).to.equals('AWAITING')

                // Verify the projections
                cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, testData.orderId, {
                  function: function (response) {
                    if (response.body.invoices[0].refunds[0].status !== 'ReturnInitiated') {
                      throw new Error('status was ' + response.body.invoices[0].refunds[0].status + ' instead of Return Initiated')
                    }
                  },
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout')
                }).then((response) => {
                  // Validate refunds
                  expect(response.invoices[0].refunds[0].status).is.equal('ReturnInitiated')
                  expect(response.invoices[0].refunds[0].refundItems[0].quantity).is.equal(dispatchQty)
                  const encodedMarketRefundedId = response.invoices[0].refunds[0].id
                  totalMarketRefundAmount = response.invoices[0].refunds[0].refundAmount
                  //  verify the response status in graphQL endpoint
                  cy.refundRequestReturn(encodedMarketRefundedId).then((response) => {
                    expect(response.data.refundRequestReturn.refundRequest.status).to.be.equal('RETURNED')
                  }) // end of refund request return 
                  // start
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
                  }).as('finalProjection').then((response) => {
                    expect(response.invoices[0].invoiceStatus).to.be.equal('REFUNDED')
                    expect(response.invoices[0].wowStatus).to.be.equal('Shipped')
                    expect(response.invoices[0].orderTrackingStatus).to.be.equal('Cancelled')
                    expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
                    expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
                    expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
                    expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
                    expect(response.invoices[0].refunds[0].status).to.be.equal('Returned')
                    expect(response.invoices[0].refunds[0].initiatedBy).to.be.equal('ADMIN')

                    // Verify the MP and shipping invoices are available for the customer
                    // TO-DO Verify the invoice content
                    cy.verifyOrderInvoice(testData)
                    // Verify "Partial Refund Amount" after Admin initiated Return
                    lib.verifyRefundDetails(testData.orderId, totalMarketRefundAmount, 0)

                    // Verify the reward points are credited to customers card after EDM dispatch
                    cy.getRewardsCardDetails(rewardsDetails.partnerId, rewardsDetails.siteId, rewardsDetails.posId, rewardsDetails.loyaltySiteType, rewardsCardNumber).then((response) => {
                      testData.rewardPointAfter = response.queryCardDetailsResp.pointBalance
                      const totalDispatchAmount = Math.floor(Number(testData.edmTotal)) - Math.floor(Number(testData.items[0].pricePerItem * dispatchQty))
                      cy.log('totalDispatchAmount: ' + totalDispatchAmount)
                      const expectedRewardsPoints = totalDispatchAmount + Number(testData.rewardPointBefore)
                      cy.log('Testdata JSON !: ' + JSON.stringify(testData))
                      cy.log('EDM Total: ' + testData.edmTotal)
                      cy.log('Previous Rewards Balance: ' + testData.rewardPointBefore)
                      cy.log('Current Rewards Balance: ' + testData.rewardPointAfter)
                      cy.log('Expected New Rewards Balance to be greated than: ' + expectedRewardsPoints)
                      expect(response.queryCardDetailsResp.pointBalance).to.be.gte(expectedRewardsPoints)
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

                    // Invoke OQS TMO api and validate it against the projection
                    lib.verifyOQSOrderStatus(testData.orderId, 'Received', false, testData)
                  })

                  // end
                })
              })
            })
          })
        })
      })
    })
  })
})
