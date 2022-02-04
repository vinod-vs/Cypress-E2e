/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType.js'
import addressSearch from '../../../fixtures/checkout/addressSearch.json'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/invoices/api/commands/commands'
import '../../../support/refunds/api/commands/commands'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import tests from '../../../fixtures/everydayMarket/apiTests.json'
import confirmOrderRequest from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'

TestFilter(['EDM', 'API', 'feature'], () => {
  describe('[API] RP-5476  Verify Everyday Market Order more than 5000 cannot be placed using Gift cards', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5476  Verify Everyday Market Order more than 5000 cannot be placed using Gift cards', () => {
      const testData = tests.VerifyEDMItemsGCLimit
      const searchTerm = testData.searchTerm // Fuzzyard Mutli Variant-reversible Bed - Fandango Reversible Bed 55g
      const quantity = testData.quantity
      const shopper = shoppers.emAccount5ForBlaze
      let myshopperId = shopper.shopperId
      let orderId = 140109182

      //Login using shopper saved in the fixture
      cy.loginViaApiAndHandle2FA(shopper)

      // Set delivery fulfilment to 407 Elizabeth Street, Surry Hills - Delivery Address
      cy.setFulfilmentLocationWithoutWindow(fulfilmentType.DELIVERY, addressSearch)

      // Clear trolley in case there's any item
      cy.clearTrolley()

      // Add Pet Culture items to trolley
      cy.addAvailableEDMItemsToTrolley(searchTerm, quantity)

      //Complete Order Placement using the newly generated gift cards
      cy.payTheOrder(testData).then((response) => {
        confirmOrderRequest.placedOrderId = response.PlacedOrderId
      })

      // Confirm the order
      cy.wait(Cypress.config('fiveSecondWait'))
      cy.confirmOrder(confirmOrderRequest).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderRequest.placedOrderId)
        expect(response.Order.OrderStatus).to.be.equal('Placed')
        orderId = response.Order.OrderId.toString()
        cy.log(orderId)
      }) 
      
      //Verify that the order is cancelled
      cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(myshopperId, orderId, {
        function: function (response) {
          if (response.body.invoices[0].wowStatus !== 'Failed') {
            cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Failed')
            throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Failed')
          }
        },
        retries: 10,
        timeout: 5000
      }).then((response) => {
        expect(response.orderStatus).to.be.equal('FraudRejected')
        expect(response.invoices[0].wowStatus).to.be.equal('Failed')
        expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
        expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.quantity))
      })
    })
  })
})