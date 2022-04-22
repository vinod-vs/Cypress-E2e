/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from "../../../../../fixtures/everydayMarket/shoppers.json";
import TestFilter from "../../../../../support/TestFilter";
import "../../../../../support/siteManagement/ui/commands/login";
import "../../../../../support/siteManagement/ui/commands/homepage";
import "../../../../../support/siteManagement/ui/commands/orderManagement";
import "../../../../../support/everydayMarket/api/commands/orderApi";
import "../../../../../support/invoices/api/commands/commands";
import "../../../../../support/refunds/api/commands/commands";
import "../../../../../support/everydayMarket/api/commands/orderApi";
import "../../../../../support/everydayMarket/api/commands/marketplacer";
import "../../../../../support/everydayMarket/api/commands/utility";
import "../../../../../support/everydayMarket/ui/commands/siteManagementHelpers";
import "../../../../../support/everydayMarket/ui/commands/siteManagementValidationHelpers"
import smLogins from '../../../../../fixtures/siteManagement/loginDetails.json'

import '../../../../../support/login/api/commands/login'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/refunds/api/commands/commands'
import '../../../../../support/orders/api/commands/amendOrder'
//import * as lib from '../../../../../support/everydayMarket/api/commands/validationHelpers'
import * as lib from "../../../../../support/everydayMarket/api/commands/commonHelpers";

import wowDispatchData from '../../../../../fixtures/wowDispatch/wowDispatch.json'
import eventsRequest from '../../../../../fixtures/wowDispatch/wowDispatchDataPrep.json'
import '../../../../../support/wowDispatch/wowStatusUpdates'

import { onOrderManagement } from "../../../../../support/siteManagement/ui/pageObjects/OrderManagement"


