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
      const purchaseQty = 1
      //let shopperId: any;
      let req: any;
      let orderId: any;
      let WoolworthsSubtotal: any;
      let edmOrderId: any;
      let edmInvoiceId: any;

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
      
      //Place Order
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')
 
      cy.get('@confirmedTraderOrder').then((confirmedOrder) => {
        req = {
          ...eventsRequest,
          shopperId: shopperId,
          orderId: confirmedOrder.Order.OrderId,
          orderReference: confirmedOrder.Order.OrderReference,
          WoolworthsSubtotal: confirmedOrder.Order.WoolworthsSubtotal
        }

      })
    
    
    })
  })
})  
