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
import '../../../../../support/afterShip/api/commands/afterShip'
import '../../../../../support/mailosaur/api/commands/mailosaurHelpers'
import tests from '../../../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../../../support/everydayMarket/api/commands/commonHelpers'
import { afterShipShipmentStatus } from '../../../../../support/afterShip/api/commands/shipmentStatus'

const { JSDOM } = require('jsdom')
const testData: any = tests.VerifyFullyDispatchedEDMOrder
let orderId: any
let orderReference: any
let edmOrderId: any
let edmInvoiceId: any
let sellerName: any
let carrierName: any
const shopper: any = shoppers.emailTest4
const shopperId: any = shopper.shopperId
const emailId: any = shopper.email
let lineItemLegacyId: any
let encodedEdmInvoiceId: any
let encodedEdmLineitemId: any
const sentFrom: string = 'shoponline@woolworths.com.au'

TestFilter(['EDM', 'API', 'EDM-E2E-API' , 'EmailNotifications'], () => {
  describe('[API] RP-5606 - Verify EDM order, Seller and Tracking number details of the Shipment Email Notification', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5606 - Verify EDM order, Seller and Tracking number details of the Shipment Email Notification', () => {
      const randomnum = Math.floor(Math.random() * (9 * (Math.pow(10, 5)))) + (Math.pow(10, 5))
      const trackNo = testData.trackingNumber + randomnum  
      const carrierName = testData.carrier    
      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(shopper, testData).then((response) => {
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

       
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
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
           
          // Dispatch the complete order from MP and verify the events and order statuses
          cy.fullDispatchAnInvoice(testData.edmInvoiceId, trackNo, testData.carrier, testData.items[0].sellerName).then((response) => {
            // Iterate the four shipment status
            const afterShipStatus = [afterShipShipmentStatus.IN_TRANSIT, afterShipShipmentStatus.OUT_FOR_DELIVERY, afterShipShipmentStatus.DELIVERED, afterShipShipmentStatus.AVAILABLE_FOR_PICKUP]
            const ids = afterShipStatus
            ids.forEach(id => {
              // After dispatch, Invoke the order api and verify the projection content is updated acordingly
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
                function: function (response) {
                  if (response.body.invoices[0].wowStatus !== 'Shipped') {
                    cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                    throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }).as('finalProjection').then((response) => {
                // Shipments
                expect(response.invoices[0].shipments[0].trackingNumber).to.be.equal(trackNo)
              })

              // After dispatch, Invoke the events api and verify the events are updated acordingly
              cy.orderEventsApiWithRetry(orderReference, {
                function: function (response) {
                  if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
                                        !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched')) {
                    cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched were not present')
                                throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched , MarketRewardsCredited  were not present')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              })

              // Consignment aftership webhook  for each of the Shipment Status
              cy.invokeConsignmentWebhook(trackNo, id, {
                function: function (response) {
                  expect(response.status).to.eq(200)
                  cy.log('The Consignment aftership api' + JSON.stringify(response.body))
                }
              })

              // After invoking consignment- Aftership Webhok, Invoke the order api and verify the projection content is updated with Shipment status and Estimated Delivery Dates
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
                function: function (response) {
                  if (response.body.invoices[0].wowStatus !== 'Shipped') {
                    cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                    throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Shipped')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }).as('finalProjection').then((response) => {

                //sellerName
                sellerName = response.invoices[0].seller.sellerName
                // Shipments
                expect(response.invoices[0].shipments[0].trackingNumber).to.be.equal(trackNo)
              })

              // After dispatch, Invoke the events api and verify the events are updated acordingly
              cy.orderEventsApiWithRetry(orderReference, {
                function: function (response) {
                  if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
                                              !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched') ||                                              
                                              !response.body.data.some((element) => element.domainEvent === 'MarketShipmentStatusUpdated')) {
                    cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched , MarketRewardsCredited & MarketShipmentStatusUpdated were not present')
                    throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched , MarketRewardsCredited & MarketShipmentStatusUpdated were not present')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }).then((response) => {
                // Verify the event has got"MarketShipmentStatusUpdated" for the respective Shipment Status {'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'AVAILABLE_FOR_PICKUP'}
                lib.verifyShipmentStatusDetails(response, 'MarketShipmentStatusUpdated', testData, shopperId, id)                          

                // Verify the Aftership shipment Notification email for each of the status ['InTransit', 'OutForDelivery', 'Delivered', 'AwaitingCollection']
                cy.wait(5000)
                cy.verifyAftershipShipmentStatusEmailDetails(id,trackNo,sellerName,carrierName)
              })
            })
          })
        })
      })
    })
  })
})

