/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from "../../../support/TestFilter";
import "../../../support/siteManagement/ui/commands/login";
import "../../../support/siteManagement/ui/commands/homepage";
import "../../../support/siteManagement/ui/commands/orderManagement";
import "../../../support/everydayMarket/api/commands/orderApi";
import shoppers from "../../../fixtures/everydayMarket/shoppers.json";
import "../../../support/invoices/api/commands/commands";
import "../../../support/refunds/api/commands/commands";
import "../../../support/everydayMarket/api/commands/orderApi";
import "../../../support/everydayMarket/api/commands/marketplacer";
import "../../../support/everydayMarket/api/commands/utility";
import "../../../support/everydayMarket/ui/commands/siteManagementHelpers";
import "../../../support/everydayMarket/ui/commands/siteManagementValidationHelpers"
import tests from "../../../fixtures/everydayMarket/apiTests.json";
import smLogins from '../../../fixtures/siteManagement/loginDetails.json'

TestFilter(['EDM-HYBRID'], () => {
  describe("[API]  RP-5339 - Create and WOW + EDM order and verify both the order details on SM", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });

    it("[API]  RP-5339 - Create and WOW + EDM order and verify both the order details on SM", () => {
      const testData = tests.GenericWOWPlusEDMPPPaymentTestData;
      let orderId: any;
      let orderReference: any;
      let edmOrderId: any;
      let edmInvoiceId: any;
      const shopperId = shoppers.emAccount2.shopperId;

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(
        shoppers.emAccount2,
        testData
      ).then((response) => {
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
          retries: 10,
          timeout: 5000,
        })
          .as("finalProjection")
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
          });
      });

      //Login to SM and verify the order details
      cy.get("@finalProjection").then((response) => {
        cy.loginToSMAndSearchOrder(smLogins, orderId)
        cy.validateOrderDetailsOnSM(false);
      });
    });
  });
});
