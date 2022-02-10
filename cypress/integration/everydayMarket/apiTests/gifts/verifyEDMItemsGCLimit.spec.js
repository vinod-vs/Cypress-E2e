/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/search/api/commands/search'
import { fulfilmentType } from '../../../../fixtures/checkout/fulfilmentType.js'
import addressSearch from '../../../../fixtures/checkout/addressSearch.json'
import '../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../support/invoices/api/commands/commands'
import '../../../../support/refunds/api/commands/commands'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../support/checkout/api/commands/confirmOrder'
import '../../../../support/payment/api/commands/creditcard'
import '../../../../support/payment/api/commands/digitalPayment'
import '../../../../support/rewards/api/commands/rewards'
import '../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../support/everydayMarket/api/commands/utility'
import tests from '../../../../fixtures/everydayMarket/apiTests.json'
import '../../../../support/payment/api/commands/giftCard'
import confirmOrderRequest from '../../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import * as lib from '../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API', 'feature'], () => {
  describe('[API] RP-5476  Verify Everyday Market Order more than 5000 cannot be placed using Gift cards', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5476  Verify Everyday Market Order more than 5000 cannot be placed using Gift cards', () => {
      const testData = tests.VerifyEDMItemsGCLimit
      const shopper = shoppers.emAccount2
      let shopperId = shopper.shopperId
      let orderId
      let orderReference

      //Login using shopper saved in the fixture
      cy.loginViaApiAndHandle2FA(shopper)
      
      // Set delivery fulfilment to 407 Elizabeth Street, Surry Hills - Delivery Address
      cy.setFulfilmentLocationWithoutWindow(fulfilmentType.DELIVERY, addressSearch)
       
      // Clear trolley in case there's any item
      cy.clearTrolley()

      //Calculate quantity of Items based on Unit Price and total Value
      cy.addEDMItemsBasedOnMinCartValueToTrolley(testData)
      cy.get('@finalQty').then((finalQty) => {
        testData.quantity = finalQty
      })
       
      //Pay the order
      cy.payTheOrder(testData).then((response) => {
        confirmOrderRequest.placedOrderId = response.PlacedOrderId
      })
      
      // Confirm the order
      cy.wait(Cypress.config('fiveSecondWait'))
      cy.confirmOrder(confirmOrderRequest).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderRequest.placedOrderId)
        expect(response.Order.OrderStatus).to.be.equal('Placed')
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference
        
        testData.orderId = orderId
        testData.orderReference = orderReference

        //Verify that the order is cancelled
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, testData.orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== 'Failed') {
              cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Failed')
              throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Failed')
            }
          },
          retries: 10,
          timeout: 5000
        }).as('finalProjection').then((response) => {

          // Order details
          expect(response.orderId).to.equal(Number(orderId))
          expect(response.shopperId).to.be.equal(Number(shopperId))
          expect(response.orderStatus).to.be.equal('FraudRejected')
          expect(response.thirdPartyOrderId).to.be.null
          expect(response.thirdPartyName).to.be.null
          expect(response.createdTimeStampUtc).to.not.be.null
          expect(response.shippingPdfLink).to.be.null
          expect(response.shippingAmount).to.not.be.null
          expect(response.invoices.length).to.be.equal(1)
          expect(response.invoices[0].wowStatus).to.be.equal('Failed')
          expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
          expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.quantity))

          // Seller details
          expect(response.invoices[0].seller.sellerId).to.not.be.null
          expect(response.invoices[0].seller.sellerName).to.be.equal(testData.sellerName)

          // Verifying Invoice details after failed order
          expect(response.invoices[0].invoiceStatus).to.be.null
          expect(response.invoices[0].wowStatus).to.be.equal('Failed')
          expect(response.invoices[0].wowId).to.not.be.null
          expect(response.invoices[0].lineItems.length).to.be.equal(1)
          expect(response.invoices[0].legacyId).to.not.be.null
          expect(response.invoices[0].legacyIdFormatted).to.not.be.null
          expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
          expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
          expect(response.invoices[0].orderTrackingStatus).to.be.equal('Placed')
          expect(response.invoices[0].pdfLink).to.be.null

          // shipments
          expect(response.invoices[0].shipments.length).to.be.equal(0)
          // Return
          expect(response.invoices[0].returns.length).to.be.equal(0)

          // Line item details
          expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
          expect(response.invoices[0].lineItems[0].lineItemId).to.be.null
          expect(response.invoices[0].lineItems[0].legacyId).to.be.equal(0)
          expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.stockcode))
          expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.quantity))
          expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(0)
          expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
          expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
          expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
          expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
          expect(response.invoices[0].lineItems[0].status).to.be.null
          expect(response.invoices[0].lineItems[0].statusFull).to.be.null

          // Shipments Details for line items
          expect(response.invoices[0].lineItems[0].shipment).to.be.null

          // Rewards Details for line items
          expect(response.invoices[0].lineItems[0].reward.offerId).to.not.be.null
          expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.not.be.null
          expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.quantity))

          // After Order failed, Invoke the events api and verify the events are updated acordingly
          cy.orderEventsApiWithRetry(testData.orderReference, {
            function: function (response) {
              if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderFailed')) {
                cy.log('Expected MarketOrderFailed event is not present')
                throw new Error('Expected MarketOrderFailed event is not present')
              }
            },
            retries: 15,
            timeout: 5000
          }).then((response) => {
            // Verify Market Order is Failed
            lib.verifyEventDetails(response, 'MarketOrderFailed', testData, shopperId, 1)
          })

          // Invoke OQS TMO api and validate it against the projection
          lib.verifyOQSOrderStatus(testData.orderId, 'Received', true, testData)
        })
      })     
    })  
    
    after(() => {
      cy.log('Test Teardown - Deleting Gift Cards')

      cy.get('@giftcardPaymentInstrumentIds').then((giftcardPaymentInstrumentIds) => {
        cy.log(giftcardPaymentInstrumentIds.length)
        giftcardPaymentInstrumentIds.forEach(instrumentId => {
          cy.removePaymentInstrument(instrumentId.InstrumentId)
        });
      }) 
    })  
  })
})