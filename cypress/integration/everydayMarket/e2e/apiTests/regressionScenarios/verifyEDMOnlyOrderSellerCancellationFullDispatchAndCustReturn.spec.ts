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
import * as lib from '../../../../../support/everydayMarket/api/commands/commonHelpers'

const testData: any = tests.GenericEDMOnlyOrderPaypalAndGCPaymentTestData
const dispatchQty = 2
const cancelledQty = 1
const shopperId: any =
  shoppers.emPromouserAccountforScenario2Regression.shopperId
const rewardsCardNumber =
  shoppers.emPromouserAccountforScenario2Regression.rewardsCardNumber
let orderId: any
let orderReference: any
let edmOrderId: any
let edmInvoiceId: any
let lineItemLegacyId: any
let encodedEdmInvoiceId: any
let encodedEdmLineitemId: any
let totalMarketRefundAmount
let marketRefundId: any

TestFilter(['EDM', 'API', 'EDM-E2E-API', 'E2E-Scenario-2'], () => {
  describe('[API] RP-5912 -EDM Only order-PAYPAL_PLUS_GIFTCARD-Seller cancellation, full dispatch and full customer return', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5912-EDM Only order- Seller cancellation, full dispatch and customer return using for order placed using PAYPALGIFTCARD', () => {
      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(
        shoppers.emPromouserAccountforScenario2Regression,
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
        })
          .as('orderPlacedProjection')
          .then((response) => {
            edmOrderId = response.invoices[0].legacyIdFormatted
            edmInvoiceId = response.invoices[0].legacyId
            lineItemLegacyId = response.invoices[0].lineItems[0].legacyId
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
                edmInvoiceId
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
            }).as('orderPlacedEvents')

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

            cy.log(
              '&&&&&&&&&&&&&&&&&&&&&&&&& SELLER CANCELLATION &&&&&&&&&&&&&&&&&&&&&&&&&&&&'
            )

            cy.refundRequestCreateInitiatedBy(
              encodedEdmInvoiceId,
              encodedEdmLineitemId,
              cancelledQty,
              true,
              'SELLER'
            ).then((response) => {
              expect(
                response.data.refundRequestCreate.refundRequest.status
              ).to.equals('AWAITING')

              // Verify the projections
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
                shopperId,
                testData.orderId,
                {
                  function: function (response) {
                    if (
                      response.body.invoices[0].refunds[0].status !==
                      'OutOfStock'
                    ) {
                      throw new Error(
                        'status was ' +
                          response.body.invoices[0].refunds[0].status +
                          ' not OutOfStock'
                      )
                    }
                  },
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout'),
                }
              ).then((response) => {
                // Validate refunds
                expect(response.invoices[0].refunds[0].status).is.equal(
                  'OutOfStock'
                )
                expect(
                  response.invoices[0].refunds[0].refundItems[0].quantity
                ).is.equal(cancelledQty)

                const encodedMarketRefundedId =
                  response.invoices[0].refunds[0].id
                totalMarketRefundAmount =
                  response.invoices[0].refunds[0].refundAmount
                //  Approve the seller cancellation and verify the response status in graphQL endpoint
                cy.refundRequestReturn(encodedMarketRefundedId).then(
                  (response) => {
                    expect(
                      response.data.refundRequestReturn.refundRequest.status
                    ).to.be.equal('RETURNED')
                  }
                )
                // Verify Order Projection details after seller cancellation
                cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
                  shopperId,
                  orderId,
                  {
                    function: function (response) {
                      if (
                        response.body.invoices[0].invoiceStatus !== 'REFUNDED'
                      ) {
                        cy.log(
                          'invoiceStatus was ' +
                            response.body.invoices[0].invoiceStatus +
                            ' instead of REFUNDED'
                        )
                        throw new Error(
                          'invoiceStatus was ' +
                            response.body.invoices[0].invoiceStatus +
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
                    expect(response.invoices[0].invoiceStatus).to.be.equal(
                      'REFUNDED'
                    )
                    expect(response.invoices[0].wowStatus).to.be.equal('Placed')
                    expect(
                      response.invoices[0].orderTrackingStatus
                    ).to.be.equal('Cancelled')
                    expect(
                      response.invoices[0].lineItems[0].quantity
                    ).to.be.equal(Number(testData.items[0].quantity))
                    expect(
                      response.invoices[0].lineItems[0].quantityPlaced
                    ).to.be.equal(Number(testData.items[0].quantity))
                    expect(
                      response.invoices[0].lineItems[0].refundableQuantity
                    ).to.be.equal(0)
                    expect(
                      response.invoices[0].lineItems[0].stockCode
                    ).to.be.equal(Number(testData.items[0].stockCode))
                    expect(
                      response.invoices[0].lineItems[0].quantity
                    ).to.be.equal(Number(testData.items[0].quantity))
                    expect(
                      response.invoices[0].lineItems[0].quantityPlaced
                    ).to.be.equal(Number(testData.items[0].quantity))
                    expect(
                      response.invoices[0].lineItems[0].refundableQuantity
                    ).to.be.equal(0)
                    //refunds
                    expect(response.invoices[0].refunds.length).to.be.equal(1)
                    expect(response.invoices[0].refunds[0].status).to.be.equal(
                      'Refunded'
                    )
                    expect(
                      response.invoices[0].refunds[0].initiatedBy
                    ).to.be.equal('SELLER')
                    // shipments
                    expect(response.invoices[0].shipments.length).to.be.equal(0)
                    // Return
                    expect(response.invoices[0].returns.length).to.be.equal(0)

                    // Verify "Partial Refund Amount" after seller refund
                    lib.verifyRefundDetails(
                      testData.orderId,
                      totalMarketRefundAmount,
                      0
                    )

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
                        expect(
                          response.queryCardDetailsResp.pointBalance
                        ).to.be.equal(testData.rewardPointBefore)
                      })
                    }

                    // Verify the events api
                    cy.orderEventsApiWithRetry(orderReference, {
                      function: function (response) {
                        if (
                          !response.body.data.some(
                            (element) =>
                              element.domainEvent === 'MarketOrderRefund'
                          ) ||
                          !response.body.data.some(
                            (element) =>
                              element.domainEvent === 'RefundCompleted'
                          )
                        ) {
                          cy.log(
                            'Expected MarketOrderRefund & RefundCompleted were not present'
                          )
                          throw new Error(
                            'Expected MarketOrderRefund & RefundCompleted were not present'
                          )
                        }
                      },
                      retries: Cypress.env('marketApiRetryCount'),
                      timeout: Cypress.env('marketApiTimeout'),
                    }).then((response) => {
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
                  })
              })
            }) //END OF SELLER CNACELLATION FLOW

            cy.log(
              '&&&&&&&&&&&&&&&&&&&&&&&& FULL DISPATCH &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'
            )
            // Dispatch the complete order from MP and verify the events and order statuses
            cy.fullDispatchAnInvoice(
              testData.edmInvoiceId,
              testData.trackingNumber,
              testData.carrier,
              testData.items[0].sellerName
            ).then((response) => {
              // After dispatch, Invoke the order api and verify the projection content is updated accordingly ///shweta
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
                shopperId,
                orderId,
                {
                  function: function (response) {
                    if (response.body.invoices[0].wowStatus !== 'Shipped') {
                      cy.log(
                        'wowStatus was ' +
                          response.body.invoices[0].wowStatus +
                          ' instead of Shipped'
                      )
                      throw new Error(
                        'wowStatus was ' +
                          response.body.invoices[0].wowStatus +
                          ' instead of Shipped'
                      )
                    }
                  },
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout'),
                }
              ).then((response) => {
                // Order details
                lib.verifyCommonOrderDetails(response, testData, shopperId)
                // Seller details
                expect(response.invoices[0].seller.sellerId).to.not.be.null
                expect(response.invoices[0].seller.sellerName).to.be.equal(
                  testData.items[0].sellerName
                )
                // Invoice details
                expect(response.invoices[0].invoiceStatus).to.be.equal(
                  'REFUNDED'
                )
                expect(response.invoices[0].wowStatus).to.be.equal('Shipped')
                expect(response.invoices[0].wowId).to.not.be.null
                expect(response.invoices[0].shipments.length).to.be.equal(1)
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
                ).to.be.equal(Number(testData.items[0].quantity))
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
                // Shipments
                expect(response.invoices[0].shipments.length).to.be.equal(1)
                expect(response.invoices[0].shipments[0].carrier).to.be.equal(
                  testData.carrier
                )
                expect(response.invoices[0].shipments[0].shipmentItemId).to.not
                  .be.null
                expect(response.invoices[0].shipments[0].trackingLink).to.not.be
                  .null
                expect(
                  response.invoices[0].shipments[0].trackingNumber
                ).to.be.equal(testData.trackingNumber)
                expect(response.invoices[0].shipments[0].dispatchedAtUtc).to.not
                  .be.null
                expect(
                  response.invoices[0].shipments[0].shippedItems.length
                ).to.be.equal(1)
                expect(
                  response.invoices[0].shipments[0].shippedItems[0].variantId
                ).to.be.equal(response.invoices[0].lineItems[0].variantId)
                expect(
                  response.invoices[0].shipments[0].shippedItems[0].stockCode
                ).to.be.equal(Number(testData.items[0].stockCode))
                expect(
                  response.invoices[0].shipments[0].shippedItems[0].quantity
                ).to.be.equal(Number(testData.items[0].quantity))
                // Rewards Details
                // expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETPOINTS')
                expect(response.invoices[0].lineItems[0].reward.offerId).to.not
                  .be.null
                expect(
                  response.invoices[0].lineItems[0].reward
                    .deferredDiscountAmount
                ).to.not.be.null
                expect(
                  response.invoices[0].lineItems[0].reward.quantity
                ).to.be.equal(Number(testData.items[0].quantity))

                // After dispatch, Invoke the events api and verify the events are updated accordingly
                cy.orderEventsApiWithRetry(orderReference, {
                  function: function (response) {
                    if (
                      !response.body.data.some(
                        (element) =>
                          element.domainEvent === 'MarketOrderShipmentCreate'
                      ) ||
                      !response.body.data.some(
                        (element) =>
                          element.domainEvent === 'MarketOrderDispatched'
                      ) ||
                      !response.body.data.some(
                        (element) =>
                          element.domainEvent === 'MarketRewardsCredited'
                      )
                    ) {
                      cy.log(
                        'Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present'
                      )
                      throw new Error(
                        'Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present'
                      )
                    }
                  },
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout'),
                }).then((response) => {
                  // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
                  lib.verifyEventDetails(
                    response,
                    'MarketOrderShipmentCreate',
                    testData,
                    shopperId,
                    1
                  )
                  // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
                  lib.verifyEventDetails(
                    response,
                    'MarketOrderDispatched',
                    testData,
                    shopperId,
                    1
                  )
                  // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
                  lib.verifyEventDetails(
                    response,
                    'MarketRewardsCredited',
                    testData,
                    shopperId,
                    1
                  )
                })
              })
            }) //END OF FULL DISPATCH

            cy.log(
              '&&&&&&&&&&&&&&&&&&&&&&&&&&&& SELF SERVICE RETURN &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'
            )
            // Self Service Customer Return-
            const returnRequestLineItem = [
              {
                stockCode: testData.items[0].stockCode,
                quantity: dispatchQty,
                amount: testData.items[0].pricePerItem,
                reason: 'Item is faulty',
                weight: 12,
                notes: 'Customer Return from EM Test Automation_Full_Return',
              },
            ]

            cy.customerReturn(
              testData.edmOrderId,
              testData.orderReference,
              returnRequestLineItem
            ).then((customerReturnResponse) => {
              expect(customerReturnResponse.invoiceId).to.be.equal(
                testData.edmOrderId
              )
              expect(customerReturnResponse.lineItems[0].total).to.be.equal(
                dispatchQty * testData.items[0].pricePerItem
              )
              expect(customerReturnResponse.lineItems[0].stockCode).to.be.equal(
                testData.items[0].stockCode
              )
              expect(customerReturnResponse.lineItems[0].quantity).to.be.equal(
                dispatchQty
              )
              expect(customerReturnResponse.lineItems[0].amount).to.be.equal(
                testData.items[0].pricePerItem
              )
              expect(customerReturnResponse.refundAmount).to.be.equal(
                dispatchQty * testData.items[0].pricePerItem
              )
              cy.log(
                'For StockCode= ' +
                  customerReturnResponse.lineItems[0].stockCode +
                  ' the Purchased quantities are= ' +
                  testData.items[0].quantity +
                  ' and it is returned with quantities= ' +
                  customerReturnResponse.lineItems[0].quantity +
                  ' and Total Refunded Amount is= ' +
                  customerReturnResponse.refundAmount +
                  ' Where Unit Price of EM lineItem is= ' +
                  customerReturnResponse.lineItems[0].amount
              )
              totalMarketRefundAmount = customerReturnResponse.refundAmount

              // Verify the EM Line Item Status
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
                shopperId,
                orderId,
                {
                  function: function (response) {
                    if (
                      response.body.invoices[0].refunds[0].status !== 'Refunded'
                    ) {
                      cy.log(
                        'EM LineItem Status after hitting Return API was= ' +
                          response.body.invoices[0].refunds[0].status +
                          ' instead of "Refunded"'
                      )
                      throw new Error(
                        'EM LineItem Status after hitting Return API was= ' +
                          response.body.invoices[0].refunds[0].status +
                          ' instead of "Refunded"'
                      )
                    } else {
                      cy.log(
                        'Else-EM LineItem Status after hitting Return API was= ' +
                          response.body.invoices[0].refunds[0].status +
                          ' Which is same as of "Refunded" '
                      )
                    }
                  },
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout'),
                }
              ).then((orderApiProjectionResponse) => {
                marketRefundId =
                  orderApiProjectionResponse.invoices[0].returns[0]
                    .marketRefundId
                cy.log(
                  '"marketRefundId" attribute value from Order Api Projection after hitting Return API was= ' +
                    marketRefundId
                )
                cy.log(
                  '"Returned" EM LineItem Status in Order Api Projection after hitting Return API was= ' +
                    orderApiProjectionResponse.invoices[0].refunds[0].status
                ) // ReturnInitiated
                expect(
                  orderApiProjectionResponse.invoices[0].refunds[0].status
                ).to.be.equal('Refunded')

                // Call "refundRequestReturn" GraphQL API to Perform the "Process Return" Step
                cy.refundRequestReturn(marketRefundId).then(
                  (refundRequestReturnResponse) => {
                    cy.log(
                      '"Process Return" EM line item Status in MarketPlacer GraphQL Response is= ' +
                        refundRequestReturnResponse.data.refundRequestReturn
                          .refundRequest.status
                    ) // Returned
                    expect(
                      refundRequestReturnResponse.data.refundRequestReturn
                        .refundRequest.status
                    ).to.be.equal('RETURNED')
                  }
                )
              })

              // Call the Projection order api "​/api​/v1​/shoppers​/{shopperId}​/orders​/{orderId}" Again to Verify the EM Line Item Status as "Returned" on Trader Website
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
                shopperId,
                orderId,
                {
                  function: function (response) {
                    if (
                      response.body.invoices[0].refunds[0].status !== 'Refunded'
                    ) {
                      cy.log(
                        'EM LineItem Status after hitting MP GraphQL refundRequestReturn API was= ' +
                          response.body.invoices[0].refunds[0].status +
                          ' instead of "Refunded"'
                      )
                      throw new Error(
                        'EM LineItem Status after hitting MP GraphQL refundRequestReturn API was= ' +
                          response.body.invoices[0].refunds[0].status +
                          ' instead of "Refunded"'
                      )
                    } else {
                      cy.log(
                        'Else-EM LineItem Status after hitting MP GraphQL refundRequestReturn API was= ' +
                          response.body.invoices[0].refunds[0].status +
                          '  Which is same as of "Refunded"'
                      )
                    }
                  },
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout'),
                }
              )
                .as('finalProjection')
                .then((ordersApiByShopperIdAndTraderOrderIdResponse) => {
                  cy.log(
                    '"Process Return" EM LineItem Status in Order Api Projection after hitting MP GraphQL refundRequestReturn API  was= ' +
                      ordersApiByShopperIdAndTraderOrderIdResponse.invoices[0]
                        .refunds[0].status
                  ) // Returned
                  expect(
                    ordersApiByShopperIdAndTraderOrderIdResponse.invoices[0]
                      .refunds[0].status
                  ).to.be.equal('Refunded') // This is Status on Website
                })

              // Verify "Total Refund Amount" after Customer Return
              cy.log(
                'Verifying "Total Refund Amount" is same as the Response of getRefundDetails'
              )
              cy.log(
                '"totalMarketRefundAmount" Variable value from the customerReturnResponse is= ' +
                  totalMarketRefundAmount
              )

              // Verify the MP and shipping invoices are available for the customer
              cy.verifyOrderInvoice(testData)

              // lib.verifyRefundDetails(
              //   testData.orderId,
              //   totalMarketRefundAmount,
              //   10
              // )
            })

            // Now Calling Rewards API to verify the Rewards Points Balance are not Deducted after the Return is Performed
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
                cy.log(
                  ' Rewards Points After DISPATCH were= ' +
                    testData.rewardPointAfter +
                    ' and Rewards Points After RETURN are= ' +
                    response.queryCardDetailsResp.pointBalance
                )
                expect(response.queryCardDetailsResp.pointBalance).to.be.equal(
                  testData.rewardPointAfter
                )
              })
            } //END OF CUSTOMER RETURN AND REFUND

            cy.log(
              '&&&&&&&&&&&&&&&&&&&&&&&&&&&& OQS AND REWARDS VERIFICATION &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'
            )
            // Now Calling Rewards API to verify the Rewards Points Balance are not Deducted after the Return is Performed
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
                cy.log(
                  ' Rewards Points After DISPATCH were= ' +
                    testData.rewardPointAfter +
                    ' and Rewards Points After RETURN are= ' +
                    response.queryCardDetailsResp.pointBalance
                )
                expect(response.queryCardDetailsResp.pointBalance).to.be.equal(
                  testData.rewardPointAfter
                )
              })
            }

            // Verify the MP and shipping invoices are available for the customer
            // TO-DO Verify the invoice content
            cy.verifyOrderInvoice(testData)

            // Invoke OQS TMO api and validate it against the projection
            lib.verifyOQSOrderStatus(
              testData.orderId,
              'Received',
              true,
              testData
            )
          })
      }) //LOGIN END
    })
  })
})