Cypress.Commands.add('verifyAftershipShipmentStatusEmailDetails', (id,trackNo,sellerName,carrierName) => {
  let expectedSubject: any
  let expectedSellerCarrierText: any  
  let expectedSellerCarrierAdditionalTxt: any  
  let thankYouOrderText: any 
  cy.getOrderStatus(testData.orderId).as('oosOqsResponse').then((oosOqsResponse) => {         
        cy.getEmailDetails(emailId, expectedSubject, sentFrom)              
        cy.get('@emailDetails').then((emailDetails) => { 
      
        switch(id) {
          case "InTransit":
            expectedSubject = 'Your Everyday Market order ' + edmOrderId + ' is on its way'
            expectedSellerCarrierText = 'Great news! The following Everyday Market item(s) from ' + sellerName + ' have\n\t\t\t\t\t\t\tbeen shipped \t\t\t\t\t\t\t\t\tby ' + carrierName + '\n and is/are on their way to you:'
            //expectedSellerCarrierText = 'Great news! The following Everyday Market item(s) from ' + sellerName + ' have been shipped by ' + carrierName + ' and is/are on their way to you:'
            thankYouOrderText = 'Thank you for your recent order with us: ' + edmOrderId
            console.log('thankYouOrderText: ' + thankYouOrderText)
            expect(emailDetails.body).to.include(thankYouOrderText)
            break
          case "OutForDelivery":
            expectedSubject = 'Your Everyday Market order ' + edmOrderId + ' is out for delivery'
            expectedSellerCarrierText = 'Your order ' + edmOrderId + ' is out for delivery with ' + carrierName + ' and is estimated to arrive today.'
            break
          case "Delivered":
            expectedSubject = 'Your Everyday Market order ' + edmOrderId + ' has been delivered'
            expectedSellerCarrierText = 'Your order ' + edmOrderId + ' from ' + sellerName + ' has been delivered. Thank you for shopping with us.'
            break
          case "AvailableForPickup":
            expectedSubject = 'Your Everyday Market order ' + edmOrderId + ' is awaiting collection'
            expectedSellerCarrierText = 'Your order ' + edmOrderId + ' is awaiting collection as it was not able to be delivered. Please check the tracking link below for more details or contact ' + carrierName 
            expectedSellerCarrierAdditionalTxt = 'If it\'s not picked up it will be sent back to ' + sellerName + ' and a refund will be processed.'
            expect(emailDetails.body).to.include(expectedSellerCarrierAdditionalTxt)
            break
          }               

          // Verify common details
          const body = emailDetails.body.toLowerCase()
          expect(emailDetails.subject).to.be.equal(expectedSubject)
          expect(emailDetails.body).to.include(expectedSellerCarrierText)          
          expect(emailDetails.body).to.include(edmOrderId)          
          expect(emailDetails.body).to.include('Your Everyday Market team')

          // Validate the track no and Product details for the shipments except delivered status
          if (id.indexOf("Delivered") == -1 ) {
          expect(emailDetails.body).to.include(trackNo)
          expect(emailDetails.body).to.include('Tracking number')   
            // Verify EDM items
            let i
            const edmItems = oosOqsResponse.MarketOrders
            edmItems.forEach(function (item, i) {
              let j
              const products = oosOqsResponse.MarketOrders[i].Products
              products.forEach(function (product, j) {
              expect(body).to.include(oosOqsResponse.MarketOrders[i].Products[j].Name.toLowerCase())
              expect(body).to.include(Number(oosOqsResponse.MarketOrders[i].Products[j].Quantity))
            })
            })   

          // Validate the estimated arrival for order on its way and out for delivery
          if (id.indexOf("AvailableForPickup") == -1 ) {expect(emailDetails.body).to.include('Estimated arrival')}
           expect(emailDetails.dom.window.document.querySelector("td[align='right']>a[href*='/mypost/track/#/details/"+ trackNo +"']") !== null).to.be.true           
          }

          //Verify links          
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/help-and-support-faq']") !== null).to.be.true          
          expect(emailDetails.dom.window.document.querySelector("a[href*='/Shop/Discover/about-us/terms-and-conditions']") !== null).to.be.true                    
        })
  })
}) 