/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shopper from '../../../fixtures/login/b2cLogin.json'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType.js'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
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

TestFilter(['B2C-API'], () => {
  describe('[API] Place a Direct to boot order in B2C platform using Credit Card', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place a Direct to boot order using credit card', () => {
      cy.loginViaApi(shopper)

      cy.searchPickupDTBStores(fulfilmentType.DIRECT_TO_BOOT, storeSearchBody.postCode).then((response: any) => {
        expect(response[0].AddressId).to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.DIRECT_TO_BOOT).then((response: any) => {
        expect(response.Id).to.be.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        expect(response).to.have.property('IsSuccessful', true)
      })

      cy.clearTrolley()

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Water', 60.0)

      cy.navigateToCheckout().then((response: any) => {
        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay

        cy.navigatingToCreditCardIframe().then((response: any) => {
          expect(response).to.have.property('Success', true)

          creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
        })
      })

      cy.creditcardPayment(creditCardPayment, creditcardSessionHeader).then((response: any) => {
        expect(response.status.responseText).to.be.eqls('ACCEPTED')

        digitalPayment.payments[0].paymentInstrumentId = response.itemId
      })

      cy.digitalPay(digitalPayment).then((response: any) => {
        expect(response.TransactionReceipt).to.not.be.null

        expect(response.PlacedOrderId).to.not.be.null

        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })

      cy.confirmOrder(confirmOrderParameter).then((response: any) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)

        cy.log('This is the order id: ' + response.Order.OrderId)
      })
    })
  })
})
