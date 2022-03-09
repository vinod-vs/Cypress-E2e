/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from "../../../../support/TestFilter";
import "../../../../support/siteManagement/ui/commands/login";
import "../../../../support/siteManagement/ui/commands/homepage";
import "../../../../support/siteManagement/ui/commands/orderManagement";
import "../../../../support/everydayMarket/api/commands/orderApi";
import "../../../../support/invoices/api/commands/commands";
import "../../../../support/refunds/api/commands/commands";
import "../../../../support/everydayMarket/api/commands/orderApi";
import "../../../../support/everydayMarket/api/commands/marketplacer";
import "../../../../support/everydayMarket/api/commands/utility";
import "../../../../support/everydayMarket/ui/commands/siteManagementHelpers";
import "../../../../support/everydayMarket/ui/commands/siteManagementValidationHelpers"
import smLogins from '../../../../fixtures/siteManagement/loginDetails.json'

import '../../../../support/login/api/commands/login'
import '../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../support/rewards/api/commands/rewards'
import '../../../../support/refunds/api/commands/commands'
import '../../../../support/orders/api/commands/amendOrder'
import * as lib from '../../../../support/everydayMarket/api/commands/validationHelpers'
import * as commonLib from '../../../../support/everydayMarket/api/commands/commonHelpers'

import wowDispatchData from '../../../../fixtures/wowDispatch/wowDispatch.json'
import eventsRequest from '../../../../fixtures/wowDispatch/wowDispatchDataPrep.json'

import '../../../../support/wowDispatch/wowStatusUpdates'


TestFilter(['EDM', 'EDM-HYBRID'], () => {
  describe("[API]  RP-5469-E2E-Automation-Regression-Scenario-4-EM|SM|EMCancellationWithWowDispatchAndSMReIssue", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });

    it("[API]  RP-5469-E2E-Automation-Regression-Scenario-4-EM|SM|EMCancellationWithWowDispatchAndSMReIssue", () => {
      const searchTerm = 'automation'
      const purchaseQty = 2
      let shopperId: any;
      let req: any;
      let orderId: any;
      let WoolworthsSubtotal: any;
      let edmOrderId: any;
      let edmInvoiceId: any;

      const testData = wowDispatchData.wowDispatchJSON

      // Sign up for a new shopper
      cy.loginWithNewShopperViaApi()
  
      cy.get('@signUpResponse').then((signUpResp) => {
        shopperId = signUpResp.ShopperId
        cy.wrap(shopperId).as('shopperId')
        cy.log('Shopper id is === ' + shopperId )
      })

      // Place single line item EDM order with quantity = 2, using 'automation' as search term
      // and grab the first any available EDM item returned by search
      cy.prepareAnySingleLineItemWowAndEdmOrder(searchTerm, purchaseQty)
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')
 
      cy.get('@confirmedTraderOrder').then((confirmedOrder) => {
        req = {
          ...eventsRequest,
          shopperId: shopperId,
          orderId: confirmedOrder.Order.OrderId,
          orderReference: confirmedOrder.Order.OrderReference,
          WoolworthsSubtotal: confirmedOrder.Order.WoolworthsSubtotal
        }
        cy.wrap(req.orderId).as('orderId')       
        cy.wrap(WoolworthsSubtotal).as('WoolworthsSubtotal')
      
       cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response) {
            if (!response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                            !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced')) {
              cy.log('Expected OrderPlaced & MarketOrderPlaced to be present')
              throw new Error('Expected OrderPlaced & MarketOrderPlaced to be present')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: 10000
        })  // orderEventsApiWithRetry- ENDS   

        // Invoke Market Order API and verify the projection content
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== "Placed") {
              cy.log("wowStatus was " + response.body.invoices[0].wowStatus + " instead of Placed" );
              throw new Error( "wowStatus was " + response.body.invoices[0].wowStatus + " instead of Placed" )
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        })
          .as("finalProjection")
          .then((response) => {
            edmOrderId = response.invoices[0].legacyIdFormatted;
            edmInvoiceId = response.invoices[0].legacyId;
            cy.log( "In finalProjection the MPOrder Id: " + edmOrderId + ", and MPInvoice Id: " + edmInvoiceId );     
          });

      // Now Calling WowDispatch'UpdateCompletedOrder'
      cy.wowDispatchUpdateCompletedOrder(req.shopperId , req.orderId, req.WoolworthsSubtotal, testData )

      })   
      
      // Now UI section to Perform the ReIssue from Site Management So, First Login to SM and verify the order details
      cy.get("@finalProjection").then((response) => {
       cy.loginToSMAndSearchOrder(smLogins, testData.OrderID)
       //Verify that Wow Order Status is displayed as 'Dispatched' under 'Woolworths orders' Tab
       cy.performReIssueOnWowOrderOnSM(false);
      });

      // TO do - Code to Perform ReIssue from the SM UI using "Woolworths Orders" Tab

    
  })
  });
});
