/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from "../../../../../support/TestFilter";
import "../../../../../support/siteManagement/ui/commands/login";
import "../../../../../support/siteManagement/ui/commands/homepage";
import "../../../../../support/siteManagement/ui/commands/orderManagement";
import "../../../../../support/everydayMarket/api/commands/orderApi";
import shoppers from "../../../../../fixtures/everydayMarket/shoppers.json";
import "../../../../../support/invoices/api/commands/commands";
import "../../../../../support/refunds/api/commands/commands";
import "../../../../../support/everydayMarket/api/commands/orderApi";
import "../../../../../support/everydayMarket/api/commands/marketplacer";
import "../../../../../support/everydayMarket/api/commands/utility";
import "../../../../../support/everydayMarket/ui/commands/siteManagementHelpers";
import "../../../../../support/everydayMarket/ui/commands/siteManagementValidationHelpers";
import tests from "../../../../../fixtures/everydayMarket/apiTests.json";
import smLogins from "../../../../../fixtures/siteManagement/loginDetails.json";
import "../../../../../support/checkout/api/commands/confirmOrder";
import "../../../../../support/rewards/api/commands/rewards";
import "../../../../../support/orderPaymentService/api/commands/refunds";
import * as lib from "../../../../../support/everydayMarket/api/commands/commonHelpers";
import { onOrderManagement } from "../../../../../support/siteManagement/ui/pageObjects/OrderManagement";

