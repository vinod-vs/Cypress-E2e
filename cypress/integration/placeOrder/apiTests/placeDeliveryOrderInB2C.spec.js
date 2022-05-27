/// <reference types="cypress" />

import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/checkout/api/commands/checkoutHelper'

TestFilter(['B2C', 'API', 'P0'], () => {
  describe('[API] Place a delivery order in B2C platform using Credit Card', () => {
    const creditCard = Cypress.env('creditCard')

    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place an order using credit card', () => {
      cy.loginWithNewShopperViaApi()

      cy.searchDeliveryAddress(addressSearchBody).then((response) => {
        expect(response.Id, 'AddressId').to.not.be.empty
      })

      cy.addDeliveryAddress().then((response) => {
        expect(response.Address.AddressId).to.greaterThan(0)

        expect(response.Address.AddressId).to.not.be.null

        expect(response.Address.AreaId).to.greaterThan(0)

        expect(response.Address.AreaId).to.not.be.null

        expect(response.Address.SuburbId).to.greaterThan(0)

        expect(response.Address.SuburbId).to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.FLEET_DELIVERY).then((response) => {
        expect(response.Id, 'Fulfilment Window ID').to.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response) => {
        expect(response, 'Fulfilment').to.have.property('IsSuccessful', true)
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Fish', 50.0).then((response) => {
        expect(response[0].stockCode, 'At least 1 product added to trolley').to.not.be.null
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Kitchen, 50.0')

      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay, 'Balance To Pay').to.be.greaterThan(0)

        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })

      cy.navigatingToCreditCardIframe().then((response) => {
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })

      cy.creditcardTokenisation(creditCard, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText, 'Credit Card tokenisation status').to.be.eqls('ACCEPTED')
        expect(response.status.error, 'Credit Card Tokenisation error').to.be.null

        digitalPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
      })

      cy.digitalPay(digitalPayment).then((response) => {
        if (response.PaymentResponses !== null) {
          expect(response.PaymentResponses[0].ErrorDetail, 'Error Status on Payment Instrument Type of ' +
          response.PaymentResponses[0].PaymentInstrumentType).to.be.null

          cy.checkForOrderPlacementErrorsAndThrow(response).then(() => {
            expect(response.TransactionReceipt, 'Payment Transaction Receipt').to.not.be.null
            expect(response.PlacedOrderId, 'Placed Order ID').to.not.be.null

            confirmOrderParameter.placedOrderId = response.PlacedOrderId
          })
        } else {
          cy.checkForOrderPlacementErrorsAndThrow(response)
        }
      })

      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId, 'OrderId').to.eqls(confirmOrderParameter.placedOrderId)

        cy.log('This is the order id: ' + response.Order.OrderId)
      })
    })
  })
})
