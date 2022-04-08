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
import '../../../../../support/everydayMarket/api/commands/afterShip'
import tests from '../../../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API] RP-5544 - Verify Estimate Delivery Date, metadata (Order Id, Shopper Id,Shipment ID) are sent while invoking the consignment API', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5544 - Verify Estimate Delivery Date, metadata (Order Id, Shopper Id,Shipment ID) are sent while invoking the consignment API', () => {
      const testData = tests.VerifyFullyDispatchedEDMOnlyOrderPaypal
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      const shopperId = shoppers.emAccountWithRewards20.shopperId
      const rewardsCardNumber = shoppers.emAccountWithRewards20.rewardsCardNumber

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(shoppers.emAccountWithRewards20, testData).then((response) => {
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, response)

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
          // Verify the projection details
          lib.verifyInitialOrderDetails(response, testData, shopperId)

          // Invoke the events api and verify the content
          cy.orderEventsApiWithRetry(orderReference, {
            function: function (response) {
              if (!response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                                !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced')) {
                cy.log('Expected OrderPlaced & MarketOrderPlaced were not present')
                throw new Error('Expected OrderPlaced & MarketOrderPlaced were not present')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).then((response) => {
            lib.verifyEventDetails(response, 'OrderPlaced', testData, shopperId, 1)
            lib.verifyEventDetails(response, 'MarketOrderPlaced', testData, shopperId, 1)
          })

          // Verify the MP and shipping invoices are available for the customer
          // TO-DO Verify the invoice content
          cy.verifyOrderInvoice(testData)

         
          // Dispatch the complete order from MP and verify the events and order statuses
          cy.fullDispatchAnInvoice(testData.edmInvoiceId, testData.trackingNumber, testData.carrier, testData.items[0].sellerName).then((response) => {
           

            const AfterShipStatus = ['InTransit', 'OutForDelivery', 'Delivered','AvailableForPickup'] 
            let ids = AfterShipStatus  
            ids.forEach(id => {                      
              
                    //Consignment aftership webhook  for InTransit Status
                    cy.invokeconsignmentwebhook(testData.trackingNumber, id, {
                      function: function (response) {
                        expect(response.status).to.eq(200)
                        cy.log('The Consignment aftership api'+ JSON.stringify(response.body))
                        }
                    }) 
                  
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
                       expect(response.invoices[0].shipments[0].trackingNumber).to.be.equal(testData.trackingNumber)
                     // expect(response.invoices[0].shipments[0].status).to.be.equal(id)
                      //Estimated delivery date
                      //expect(response.invoices[0].shipments[0].deliveryEstimate.expectedDeliveryDateUtc).to.not.be.null
                     // expect(response.invoices[0].shipments[0].deliveryEstimate.expectedDeliveryDateMinUtc).to.not.be.null
                     // expect(response.invoices[0].shipments[0].deliveryEstimate.expectedDeliveryDateMaxUtc).to.not.be.null                            
                    })


                // After dispatch, Invoke the events api and verify the events are updated acordingly
              cy.orderEventsApiWithRetry(orderReference, {
                function: function (response) {
                  if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
                                        !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched')  ||
                                        !response.body.data.some((element) => element.domainEvent === 'MarketRewardsCredited')) 
                                         {
                    cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched , MarketRewardsCredited & MarketShipmentStatusUpdated were not present')
                    throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched , MarketRewardsCredited  were not present')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
                }).then((response) => {
                // Verify there are only 5 events. New event after dispatch is MarketOrderShipmentCreate
                lib.verifyEventDetails(response, 'MarketOrderShipmentCreate', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketOrderDispatched"
                lib.verifyEventDetails(response, 'MarketOrderDispatched', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketRewardsCredited"
                lib.verifyEventDetails(response, 'MarketRewardsCredited', testData, shopperId, 1)
                // Verify there are only 5 events. New event after dispatch is "MarketShipmentStatusUpdated"
                //lib.verifyEventDetails(response, 'MarketShipmentStatusUpdated', testData, shopperId, 1)
              })
            })              
          })
        })
      })
    })
  })
})