TestFilter(['EDM', 'EDM-HYBRID', 'EDM-E2E-HYBRID'], () => {
  describe("[API]  RP-5538-EM|MP|SM-VerifyDeliveryUnlimitedDiscountForEMitemsAndDisplayedInSM", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });

    it("[API]  RP-5538-EM|MP|SM-VerifyDeliveryUnlimitedDiscountForEMitemsAndDisplayedInSM", () => {
      const searchTerm = 'treats'   // 'everyday market'
      const duDiscountSource = 'DeliveryPlusSubscription'
      const duTarget = 'MarketShippingFee'
      const duDiscountAmount = 10
      const marketEMShippingFee= 0
      const purchaseQty = 2
      const marketSubTotalLowerLimit = 50
      const marketSubTotalUpperLimit = 100
      //let shopperId: any;
      let req: any;
      let orderId: any;
      let WoolworthsSubtotal: any;
      let edmOrderId: any;
      let edmInvoiceId: any;
      let checkOutResponse:any;
      let response:any;
      let marketSubtotal:any
      let doubleRewardPoints:any

      const shopperId = shoppers.emAccountWithRewards27.shopperId;

      //PreCondition- Login with a Shopper Which is DU Subscribed and Rewards Card associated in the Account
      cy.loginViaApiAndHandle2FA(shoppers.emAccountWithRewards27)
      cy.log('LoggedIn Shopper id is = ' + shoppers.emAccountWithRewards27.shopperId )
      cy.log('LoggedIn EmailId id is = ' + shoppers.emAccountWithRewards27.email )
      cy.log('LoggedIn Password is = ' + shoppers.emAccountWithRewards27.password )
      cy.log('LoggedIn Rewards Card Number is = ' + shoppers.emAccountWithRewards27.rewardsCardNumber)

      // Add Wow + EM Multi Seller Items in the Cart
      cy.prepareAnyMultiSellerLineItemWowAndEdmOrder(searchTerm, purchaseQty)

      // Add EM ONLY Multi Seller Items in the Cart
      //cy.prepareAnyMultiSellerLineItemEdmOrder(searchTerm, purchaseQty)

      //Verify the DU Discount on CheckOut Page- 
      // If Condition -> 'MarketSubtotal' >= $50 but <= $100
      // Order -> MarketShippingFees -> Promotions -> [0] -> Verify 'DiscountSource'  'Target'  'Amount'
      cy.navigateToCheckout().then((checkOutResponse) => {
       //cy.log("checkOutResponse VendorName is === " + checkOutResponse.Model.Order.MarketDeliveryDetails.ThirdPartyVendorDeliveryInfoList[0].VendorName)
        cy.log("checkOutResponse Market Subtotal is = " + checkOutResponse.Model.Order.MarketSubtotal)
        cy.log("checkOutResponse Woolworths Subtotal is = " + checkOutResponse.Model.Order.WoolworthsSubtotal) 
        cy.log("checkOutResponse Total Deferred Discount Amount is = " + checkOutResponse.Model.Order.TotalDeferredDiscountAmount)  
        marketSubtotal = checkOutResponse.Model.Order.MarketSubtotal 

        cy.log("checkOutResponse DU DiscountSource is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].DiscountSource)
        cy.log("checkOutResponse DU Discount Amount is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Amount)
        cy.log("checkOutResponse DU DiscountTarget is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Target)
        cy.log("checkOutResponse marketEMShipping Fee is = " + checkOutResponse.Model.Order.MarketShippingFees.MarketShippingFee)
        cy.log("checkOutResponse doubleRewardPointsEarned is = " + checkOutResponse.Model.Order.TotalRewardsPointsEarned)


        if(marketSubtotal >= marketSubTotalLowerLimit && marketSubtotal <= marketSubTotalUpperLimit)
        {
          cy.log(" ---------- DU Discount is Applicable and Discount Details Below ----------")
        //  cy.log("checkOutResponse DU DiscountSource is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].DiscountSource)
        //  cy.log("checkOutResponse DU Discount Amount is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Amount)
        //  cy.log("checkOutResponse DU DiscountTarget is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Target)
        //  cy.log("checkOutResponse marketEMShipping Fee is = " + checkOutResponse.Model.Order.MarketShippingFees.MarketShippingFee)
        //  cy.log("checkOutResponse doubleRewardPointsEarned is = " + checkOutResponse.Model.Order.TotalRewardsPointsEarned)
          doubleRewardPoints = Math.round((checkOutResponse.Model.Order.MarketSubtotal + checkOutResponse.Model.Order.WoolworthsSubtotal - checkOutResponse.Model.Order.TotalDeferredDiscountAmount) * 2 )
          cy.log(" double RewardsPoints Calculated is = " + doubleRewardPoints )
          expect(checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].DiscountSource).to.be.equal(duDiscountSource)
          expect(checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Target).to.be.equal(duTarget)
          expect(checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Amount).to.be.equal(duDiscountAmount)
          expect(checkOutResponse.Model.Order.MarketShippingFees.MarketShippingFee).to.be.equal(marketEMShippingFee)
          expect(checkOutResponse.Model.Order.TotalRewardsPointsEarned).to.be.equal(doubleRewardPoints)
        
      //Place Order
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')
      cy.get('@confirmedTraderOrder').then((confirmedOrder) => 
      {
        req = { ...eventsRequest,  shopperId: shopperId,  orderId: confirmedOrder.Order.OrderId,
                orderReference: confirmedOrder.Order.OrderReference, WoolworthsSubtotal: confirmedOrder.Order.WoolworthsSubtotal
              }
        cy.wrap(req.orderId).as('orderId')       
        cy.wrap(WoolworthsSubtotal).as('WoolworthsSubtotal')
      
        cy.orderEventsApiWithRetry(req.orderReference, 
        { function: function (response) 
          { if ( !response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                 !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced') ) 
                { cy.log('Expected OrderPlaced & MarketOrderPlaced to be present')
                  throw new Error('Expected OrderPlaced & MarketOrderPlaced to be present')
                } // Ends - If
          }, // Ends - function: function (response) {
          retries: Cypress.env('marketApiRetryCount'),
          timeout: 10000
        }) // ENDS - cy.orderEventsApiWithRetry(req.orderReference, {
          .as("finalProjection")
          .then((response) => 
          { edmOrderId = response.invoices[0].legacyIdFormatted;
            edmInvoiceId = response.invoices[0].legacyId;
            cy.log( "In finalProjection the MPOrder Id: " + edmOrderId + ", and MPInvoice Id: " + edmInvoiceId );     
          }) // ENDS - .then((response) => {



      /*  cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
          function: function (response) 
          { if (response.body.invoices[0].wowStatus !== "Placed") 
            { cy.log("wowStatus was " + response.body.invoices[0].wowStatus + " instead of Placed" );
              throw new Error( "wowStatus was " + response.body.invoices[0].wowStatus + " instead of Placed" )
            } // Ends - If
          }, // Ends - function: function (response) {
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        })      // ENDS - cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
          .as("finalProjection")
          .then((response) => 
          { edmOrderId = response.invoices[0].legacyIdFormatted;
            edmInvoiceId = response.invoices[0].legacyId;
            cy.log( "In finalProjection the MPOrder Id: " + edmOrderId + ", and MPInvoice Id: " + edmInvoiceId );     
          }) // ENDS - .then((response) => {
      */
           
      })  // ENDS - cy.get('@confirmedTraderOrder').then((confirmedOrder) => {         
     
        
        
        
        
        

        




      }  // ENDS- IF        
        else {
          cy.log("DU Discount is Not Applicable")
        }  // ENDS - Else 
      })  // ENDS- cy.navigateToCheckout().then((checkOutResponse) => {
      






      //Later, Put Logic to Verify the Rewards Points on Order Details Page and 
      //Later, Put Logic to Include the FreeShipping Threshold  i.e. 'MarketSubtotal' >= $100 


    
    
    })
  })
})  
