/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/siteManagement/ui/commands/login'
import '../../../../../support/siteManagement/ui/commands/homepage'
import '../../../../../support/siteManagement/ui/commands/orderManagement'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/invoices/api/commands/commands'
import '../../../../../support/refunds/api/commands/commands'
import tests from '../../../../../fixtures/everydayMarket/apiTests.json'

import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import '../../../../../support/everydayMarket/ui/commands/siteManagementHelpers'
import '../../../../../support/everydayMarket/ui/commands/siteManagementValidationHelpers'
import smLogins from '../../../../../fixtures/siteManagement/loginDetails.json'

import '../../../../../support/login/api/commands/login'

import '../../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../../support/rewards/api/commands/rewards'

import '../../../../../support/orders/api/commands/amendOrder'
// import * as lib from '../../../../../support/everydayMarket/api/commands/validationHelpers'
import * as lib from '../../../../../support/everydayMarket/api/commands/commonHelpers'

import wowDispatchData from '../../../../../fixtures/wowDispatch/wowDispatch.json'
import eventsRequest from '../../../../../fixtures/wowDispatch/wowDispatchDataPrep.json'
import '../../../../../support/wowDispatch/wowStatusUpdates'


import { json } from 'stream/consumers'
// added below on 17th June for SM thing
import { OrderManagementMenu } from 'cypress/support/siteManagement/ui/commands/OrderManagementMenu'
import { HomepageTopMenu } from 'cypress/support/siteManagement/ui/commands/HomepageTopMenu'
import { onOrderManagement } from '../../../../../support/siteManagement/ui/pageObjects/OrderManagement'

TestFilter(['EDM', 'EDM-HYBRID', 'EDM-E2E-HYBRID'], () => {
  describe('[API]  RP-5538-EM|MP|SM-VerifyDeliveryUnlimitedDiscountForEMitemsAndDisplayedInSM', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it("[API]  RP-5538-EM|MP|SM-VerifyDeliveryUnlimitedDiscountForEMitemsAndDisplayedInSM", () => {
      const testData = tests.VerifyDispatchOfEDMOrderForDU
      const searchTerm = 'treats'   // 'everyday market'
      const duDiscountSource = 'DeliveryPlusSubscription'
      const duDiscountSourceId = 16764
      const duTarget = 'MarketShippingFee'
      const duDiscountAmount = 10
      const marketEMShippingFee= 0
      const purchaseQty = 1
      const marketSubTotalLowerLimit = 50
      const marketSubTotalUpperLimit = 100
      //let shopperId: any;
      let req: any;
      let orderId: any;
      let WoolworthsSubtotal: any;
      let checkOutResponse:any;
      let response:any;
      let marketSubtotal:any
      let doubleRewardPoints:any
      let edmOrderId: any;
      let edmInvoiceId: any;
      let encodedEdmInvoiceId:any
      let encodedEdmLineitemId:any


      const shopperId = shoppers.emAccountWithRewards27.shopperId

      // PreCondition- Login with a Shopper Which is DU Subscribed and Rewards Card associated in the Account
      cy.loginViaApiAndHandle2FA(shoppers.emAccountWithRewards27)
      cy.log('LoggedIn Shopper id is = ' + shoppers.emAccountWithRewards27.shopperId)
      cy.log('LoggedIn EmailId id is = ' + shoppers.emAccountWithRewards27.email)
      cy.log('LoggedIn Password is = ' + shoppers.emAccountWithRewards27.password)
      cy.log('LoggedIn Rewards Card Number is = ' + shoppers.emAccountWithRewards27.rewardsCardNumber)

    //Now, Implement UI automation to Verify the Site Management Verification      
    //Login to SM and Navigate to the edmOrderId
    cy.siteManagementLoginViaUi(smLogins.email, smLogins.password)
    cy.selectTopMenu(HomepageTopMenu.ORDER_MANAGEMENT)
    cy.selectOrderManagementSubMenu(OrderManagementMenu.CUSTOMER_SEARCH)
    cy.wait(Cypress.config('twoSecondWait'))
    onOrderManagement.getOrderIDTextField().click({ force: true })
    cy.wait(Cypress.config('twoSecondWait'))
    // Enter 'EM Order Id'
    onOrderManagement.getOrderIDTextField().should('be.visible').type('EM0072123')
    // Click on 'Customer Search' Button
    onOrderManagement.getCustomerSearchButton().should('be.visible').click()
    // Click on 'View All Orders' Button --> For This in OrderManagement.ts file Added the Locator for this Button
    onOrderManagement.getViewAllOrdersButton().click()
    // Now,Search for the Above EM order Id and Corresponding Column of 'Delivery Unlimited Total Discount'
    onOrderManagement.getOrderNumberColumnLabel().each(($e1, index, $list) => 
    {
      const OrderNumberColumnValue = $e1.text()
      if(OrderNumberColumnValue.includes("EM0072123"))
      {  onOrderManagement.getDeliveryUnlimitedTotalDiscountColumnLabel().eq(index).then(function (DeliveryUnlimitedTotalDiscountValue) {
         expect(DeliveryUnlimitedTotalDiscountValue.text()).contains(duDiscountAmount) }) 
      }
    })



      //Later, Put Logic to Verify the Rewards Points on Order Details Page and 
    
    })
  })
})
