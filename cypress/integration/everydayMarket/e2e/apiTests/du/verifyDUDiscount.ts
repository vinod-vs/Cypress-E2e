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

import { onOrderManagement } from '../../../../../support/siteManagement/ui/pageObjects/OrderManagement'
import { json } from 'stream/consumers'

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

      // Add Wow + EM Multi Seller Items in the Cart
      //cy.prepareAnyMultiSellerLineItemWowAndEdmOrder(searchTerm, purchaseQty)
      
      cy.prepareLineItemForWowAndEdmOrderForDU(searchTerm, marketSubTotalUpperLimit)

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

        //cy.log("checkOutResponse DU DiscountSource is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].DiscountSource)
        //cy.log("checkOutResponse DU Discount Amount is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Amount)
        //cy.log("checkOutResponse DU DiscountTarget is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Target)
        //cy.log("checkOutResponse marketEMShipping Fee is = " + checkOutResponse.Model.Order.MarketShippingFees.MarketShippingFee)
        //cy.log("checkOutResponse doubleRewardPointsEarned is = " + checkOutResponse.Model.Order.TotalRewardsPointsEarned)
          //cy.log("checkOutResponse DeliveryUnlimitedEligibility.Eligibility is = " + checkOutResponse.Model.Order.MarketOrder.DeliveryUnlimitedEligibility.Eligibility)
 
        if(marketSubtotal >= marketSubTotalLowerLimit && marketSubtotal <= marketSubTotalUpperLimit)
        {
          cy.log(" ---------- DU Discount is Applicable and Discount Details Below ----------")
          cy.log("In CheckOutResponse DU DiscountSource is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].DiscountSource)
          cy.log("In CheckOutResponse DU Discount Amount is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Amount)
          cy.log("In CheckOutResponse DU DiscountTarget is = " + checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Target)
          cy.log("In CheckOutResponse marketEMShipping Fee is = " + checkOutResponse.Model.Order.MarketShippingFees.MarketShippingFee)
          cy.log("In CheckOutResponse TotalRewardsPointsEarned is = " + checkOutResponse.Model.Order.TotalRewardsPointsEarned)
          doubleRewardPoints = Math.round((checkOutResponse.Model.Order.MarketSubtotal + checkOutResponse.Model.Order.WoolworthsSubtotal - checkOutResponse.Model.Order.TotalDeferredDiscountAmount) * 2 )
          cy.log(" double RewardsPoints Calculated is = " + doubleRewardPoints )
          //cy.wait(Cypress.config("tenSecondWait"))
          expect(checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].DiscountSource).to.be.equal(duDiscountSource)
          expect(checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Target).to.be.equal(duTarget)
          expect(checkOutResponse.Model.Order.MarketShippingFees.Promotions[0].Amount).to.be.equal(duDiscountAmount)
          expect(checkOutResponse.Model.Order.MarketShippingFees.MarketShippingFee).to.be.equal(marketEMShippingFee)
          expect(checkOutResponse.Model.Order.MarketOrder.DeliveryUnlimitedEligibility.Eligibility).to.be.equal("Eligible")
          expect(checkOutResponse.Model.Order.MarketOrder.IsDeliveryUnlimitedEligible).to.be.equal(true)
        // Temp -->  expect(checkOutResponse.Model.Order.TotalRewardsPointsEarned).to.be.equal(doubleRewardPoints)
        
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
        //  .as("finalProjection")
        //  .then((response) => 
        //  { //edmOrderId = response.body.data.element.domainEvent
        //    edmInvoiceId = response.invoices[0].legacyId;
        //   //cy.log( "In finalProjection the MPOrder Id: " + edmOrderId + ", and MPInvoice Id: " + edmInvoiceId )  
        //    cy.log( "In finalProjection the MPInvoice Id: " + edmInvoiceId )     
        //  }) // ENDS - .then((response) => {

        //Add Validation for Newly Added API attribute for DU Eligible- as per Ticket - done         //https://woolworthsdigital.atlassian.net/browse/MPWEB-1622 
        //Now, Dispatch EM items and then Verify the 'RedeemMarketOrderSavings'Event
        //https://marketk8saae.uat.wx-d.net/order-api/api/v1/events?shopperId=8518293&orderReference=96XZN-2JSP0W&domainEvent=RedeemMarketOrderSavings
        //IMPROVISE - How to Find all the EM Orders Placed and Dispatch ALL EM Orders


        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
          function: function (response) 
          { if (response.body.invoices[0].wowStatus !== "Placed") 
            { cy.log("wowStatus was " + response.body.invoices[0].wowStatus + " instead of Placed" );
              throw new Error( "wowStatus was " + response.body.invoices[0].wowStatus + " instead of Placed" )
            } // Ends - If
          }, // Ends - function: function (response) {
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        })      // ENDS - cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
        .as("finalProjection").then((response) => 
          {
            edmOrderId = response.invoices[0].legacyIdFormatted
            edmInvoiceId = response.invoices[0].legacyId
            encodedEdmInvoiceId = response.invoices[0].invoiceId
            encodedEdmLineitemId = response.invoices[0].lineItems[0].lineItemId
            testData.edmOrderId = edmOrderId
            testData.edmInvoiceId = edmInvoiceId
            cy.log('In finalProjection the MPOrder Id: ' + edmOrderId + ' , and MPInvoice Id: ' + edmInvoiceId)              

          // Dispatch the complete order from MP and verify the events and order statuses
          //cy.log("testData.items[0].sellerName >>>>>>>>>>>>>>>>>>>>>>>>>>>  " + testData.items[0].sellerName)
          cy.log("response.invoices[0].seller. >>>>>>>>>>>>>>>>>>>>>>>>>>>  " + response.invoices[0].seller.sellerName)
          cy.log("response.invoices[0].seller.sellerId >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> " + response.invoices[0].seller.sellerId)

          cy.fullDispatchAnInvoice(testData.edmInvoiceId, testData.trackingNumber, testData.carrier, response.invoices[0].seller.sellerName)
          //cy.fullDispatchAnInvoice(testData.edmInvoiceId, testData.trackingNumber, testData.carrier, testData.items[0].sellerName)
          .then((response) => {
            // After dispatch, Invoke the order api and verify the projection content is updated acordingly
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, req.orderId, {
              function: function (response) {
                if (response.body.invoices[0].wowStatus !== 'Shipped') {
                  cy.log('EM Order Status was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                  throw new Error('EM Order Status was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
              //timeout: 40000
            }).then((response) => {
              // Order details
              //lib.verifyCommonOrderDetails(response, testData, shopperId)
              // Seller details
              expect(response.invoices[0].seller.sellerId).to.not.be.null
              cy.log("response.invoices[0].seller. ===============================  " + response.invoices[0].seller.sellerName)
              cy.log("response.invoices[0].seller.sellerId =============================== " + response.invoices[0].seller.sellerId)
              //expect(response.invoices[0].seller.sellerName).to.be.equal(testData.items[0].sellerName)
              
              cy.orderEventsApiForRedeemMarketOrderSavings(req.orderReference, {
                function: function (response) {
                  if (!response.body.data.some((element) => element.domainEvent === 'RedeemMarketOrderSavings')) 
                  {
                    cy.log('Expected RedeemMarketOrderSavings is not present')
                    throw new Error('Expected RedeemMarketOrderSavings is not present')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }) //.then((response) => {

   // Verify DU Discount Details on the My Order Details Page,  Hit the MyOrderDetails Page API and Verify the DU Discount Details
    cy.myOrderDetailsDUDiscount(req.orderId).as('myOrderDetailsDUDiscount')
    cy.get('@myOrderDetailsDUDiscount').then((duDiscountDetails) => 
    {
      cy.log("OrderDiscountDetailsList[0].DiscountSourceId = "  + duDiscountDetails.OrderDiscountDetailsList[0].DiscountSourceId)
      cy.log("OrderDiscountDetailsList[0].Source = "  + duDiscountDetails.OrderDiscountDetailsList[0].Source)
      cy.log("OrderDiscountDetailsList[0].Target = "  + duDiscountDetails.OrderDiscountDetailsList[0].Target)
      cy.log("MarketShippingFeeBeforeDiscount = "  + duDiscountDetails.PaymentDetails.MarketShippingFeeBeforeDiscount)
      cy.log("MarketShippingFeeDiscount = "  + duDiscountDetails.PaymentDetails.MarketShippingFeeDiscount)
      cy.log("MarketShippingFee = "  + duDiscountDetails.PaymentDetails.MarketShippingFee)

      expect(duDiscountDetails.OrderDiscountDetailsList[0].DiscountSourceId).contains(duDiscountSourceId)
      expect(duDiscountDetails.OrderDiscountDetailsList[0].Source).contains(duDiscountSource)
      expect(duDiscountDetails.OrderDiscountDetailsList[0].Target).contains(duTarget)
      expect(duDiscountDetails.PaymentDetails.MarketShippingFeeBeforeDiscount).equals(10)
      expect(duDiscountDetails.PaymentDetails.MarketShippingFeeDiscount).equals(10)
      expect(duDiscountDetails.PaymentDetails.MarketShippingFee).equals(0)
    })  // ENDS - cy.get('@myOrderDetailsDUDiscount').then((duDiscountDetails) =>

          









              // After dispatch, Invoke the events api and verify the events are updated acordingly
            /*  cy.orderEventsApiWithRetry(req.orderReference, {
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
                //lib.verifyEventDetails(response, 'MarketOrderShipmentCreate', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
                //lib.verifyEventDetails(response, 'MarketOrderDispatched', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
                //lib.verifyEventDetails(response, 'MarketRewardsCredited', testData, shopperId, 1)
              })
              */

              /*
              cy.refundRequestCreateInitiatedBy(encodedEdmInvoiceId, encodedEdmLineitemId, testData.items[0].quantity, true, initiator)
              .then((response) => {
                // Verify Order Projection details
                cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
                  retries: Cypress.env('marketApiRetryCount'),
                  timeout: Cypress.env('marketApiTimeout')
                }).then((response) => {
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
                  }).as('finalProjection').then((response) => {
                    // Invoke OQS TMO api and validate it against the projection
                    lib.verifyOQSOrderStatus(testData.orderId, 'Received', false, testData)
                  })
                })
              })  // ENDS - cy.refundRequestCreateInitiatedBy
              */





              

            }) // ENDS - }).then((response) => {
          }) // ENDS - cy.fullDispatchAnInvoice
          



          
          }) // ENDS - .then((response) => {
      


      // Method to Hit the ReDeem Event-
      Cypress.Commands.add('orderEventsApiForRedeemMarketOrderSavings', (traderOrderReference, retryOptions) => {
          const endPoint = String(
            //https://marketk8saae.uat.wx-d.net/order-api/api/v1/events?shopperId=8518293&orderReference=96XZN-2LCT1Z&domainEvent=RedeemMarketOrderSavings
            Cypress.env('ordersApiEndpoint') + Cypress.env('ordersApiEventsEndpoint') + '?orderReference=' + traderOrderReference + '&domainEvent=RedeemMarketOrderSavings'
          )
          cy.retryRequest(endPoint, 
            {
              method: 'GET',
              retries: retryOptions.retries,
              timeout: retryOptions.timeout,
              function: retryOptions.function
            }).then((response) => {
            expect(response.status).to.eq(200)
            return response.body
          })
        }) //ENDS - Cypress.Commands.add( 'orderEventsApiForRedeemMarketOrderSavings',
          

        Cypress.Commands.add('myOrderDetailsDUDiscount', (orderId) => {
          //cy.getCookies().then((cookies1) => {cy.log("cookies are ---" + JSON.stringify(cookies1))})
          cy.api({
            method: 'GET',
            headers: { 'x-api-key': 'OZTQsBAyFNPq7q2AS80UGvKwPERyu8uF' },   
            //url: Cypress.env('amendOrderEndPoint'),
            url: 'https://test.mobile-api.woolworths.com.au/wow/v1/orders/api/orders/' + orderId ,
          }).then((response) => {
            expect(response.status).to.eq(200)
            return response.body
          })
        }) // ENDS - Cypress.Commands.add('myOrderDetailsDUDiscount', (orderId) => {
        




      })  // ENDS - cy.get('@confirmedTraderOrder').then((confirmedOrder) => {         
     
        
        
        
        
        

        




      }  // ENDS- IF        
        else {
          cy.log("DU Discount is Not Applicable Because in checkOutResponse EM Subtotal is = " + checkOutResponse.Model.Order.MarketSubtotal)
        }  // ENDS - Else 
      })  // ENDS- cy.navigateToCheckout().then((checkOutResponse) => {
      






      //Later, Put Logic to Verify the Rewards Points on Order Details Page and 
      //Later, Put Logic to Include the FreeShipping Threshold  i.e. 'MarketSubtotal' >= $100 


    
    
    })
  })
})
