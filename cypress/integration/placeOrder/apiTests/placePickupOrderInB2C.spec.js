/// <reference types="cypress" />

import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/address/api/commands/searchSetValidateAddress'
import '../../../support/checkout/api/commands/checkoutHelper'

TestFilter(['B2C', 'API', 'SPUD', 'E2E'], () => {
  describe('[API] Place a Pick up order in B2C platform using Credit Card', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place a Pick up order using a credit card', () => {
      cy.loginWithNewShopperViaApi()

      cy.searchBillingAddressViaApi(addressSearchBody.search).then((response) => {
        cy.setBillingAddressViaApi(response.body.Response[0].Id)
      })

      cy.searchPickupDTBStores(fulfilmentType.PICK_UP, storeSearchBody.suburb).then((response) => {
        expect(response.AddressId, 'Pick up store Address Id').to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.PICK_UP).then((response) => {
        expect(response.Id, 'Fulfilment Window Id').to.be.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response) => {
        expect(response, 'Fulfilment').to.have.property('IsSuccessful', true)
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Kitchen', 50.0)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Pet', 50.0)

      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay, 'Balance To Pay').to.be.greaterThan(30.0)

        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })

      cy.navigatingToCreditCardIframe().then((response) => {
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })

      cy.creditcardTokenisation(Cypress.env('creditCard'), creditcardSessionHeader).then((response) => {
        expect(response.status.responseText, 'Credit Card Tokenisation').to.be.eqls('ACCEPTED')

        digitalPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
      })

      cy.digitalPay(digitalPayment).then((response) => {
        cy.checkForOrderPlacementErrorsAndThrow(response).then(() => {
          expect(response.TransactionReceipt, 'Transaction Receipt').to.not.be.null
          expect(response.PlacedOrderId, 'Placed Order Id').to.not.be.null

          confirmOrderParameter.placedOrderId = response.PlacedOrderId
        })
      })

      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId, 'Order Id').to.eqls(confirmOrderParameter.placedOrderId)

        cy.log('This is the order id: ' + response.Order.OrderId)
      })
    })
  })
})
