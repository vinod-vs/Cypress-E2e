/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import rewardsDetails from '../../../../../fixtures/everydayMarket/rewards.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/search/api/commands/search'
import '../../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../../support/checkout/api/commands/confirmOrder'
import '../../../../../support/payment/api/commands/creditcard'
import '../../../../../support/payment/api/commands/digitalPayment'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/refunds/api/commands/commands'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import tests from '../../../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API', 'EDM-E2E-API', 'E2E-Scenario-1'], () => {
  describe('[API] RP-5041 - Full cancellation of Everyday Market order via Marketplacer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5041 - Full cancellation of Everyday Market order via Marketplacer', () => {
      const testData = tests.VerifyFullCancellationOfEDMOrder
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      let encodedEdmInvoiceId
      let encodedEdmLineitemId
      const shopperId = shoppers.emAccountWithRewards17.shopperId
      const rewardsCardNumber =
        shoppers.emAccountWithRewards17.rewardsCardNumber

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(
        shoppers.emAccountWithRewards17,
        testData
      ).then((response) => {
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log(
          'This is the order id: ' +
            response.Order.OrderId +
            ', Order ref: ' +
            response.Order.OrderReference
        )

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, response)

        // Invoke the order api and verify the projection content
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== 'Placed') {
              cy.log(
                'wowStatus was ' +
                  response.body.invoices[0].wowStatus +
                  ' instead of Placed'
              )
              throw new Error(
                'wowStatus was ' +
                  response.body.invoices[0].wowStatus +
                  ' instead of Placed'
              )
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout'),
        }).then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          encodedEdmInvoiceId = response.invoices[0].invoiceId
          encodedEdmLineitemId = response.invoices[0].lineItems[0].lineItemId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId

          testData.encodedEdmInvoiceId = encodedEdmInvoiceId
          testData.encodedEdmLineitemId = encodedEdmLineitemId
          cy.log(
            'This is the MPOrder Id: ' +
              edmOrderId +
              ', MPInvoice Id: ' +
              edmInvoiceId +
              ' , MP InvoiceId: ' +
              encodedEdmInvoiceId +
              ' , MPencodedEdmLineitemId: ' +
              encodedEdmLineitemId
          )
          // Verify the projection details
          lib.verifyInitialOrderDetails(response, testData, shopperId)

          // Invoke the events api and verify the content
          cy.orderEventsApiWithRetry(orderReference, {
            function: function (response) {
              if (
                !response.body.data.some(
                  (element) => element.domainEvent === 'OrderPlaced'
                ) ||
                !response.body.data.some(
                  (element) => element.domainEvent === 'MarketOrderPlaced'
                )
              ) {
                cy.log(
                  'Expected OrderPlaced & MarketOrderPlaced were not present'
                )
                throw new Error(
                  'Expected OrderPlaced & MarketOrderPlaced were not present'
                )
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout'),
          }).then((response) => {
            lib.verifyEventDetails(
              response,
              'OrderPlaced',
              testData,
              shopperId,
              1
            )
            lib.verifyEventDetails(
              response,
              'MarketOrderPlaced',
              testData,
              shopperId,
              1
            )
          })

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

          // Get customers current reward points balance before seller cancellation
          if (Cypress.env('marketRewardPointsValidationSwitch')) {
            cy.log(
              'marketRewardPointsValidationSwitch is enabled. Performing validations.'
            )

            cy.getRewardsCardDetails(
              rewardsDetails.partnerId,
              rewardsDetails.siteId,
              rewardsDetails.posId,
              rewardsDetails.loyaltySiteType,
              rewardsCardNumber
            ).then((response) => {
              expect(
                response.queryCardDetailsResp.pointBalance
              ).to.be.greaterThan(0)
              testData.rewardPointBefore =
                response.queryCardDetailsResp.pointBalance
            })
          }
          // Seller cancells all the EM items and verify the events and order statuses
          cy.cancelLineItemInInvoice(
            encodedEdmInvoiceId,
            encodedEdmLineitemId,
            testData.items[0].quantity,
            false
          ).then((response) => {
            // After Seller cancellation, Invoke the order api and verify the projection content is updated acordingly for refunds
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
              shopperId,
              orderId,
              {
                function: function (response) {
                  if (
                    response.body.invoices[0].wowStatus !== 'SellerCancelled' ||
                    response.body.invoices[0].invoiceStatus !== 'REFUNDED' ||
                    response.body.invoices[0].lineItems[0].status !== 'REFUNDED'
                  ) {
                    cy.log(
                      'wowStatus was ' +
                        response.body.invoices[0].wowStatus +
                        ' instead of SellerCancelled, invoiceStatus was ' +
                        response.body.invoices[0].invoiceStatus +
                        ' instead of REFUNDED, line items status was ' +
                        response.body.invoices[0].lineItems[0].status +
                        ' instead of REFUNDED'
                    )
                    throw new Error(
                      'wowStatus was ' +
                        response.body.invoices[0].wowStatus +
                        ' instead of SellerCancelled, invoiceStatus was ' +
                        response.body.invoices[0].invoiceStatus +
                        ' instead of REFUNDED, line items status was ' +
                        response.body.invoices[0].lineItems[0].status +
                        ' instead of REFUNDED'
                    )
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout'),
              }
            )
              .as('finalProjection')
              .then((response) => {
                // Order details
                lib.verifyCommonOrderDetails(response, testData, shopperId)
                // Seller details
                expect(response.invoices[0].seller.sellerId).to.not.be.null
                expect(response.invoices[0].seller.sellerName).to.be.equal(
                  testData.items[0].sellerName
                )
                // Verifying Invoice details after seller cancellation
                expect(response.invoices[0].invoiceStatus).to.be.equal(
                  'REFUNDED'
                )
                expect(response.invoices[0].wowStatus).to.be.equal(
                  'SellerCancelled'
                )
                expect(response.invoices[0].wowId).to.not.be.null
                expect(response.invoices[0].lineItems.length).to.be.equal(1)
                expect(response.invoices[0].legacyId).to.not.be.null
                expect(response.invoices[0].legacyIdFormatted).to.not.be.null
                expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
                expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
                expect(response.invoices[0].refunds.length).to.be.equal(1)
                expect(response.invoices[0].orderTrackingStatus).to.be.equal(
                  'Cancelled'
                )
                expect(response.invoices[0].pdfLink).to.not.be.null
                expect(response.invoices[0].legacyIdFormatted).to.be.equal(
                  testData.edmOrderId
                )
                // shipments
                expect(response.invoices[0].shipments.length).to.be.equal(0)
                // Return
                expect(response.invoices[0].returns.length).to.be.equal(0)
                // Line item details
                expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
                expect(response.invoices[0].lineItems[0].lineItemId).to.not.be
                  .null
                expect(response.invoices[0].lineItems[0].legacyId).to.not.be
                  .null
                expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(
                  Number(testData.items[0].stockCode)
                )
                expect(response.invoices[0].lineItems[0].quantity).to.be.equal(
                  Number(testData.items[0].quantity)
                )
                expect(
                  response.invoices[0].lineItems[0].quantityPlaced
                ).to.be.equal(Number(testData.items[0].quantity))
                expect(
                  response.invoices[0].lineItems[0].refundableQuantity
                ).to.be.equal(0)
                expect(
                  response.invoices[0].lineItems[0].salePrice
                ).to.be.greaterThan(0)
                expect(
                  response.invoices[0].lineItems[0].totalAmount
                ).to.be.greaterThan(0)
                expect(response.invoices[0].lineItems[0].variantId).to.not.be
                  .null
                expect(response.invoices[0].lineItems[0].status).to.be.equal(
                  'REFUNDED'
                )
                expect(response.invoices[0].lineItems[0].statusFull).to.be.null
                // Shipments Details for line items
                expect(response.invoices[0].lineItems[0].shipment).to.be.null
                // Rewards Details for line items
                // expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETREWARD')
                expect(response.invoices[0].lineItems[0].reward.offerId).to.not
                  .be.null
                expect(
                  response.invoices[0].lineItems[0].reward
                    .deferredDiscountAmount
                ).to.not.be.null
                expect(
                  response.invoices[0].lineItems[0].reward.quantity
                ).to.be.equal(Number(testData.items[0].quantity))
                // Refund
                expect(response.invoices[0].refunds[0].id).to.not.be.null
                expect(response.invoices[0].refunds[0].status).to.be.equal(
                  'Refunded'
                )
                expect(
                  response.invoices[0].refunds[0].refundAmount
                ).to.be.equal(Number(testData.edmTotal))
                expect(
                  response.invoices[0].refunds[0].refundAmount
                ).to.be.equal(response.invoices[0].invoiceTotal)
                expect(
                  response.invoices[0].refunds[0].cashAmount
                ).to.be.greaterThan(0)
                expect(
                  response.invoices[0].refunds[0].totalAmount
                ).to.be.greaterThan(0)
                expect(
                  response.invoices[0].refunds[0].recoveredAmount
                ).to.be.greaterThan(0)
                expect(response.invoices[0].refunds[0].createdUtc).to.not.be
                  .null
                expect(response.invoices[0].refunds[0].updatedUtc).to.not.be
                  .null
                expect(response.invoices[0].refunds[0].refundedUtc).to.not.be
                  .null
                expect(response.invoices[0].refunds[0].initiatedBy).to.be.equal(
                  'ADMIN'
                )

                // Refund-> Notes verification
                expect(response.invoices[0].refunds[0].notes[0].id).to.not.be
                  .null
                expect(
                  response.invoices[0].refunds[0].notes[0].note
                ).to.be.equal(
                  "Automation refundRequestCreate note: I don't want this"
                )
                expect(response.invoices[0].refunds[0].notes[0].timestamp).to
                  .not.be.null
                expect(response.invoices[0].refunds[0].notes[1].id).to.not.be
                  .null
                expect(
                  response.invoices[0].refunds[0].notes[1].note
                ).to.be.equal(
                  "Automation refundRequestReturn note: I don't want this"
                )
                expect(response.invoices[0].refunds[0].notes[1].timestamp).to
                  .not.be.null
                expect(response.invoices[0].refunds[0].notes[2].id).to.not.be
                  .null
                expect(
                  response.invoices[0].refunds[0].notes[2].note
                ).to.be.equal('Auto-refund cancellation')
                expect(response.invoices[0].refunds[0].notes[2].timestamp).to
                  .not.be.null
                // Refund-> refundItems verification
                expect(response.invoices[0].refunds[0].refundItems[0].id).to.not
                  .be.null
                expect(response.invoices[0].refunds[0].refundItems[0].legacyId)
                  .to.not.be.null
                expect(
                  response.invoices[0].refunds[0].refundItems[0].reason
                ).equal("Automation Reason: I don't want this")
                expect(
                  response.invoices[0].refunds[0].refundItems[0].quantity
                ).equal(Number(testData.items[0].quantity))
                expect(
                  response.invoices[0].refunds[0].refundItems[0].amount
                ).to.be.greaterThan(0)
                expect(
                  response.invoices[0].refunds[0].refundItems[0].amount
                ).to.be.equal(Number(testData.edmTotal))
                // RefundItems ->lineitems
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .stockCode
                ).to.be.equal(Number(testData.items[0].stockCode))
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .lineItemId
                ).to.not.be.null
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .refundableQuantity
                ).to.be.equal(0)
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .totalAmount
                ).to.be.equal(0)
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .quantityPlaced
                ).equal(Number(testData.items[0].quantity))
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .quantity
                ).equal(Number(testData.items[0].quantity))
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .totalAmount
                ).to.be.equal(0)
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .variantId
                ).to.not.be.null
                expect(
                  response.invoices[0].refunds[0].refundItems[0].lineItem
                    .variantLegacyId
                ).to.not.be.null
              }) // verify order api projection end
          }) // seller cancellation end

          // After seller cancellation, Invoke the events api and verify the events are updated acordingly
          cy.orderEventsApiWithRetry(orderReference, {
            function: function (response) {
              if (
                !response.body.data.some(
                  (element) => element.domainEvent === 'RefundRequestUpdate'
                ) ||
                !response.body.data.some(
                  (element) => element.domainEvent === 'MarketOrderRefund'
                ) ||
                !response.body.data.some(
                  (element) => element.domainEvent === 'RefundCompleted'
                )
              ) {
                cy.log(
                  'Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted were not present'
                )
                throw new Error(
                  'Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted were not present'
                )
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout'),
          }).then((response) => {
            // Verify there are only 7 events. New event after seller cancellattion
            lib.verifyEventDetails(
              response,
              'RefundRequestUpdate',
              testData,
              shopperId,
              3
            )
            lib.verifyEventDetails(
              response,
              'MarketOrderRefund',
              testData,
              shopperId,
              1
            )
            lib.verifyEventDetails(
              response,
              'RefundCompleted',
              testData,
              shopperId,
              1
            )
          })

          // Verify the reward points are not credited to customers card after seller full cancellation of EM order
          // Get customers current reward points balance after seller cancellation
          if (Cypress.env('marketRewardPointsValidationSwitch')) {
            cy.log(
              'marketRewardPointsValidationSwitch is enabled. Performing validations.'
            )

            cy.getRewardsCardDetails(
              rewardsDetails.partnerId,
              rewardsDetails.siteId,
              rewardsDetails.posId,
              rewardsDetails.loyaltySiteType,
              rewardsCardNumber
            ).then((response) => {
              expect(
                response.queryCardDetailsResp.pointBalance
              ).to.be.greaterThan(0)
              expect(response.queryCardDetailsResp.pointBalance).to.be.equal(
                testData.rewardPointBefore
              )
            })
          }
          // Verify the refund details
          lib.verifyRefundDetails(
            testData.orderId,
            testData.edmTotal,
            testData.edmDeliveryCharges
          )

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

          // Invoke OQS TMO api and validate it against the projection
          lib.verifyOQSOrderStatus(
            testData.orderId,
            'Received',
            false,
            testData
          )
        })
      })
    })
  })
})