TestFilter(["EDM", "EDM-HYBRID", 'EDM-E2E-HYBRID'], () => {
  describe("[API]  RP-5112 - EM | SM | Refunds | Verify refunds and goodwill from site management happens to the right payment mode for market orders placed with PP + GC + RD ", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });

    it("[API]  RP-5112 - EM | SM | Refunds | Verify refunds and goodwill from site management happens to the right payment mode for market orders placed with PP + GC + RD ", () => {
      const testData = tests.GenericWOWPlusEDMPaypalRDAndGCPaymentTestData;
      let orderId: any;
      let orderReference: any;
      let edmOrderId: any;
      let edmInvoiceId: any;
      const shopperId = shoppers.emAccountWithRewards10.shopperId;
      const rewardsCardNumber = shoppers.emAccountWithRewards10.rewardsCardNumber;
      let refundReason = "Damaged Item";
      let refundComment = "Automation Refund Comment";
      const goodwillAmount = 15;
      const shippingFeeGoodwillAmount = 12;

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(
        shoppers.emAccountWithRewards10,
        testData
      ).as("orderPlaced");

      //Verify the projection and events after placing the order
      cy.get("@orderPlaced").then((response) => {
        orderId = response.Order.OrderId.toString();
        orderReference = response.Order.OrderReference.toString();
        testData.orderId = orderId;
        testData.orderReference = orderReference;
        cy.log(
          "This is the order id: " +
            response.Order.OrderId +
            ", Order ref: " +
            response.Order.OrderReference
        );

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, response);

        // Invoke the order api and verify the projection content
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== "Placed") {
              cy.log(
                "wowStatus was " +
                  response.body.invoices[0].wowStatus +
                  " instead of Placed"
              );
              throw new Error(
                "wowStatus was " +
                  response.body.invoices[0].wowStatus +
                  " instead of Placed"
              );
            }
          },
          retries: Cypress.env("marketApiRetryCount"),
          timeout: Cypress.env("marketApiTimeout"),
        })
          .as("initialOrderPlacedProjection")
          .then((response) => {
            edmOrderId = response.invoices[0].legacyIdFormatted;
            edmInvoiceId = response.invoices[0].legacyId;
            testData.edmOrderId = edmOrderId;
            testData.edmInvoiceId = edmInvoiceId;
            cy.log(
              "This is the MPOrder Id: " +
                edmOrderId +
                ", MPInvoice Id: " +
                edmInvoiceId
            );
            // Verify the projection details
            lib.verifyInitialOrderDetails(response, testData, shopperId);

            // Invoke the events api and verify the content
            cy.orderEventsApiWithRetry(orderReference, {
              function: function (response) {
                if (
                  !response.body.data.some(
                    (element) => element.domainEvent === "OrderPlaced"
                  ) ||
                  !response.body.data.some(
                    (element) => element.domainEvent === "MarketOrderPlaced"
                  )
                ) {
                  cy.log(
                    "Expected OrderPlaced & MarketOrderPlaced were not present"
                  );
                  throw new Error(
                    "Expected OrderPlaced & MarketOrderPlaced were not present"
                  );
                }
              },
              retries: Cypress.env("marketApiRetryCount"),
              timeout: Cypress.env("marketApiTimeout"),
            }).then((response) => {
              lib.verifyEventDetails(
                response,
                "OrderPlaced",
                testData,
                shopperId,
                1
              );
              lib.verifyEventDetails(
                response,
                "MarketOrderPlaced",
                testData,
                shopperId,
                1
              );
            });
          });
      });

      // Dispatch the complete order from MP and verify the projection, events and order statuses
      cy.get("@initialOrderPlacedProjection").then(
        (initialOrderPlacedProjection) => {
          // Dispatch the complete order from MP and verify the events and order statuses
          cy.fullDispatchAnInvoice(
            testData.edmInvoiceId,
            testData.trackingNumber,
            testData.carrier,
            testData.items[0].sellerName
          ).as("invoicesDispatched");

          // After dispatch, Invoke the order api and verify the projection content is updated acordingly
          cy.get("@invoicesDispatched").then((response) => {
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
              shopperId,
              orderId,
              {
                function: function (response) {
                  if (response.body.invoices[0].wowStatus !== "Shipped") {
                    cy.log(
                      "wowStatus was " +
                        response.body.invoices[0].wowStatus +
                        " instead of Shipped"
                    );
                    throw new Error(
                      "wowStatus was " +
                        response.body.invoices[0].wowStatus +
                        " instead of Shipped"
                    );
                  }
                },
                retries: Cypress.env("marketApiRetryCount"),
                timeout: Cypress.env("marketApiTimeout"),
              }
            )
              .as("finalProjection")
              .then((response) => {
                // Order details
                lib.verifyCommonOrderDetails(response, testData, shopperId);
                // Seller details
                expect(response.invoices[0].seller.sellerId).to.not.be.null;
                expect(response.invoices[0].seller.sellerName).to.be.equal(
                  testData.items[0].sellerName
                );
                // Invoice details
                expect(response.invoices[0].invoiceStatus).to.be.equal("SENT");
                expect(response.invoices[0].wowStatus).to.be.equal("Shipped");
                expect(response.invoices[0].wowId).to.not.be.null;
                expect(response.invoices[0].shipments.length).to.be.equal(1);
                expect(response.invoices[0].lineItems.length).to.be.equal(1);
                expect(response.invoices[0].legacyId).to.not.be.null;
                expect(response.invoices[0].legacyIdFormatted).to.not.be.null;
                expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0);
                expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null;
                expect(response.invoices[0].refunds.length).to.be.equal(0);
                expect(response.invoices[0].orderTrackingStatus).to.be.equal(
                  "Shipped"
                );
                expect(response.invoices[0].pdfLink).to.not.be.null;
                expect(response.invoices[0].legacyIdFormatted).to.be.equal(
                  testData.edmOrderId
                );
                // Line item details
                expect(response.invoices[0].lineItems[0].wowId).to.not.be.null;
                expect(response.invoices[0].lineItems[0].lineItemId).to.not.be
                  .null;
                expect(response.invoices[0].lineItems[0].legacyId).to.not.be
                  .null;
                expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(
                  Number(testData.items[0].stockCode)
                );
                expect(response.invoices[0].lineItems[0].quantity).to.be.equal(
                  Number(testData.items[0].quantity)
                );
                expect(
                  response.invoices[0].lineItems[0].quantityPlaced
                ).to.be.equal(Number(testData.items[0].quantity));
                expect(
                  response.invoices[0].lineItems[0].refundableQuantity
                ).to.be.equal(Number(testData.items[0].quantity));
                expect(
                  response.invoices[0].lineItems[0].salePrice
                ).to.be.greaterThan(0);
                expect(
                  response.invoices[0].lineItems[0].totalAmount
                ).to.be.greaterThan(0);
                expect(response.invoices[0].lineItems[0].variantId).to.not.be
                  .null;
                expect(response.invoices[0].lineItems[0].status).to.be.equal(
                  "ALLOCATED"
                );
                // Shipments
                expect(response.invoices[0].shipments.length).to.be.equal(1);
                expect(response.invoices[0].shipments[0].carrier).to.be.equal(
                  testData.carrier
                );
                expect(response.invoices[0].shipments[0].shipmentItemId).to.not
                  .be.null;
                expect(response.invoices[0].shipments[0].trackingLink).to.not.be
                  .null;
                expect(
                  response.invoices[0].shipments[0].trackingNumber
                ).to.be.equal(testData.trackingNumber);
                expect(response.invoices[0].shipments[0].dispatchedAtUtc).to.not
                  .be.null;
                expect(
                  response.invoices[0].shipments[0].shippedItems.length
                ).to.be.equal(1);
                expect(
                  response.invoices[0].shipments[0].shippedItems[0].variantId
                ).to.be.equal(response.invoices[0].lineItems[0].variantId);
                expect(
                  response.invoices[0].shipments[0].shippedItems[0].stockCode
                ).to.be.equal(Number(testData.items[0].stockCode));
                expect(
                  response.invoices[0].shipments[0].shippedItems[0].quantity
                ).to.be.equal(Number(testData.items[0].quantity));
                // Rewards Details
                // expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETPOINTS')
                expect(response.invoices[0].lineItems[0].reward.offerId).to.not
                  .be.null;
                expect(
                  response.invoices[0].lineItems[0].reward
                    .deferredDiscountAmount
                ).to.not.be.null;
                expect(
                  response.invoices[0].lineItems[0].reward.quantity
                ).to.be.equal(Number(testData.items[0].quantity));

                // After dispatch, Invoke the events api and verify the events are updated acordingly
                cy.orderEventsApiWithRetry(orderReference, {
                  function: function (response) {
                    if (
                      !response.body.data.some(
                        (element) =>
                          element.domainEvent === "MarketOrderShipmentCreate"
                      ) ||
                      !response.body.data.some(
                        (element) =>
                          element.domainEvent === "MarketOrderDispatched"
                      ) ||
                      !response.body.data.some(
                        (element) =>
                          element.domainEvent === "MarketRewardsCredited"
                      )
                    ) {
                      cy.log(
                        "Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present"
                      );
                      throw new Error(
                        "Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present"
                      );
                    }
                  },
                  retries: Cypress.env("marketApiRetryCount"),
                  timeout: Cypress.env("marketApiTimeout"),
                }).then((response) => {
                  // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
                  lib.verifyEventDetails(
                    response,
                    "MarketOrderShipmentCreate",
                    testData,
                    shopperId,
                    1
                  );
                  // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
                  lib.verifyEventDetails(
                    response,
                    "MarketOrderDispatched",
                    testData,
                    shopperId,
                    1
                  );
                  // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
                  lib.verifyEventDetails(
                    response,
                    "MarketRewardsCredited",
                    testData,
                    shopperId,
                    1
                  );
                });
              });
            // Invoke OQS TMO api and validate it against the projection
            lib.verifyOQSOrderStatus(
              testData.orderId,
              "Received",
              false,
              testData
            );
          });
        }
      );

      //Login to SM and create a product refund. Add a good will too. Then verify the order details
      cy.get("@finalProjection").then((firstFinalProjection) => {
        cy.loginToSMAndSearchOrder(smLogins, orderId);
        cy.validateOrderDetailsOnSM(false);
        //Refund all 3 items with some goodwill
        cy.createARefund(
          firstFinalProjection.invoices[0].lineItems[0].stockCode,
          refundReason,
          refundComment,
          1,
          goodwillAmount
        );
        //Search for the order again and refund the shipping fee along with some goodwill
        cy.searchAnOrderOnSM(orderId);
        //Switch to EDM TAB
        cy.clickEDMTab()
        cy.refundShippingFee(
          refundReason,
          refundComment,
          shippingFeeGoodwillAmount
        );

        //Verify the refund details are updated in the projection and events
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
          function: function (response) {
            if (
              response.body.invoices[0].invoiceStatus !== "REFUNDED" ||
              response.body.invoices[0].lineItems[0].status !== "REFUNDED"
            ) {
              cy.log(
                "invoiceStatus was " +
                  response.body.invoices[0].invoiceStatus +
                  " instead of REFUNDED"
              );
              throw new Error(
                "invoiceStatus was " +
                  response.body.invoices[0].invoiceStatus +
                  " instead of REFUNDED"
              );
            }
          },
          retries: Cypress.env("marketApiRetryCount"),
          timeout: Cypress.env("marketApiTimeout"),
        })
          .as("newFinalProjection")
          .then((refundedProjection) => {
            // Order details
            lib.verifyCommonOrderDetails(
              refundedProjection,
              testData,
              shopperId
            );

            // Seller details
            expect(refundedProjection.invoices[0].seller.sellerId).to.not.be
              .null;
            expect(
              refundedProjection.invoices[0].seller.sellerName
            ).to.be.equal(testData.items[0].sellerName);
            // Verifying Invoice details after seller cancellation
            expect(refundedProjection.invoices[0].invoiceStatus).to.be.equal(
              "REFUNDED"
            );
            expect(refundedProjection.invoices[0].wowStatus).to.be.equal(
              "Shipped"
            );
            expect(refundedProjection.invoices[0].wowId).to.not.be.null;
            expect(refundedProjection.invoices[0].lineItems.length).to.be.equal(
              1
            );
            expect(refundedProjection.invoices[0].legacyId).to.not.be.null;
            expect(refundedProjection.invoices[0].legacyIdFormatted).to.not.be
              .null;
            expect(
              refundedProjection.invoices[0].invoiceTotal
            ).to.be.greaterThan(0);
            expect(refundedProjection.invoices[0].updatedTimeStampUtc).to.not.be
              .null;
            expect(refundedProjection.invoices[0].refunds.length).to.be.equal(
              1
            );
            expect(
              refundedProjection.invoices[0].orderTrackingStatus
            ).to.be.equal("Cancelled");
            expect(refundedProjection.invoices[0].pdfLink).to.not.be.null;
            expect(
              refundedProjection.invoices[0].legacyIdFormatted
            ).to.be.equal(testData.edmOrderId);
            // shipments
            expect(refundedProjection.invoices[0].shipments.length).to.be.equal(
              1
            );
            expect(
              refundedProjection.invoices[0].shipments[0].carrier
            ).to.be.equal(testData.carrier);
            expect(refundedProjection.invoices[0].shipments[0].shipmentItemId)
              .to.not.be.null;
            expect(
              refundedProjection.invoices[0].shipments[0].trackingLink
            ).to.include(testData.trackingNumber);
            expect(
              refundedProjection.invoices[0].shipments[0].trackingNumber
            ).to.be.equal(testData.trackingNumber);
            expect(
              refundedProjection.invoices[0].shipments[0].shippedItems.length
            ).to.be.equal(1);
            expect(
              refundedProjection.invoices[0].shipments[0].shippedItems[0]
                .stockCode
            ).to.be.equal(
              refundedProjection.invoices[0].lineItems[0].stockCode
            );
            expect(
              refundedProjection.invoices[0].shipments[0].shippedItems[0]
                .quantity
            ).to.be.equal(refundedProjection.invoices[0].lineItems[0].quantity);
            // Return
            expect(refundedProjection.invoices[0].returns.length).to.be.equal(
              0
            );
            // Line item details
            expect(refundedProjection.invoices[0].lineItems[0].wowId).to.not.be
              .null;
            expect(refundedProjection.invoices[0].lineItems[0].lineItemId).to
              .not.be.null;
            expect(refundedProjection.invoices[0].lineItems[0].legacyId).to.not
              .be.null;
            expect(
              refundedProjection.invoices[0].lineItems[0].stockCode
            ).to.be.equal(Number(testData.items[0].stockCode));
            expect(
              refundedProjection.invoices[0].lineItems[0].quantity
            ).to.be.equal(Number(testData.items[0].quantity));
            expect(
              refundedProjection.invoices[0].lineItems[0].quantityPlaced
            ).to.be.equal(Number(testData.items[0].quantity));
            expect(
              refundedProjection.invoices[0].lineItems[0].refundableQuantity
            ).to.be.equal(0);
            expect(
              refundedProjection.invoices[0].lineItems[0].salePrice
            ).to.be.greaterThan(0);
            expect(
              refundedProjection.invoices[0].lineItems[0].totalAmount
            ).to.be.greaterThan(0);
            expect(refundedProjection.invoices[0].lineItems[0].variantId).to.not
              .be.null;
            expect(
              refundedProjection.invoices[0].lineItems[0].status
            ).to.be.equal("REFUNDED");
            expect(refundedProjection.invoices[0].lineItems[0].statusFull).to.be
              .null;
            // Rewards Details for line items
            expect(refundedProjection.invoices[0].lineItems[0].reward.offerId)
              .to.not.be.null;
            expect(
              refundedProjection.invoices[0].lineItems[0].reward
                .deferredDiscountAmount
            ).to.not.be.null;
            expect(
              refundedProjection.invoices[0].lineItems[0].reward.quantity
            ).to.be.equal(Number(testData.items[0].quantity));
            // Refund
            expect(refundedProjection.invoices[0].refunds[0].id).to.not.be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].status
            ).to.be.equal("ChubRefunded");
            expect(
              refundedProjection.invoices[0].refunds[0].refundAmount
            ).to.be.equal(
              refundedProjection.invoices[0].lineItems[0].salePrice
            );
            expect(
              refundedProjection.invoices[0].refunds[0].cashAmount
            ).to.be.equal(
              refundedProjection.invoices[0].lineItems[0].salePrice
            );
            expect(
              refundedProjection.invoices[0].refunds[0].totalAmount
            ).to.be.equal(
              refundedProjection.invoices[0].lineItems[0].salePrice
            );
            expect(
              refundedProjection.invoices[0].refunds[0].recoveredAmount
            ).to.be.greaterThan(0);
            expect(refundedProjection.invoices[0].refunds[0].createdUtc).to.not
              .be.null;
            expect(refundedProjection.invoices[0].refunds[0].updatedUtc).to.not
              .be.null;
            expect(refundedProjection.invoices[0].refunds[0].refundedUtc).to.not
              .be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].initiatedBy
            ).to.be.equal("ADMIN");

            // Refund-> Notes verification
            expect(refundedProjection.invoices[0].refunds[0].notes[0].id).to.not
              .be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].notes[0].note
            ).to.include("CHUB-auto-refund-create-WowRefundId=");
            expect(refundedProjection.invoices[0].refunds[0].notes[0].timestamp)
              .to.not.be.null;
            expect(refundedProjection.invoices[0].refunds[0].notes[1].id).to.not
              .be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].notes[1].note
            ).to.be.equal("Auto-return cancellation");
            expect(refundedProjection.invoices[0].refunds[0].notes[1].timestamp)
              .to.not.be.null;
            expect(refundedProjection.invoices[0].refunds[0].notes[2].id).to.not
              .be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].notes[2].note
            ).to.be.equal("Auto-refund cancellation");
            expect(refundedProjection.invoices[0].refunds[0].notes[2].timestamp)
              .to.not.be.null;
            // Refund-> refundItems verification
            expect(refundedProjection.invoices[0].refunds[0].refundItems[0].id)
              .to.not.be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].legacyId
            ).to.not.be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].reason
            ).equal("Damaged Item");
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].quantity
            ).equal(1);
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].amount
            ).to.be.greaterThan(0);
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].amount
            ).to.be.equal(
              refundedProjection.invoices[0].lineItems[0].salePrice
            );
            // RefundItems ->lineitems
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .stockCode
            ).to.be.equal(Number(testData.items[0].stockCode));
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .lineItemId
            ).to.not.be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .refundableQuantity
            ).to.be.equal(0);
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .totalAmount
            ).to.be.equal(0);
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .quantityPlaced
            ).equal(Number(testData.items[0].quantity));
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .quantity
            ).equal(Number(testData.items[0].quantity));
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .totalAmount
            ).to.be.equal(0);
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .variantId
            ).to.not.be.null;
            expect(
              refundedProjection.invoices[0].refunds[0].refundItems[0].lineItem
                .variantLegacyId
            ).to.not.be.null;

            // After dispatch, Invoke the events api and verify the events are updated acordingly
            cy.orderEventsApiWithRetry(orderReference, {
              function: function (response: any) {
                if (
                  !response.body.data.some(
                    (element) => element.domainEvent === "RefundCompleted"
                  ) ||
                  !response.body.data.some(
                    (element) => element.domainEvent === "RefundRequestUpdate"
                  ) ||
                  !response.body.data.some(
                    (element) => element.domainEvent === "MarketOrderRefund"
                  )
                ) {
                  cy.log(
                    "Expected RefundCompleted, RefundRequestUpdate & MarketOrderRefund were not present"
                  );
                  throw new Error(
                    "Expected RefundCompleted, RefundRequestUpdate & MarketOrderRefund were not present"
                  );
                }
              },
              retries: Cypress.env("marketApiRetryCount"),
              timeout: Cypress.env("marketApiTimeout"),
            }).then((refundedEvents) => {
              // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
              lib.verifyEventDetails(
                refundedEvents,
                "RefundCompleted",
                testData,
                shopperId,
                1
              );
              // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
              lib.verifyEventDetails(
                refundedEvents,
                "RefundRequestUpdate",
                testData,
                shopperId,
                3
              );
              // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
              lib.verifyEventDetails(
                refundedEvents,
                "MarketOrderRefund",
                testData,
                shopperId,
                1
              );
            });
          });
      });

      //Verify the refund details and OQS status after CHUB refund
      cy.get("@newFinalProjection")
        .as("finalProjection")
        .then((newFinalProjection) => {
          cy.get("@finalProjection").then((finalProjection) => {
            // Verify refund details on trader my order details page
            lib.verifyRefundDetails(
              testData.orderId,
              finalProjection.invoices[0].lineItems[0].salePrice,
              finalProjection.shippingAmount
            );

            //Verify OQS details are updated after the refund from CHUB
            lib.verifyOQSOrderStatus(
              testData.orderId,
              "Received",
              false,
              testData
            );

            // Verify refund details using the payment services
            cy.getAllRefundsByOrderIdWithRetry(testData.orderId, {
              function: function (response: any) {
                if (
                  response.body.refunds[0].status !== "Completed" ||
                  response.body.refunds[1].status !== "Completed"
                ) {
                  cy.log(
                    "Refund status was not Completed instead it was " +
                      response.body.refunds[0].status
                  );
                  throw new Error(
                    "Refund status was not Completed instead it was " +
                      response.body.refunds[0].status
                  );
                }
              },
              retries: Cypress.env("marketApiRetryCount"),
              timeout: Cypress.env("marketApiTimeout"),
            }).as("refundsDetails");
            cy.get("@refundsDetails").then((refundsDetails: any) => {
              cy.log("Refund details: " + JSON.stringify(refundsDetails));
              expect(refundsDetails.refunds.length).to.be.equal(2);
              //Verify the first refund of products and goodwill
              expect(refundsDetails.refunds[0].orderID).to.be.equal(
                Number(testData.orderId)
              );
              expect(refundsDetails.refunds[0].shopperID).to.be.equal(
                Number(shopperId)
              );
              expect(refundsDetails.refunds[0].reasonID).to.be.equal(63);
              expect(refundsDetails.refunds[0].status).to.be.equal("Completed");
              expect(refundsDetails.refunds[0].externalReference).to.be.equal(
                testData.edmOrderId
              );
              expect(refundsDetails.refunds[0].type).to.be.equal("Payment");
              expect(refundsDetails.refunds[0].refundAmount).to.be.equal(
                finalProjection.invoices[0].lineItems[0].salePrice
              );
              expect(refundsDetails.refunds[0].total).to.be.equal(
                Number(
                  Number.parseFloat(
                    Number(finalProjection.invoices[0].lineItems[0].salePrice) +
                      Number(goodwillAmount)
                  ).toFixed(2)
                )
              );
              expect(refundsDetails.refunds[0].goodwillAmount).to.be.equal(
                goodwillAmount
              );
              //Verify the second refund of shipping fee and goodwill
              expect(refundsDetails.refunds[1].orderID).to.be.equal(
                Number(testData.orderId)
              );
              expect(refundsDetails.refunds[1].shopperID).to.be.equal(
                Number(shopperId)
              );
              expect(refundsDetails.refunds[1].reasonID).to.be.equal(63);
              expect(refundsDetails.refunds[1].status).to.be.equal("Completed");
              expect(refundsDetails.refunds[1].externalReference).to.be.equal(
                "EM0000000"
              );
              expect(refundsDetails.refunds[1].type).to.be.equal("Payment");
              expect(refundsDetails.refunds[1].refundAmount).to.be.equal(
                finalProjection.shippingAmount
              );
              expect(refundsDetails.refunds[1].total).to.be.equal(
                Number(
                  Number.parseFloat(
                    Number(finalProjection.shippingAmount) +
                      Number(shippingFeeGoodwillAmount)
                  ).toFixed(2)
                )
              );
              expect(refundsDetails.refunds[1].goodwillAmount).to.be.equal(
                shippingFeeGoodwillAmount
              );

              //Verify the product refund and goodwill details
              cy.getAllRefundPaymentsByRefundIdWithRetry(
                refundsDetails.refunds[0].id,
                {
                  function: function (response: any) {
                    if (
                      !(
                        response.body.results[0].type === "PayPal" &&
                        response.body.results[0].status === "Processed"
                      )
                    ) {
                      cy.log(
                        "First refund was not Paypal instead it was " +
                          response.body.results[0].type +
                          " and status was not  Processed instead it was " +
                          response.body.results[0].status
                      );
                      throw new Error(
                        "First refund was not Paypal instead it was " +
                          response.body.results[0].type +
                          " and status was not  Processed instead it was " +
                          response.body.results[0].status
                      );
                    }
                  },
                  retries: Cypress.env("marketApiRetryCount"),
                  timeout: Cypress.env("marketApiTimeout"),
                }
              ).as("refundPaymentsDetails");
              cy.get("@refundPaymentsDetails").then(
                (refundPaymentsDetails: any) => {
                  cy.log(
                    "RefundPaymentsDetails: " +
                      JSON.stringify(refundPaymentsDetails)
                  );
                  expect(refundPaymentsDetails.results.length).to.be.equal(2);
                  //Verify product refund
                  expect(refundPaymentsDetails.results[0].type).to.be.equal(
                    "PayPal"
                  );
                  expect(refundPaymentsDetails.results[0].total).to.be.equal(
                    finalProjection.invoices[0].lineItems[0].salePrice
                  );
                  expect(refundPaymentsDetails.results[0].status).to.be.equal(
                    "Processed"
                  );
                  expect(
                    refundPaymentsDetails.results[0].noOfAttempts
                  ).to.be.equal(1);
                  expect(
                    refundPaymentsDetails.results[0].paymentSource
                  ).to.be.equal("Payment");
                  expect(refundPaymentsDetails.results[0].isStoreCredit).to.be
                    .false;
                  expect(
                    refundPaymentsDetails.results[0].completedOrderPaymentType
                  ).to.be.equal("PayPal");
                  //Verify goodwill refund
                  expect(refundPaymentsDetails.results[1].type).to.be.equal(
                    "StoreCredit"
                  );
                  expect(refundPaymentsDetails.results[1].total).to.be.equal(
                    goodwillAmount
                  );
                  expect(refundPaymentsDetails.results[1].status).to.be.equal(
                    "Processed"
                  );
                  expect(
                    refundPaymentsDetails.results[1].paymentSource
                  ).to.be.equal("Goodwill");
                  expect(refundPaymentsDetails.results[1].isStoreCredit).to.be
                    .true;
                  expect(
                    refundPaymentsDetails.results[1].completedOrderPaymentType
                  ).to.be.equal("StoreCredit");
                }
              );

              //Verify the shipping refund and goodwill details
              cy.getAllRefundPaymentsByRefundIdWithRetry(
                refundsDetails.refunds[1].id,
                {
                  function: function (response: any) {
                    if (
                      !(
                        response.body.results[0].type === "PayPal" &&
                        response.body.results[0].status === "Processed"
                      )
                    ) {
                      cy.log(
                        "First refund was not Paypal instead it was " +
                          response.body.results[0].type +
                          " and status was not  Processed instead it was " +
                          response.body.results[0].status
                      );
                      throw new Error(
                        "First refund was not Paypal instead it was " +
                          response.body.results[0].type +
                          " and status was not  Processed instead it was " +
                          response.body.results[0].status
                      );
                    }
                  },
                  retries: Cypress.env("marketApiRetryCount"),
                  timeout: Cypress.env("marketApiTimeout"),
                }
              ).as("refundPaymentsDetails");
              cy.get("@refundPaymentsDetails").then(
                (refundPaymentsDetails: any) => {
                  cy.log(
                    "RefundPaymentsDetails: " +
                      JSON.stringify(refundPaymentsDetails)
                  );
                  expect(refundPaymentsDetails.results.length).to.be.equal(2);
                  //Verify product refund
                  expect(refundPaymentsDetails.results[0].type).to.be.equal(
                    "PayPal"
                  );
                  expect(refundPaymentsDetails.results[0].total).to.be.equal(
                    finalProjection.shippingAmount
                  );
                  expect(refundPaymentsDetails.results[0].status).to.be.equal(
                    "Processed"
                  );
                  expect(
                    refundPaymentsDetails.results[0].noOfAttempts
                  ).to.be.equal(1);
                  expect(
                    refundPaymentsDetails.results[0].paymentSource
                  ).to.be.equal("Payment");
                  expect(refundPaymentsDetails.results[0].isStoreCredit).to.be
                    .false;
                  expect(
                    refundPaymentsDetails.results[0].completedOrderPaymentType
                  ).to.be.equal("PayPal");
                  //Verify goodwill refund
                  expect(refundPaymentsDetails.results[1].type).to.be.equal(
                    "StoreCredit"
                  );
                  expect(refundPaymentsDetails.results[1].total).to.be.equal(
                    shippingFeeGoodwillAmount
                  );
                  expect(refundPaymentsDetails.results[1].status).to.be.equal(
                    "Processed"
                  );
                  expect(
                    refundPaymentsDetails.results[1].paymentSource
                  ).to.be.equal("Goodwill");
                  expect(refundPaymentsDetails.results[1].isStoreCredit).to.be
                    .true;
                  expect(
                    refundPaymentsDetails.results[1].completedOrderPaymentType
                  ).to.be.equal("StoreCredit");
                }
              );
            });
          });
        });
    });
  });
});
