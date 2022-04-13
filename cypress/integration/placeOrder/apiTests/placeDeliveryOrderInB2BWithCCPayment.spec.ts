/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shopper from '../../../fixtures/login/b2bLogin.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
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

const searchTerm = 'Fish'
const trolleyThreshold = 50.00
const platform = Cypress.env('b2bPlatform')

TestFilter(['B2B' ,'API', 'P0'], () => {
  describe('[API] Place a delivery order on Woolworths at Work website using Credit Card', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place an order on Woolworths at Work website using Credit Card as payment option', () => {
      cy.loginViaApi(shopper).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.searchDeliveryAddress(addressSearchBody).then((response: any) => {
        expect(response.Id).to.not.be.empty

        expect(response.Id).to.not.be.null
      })

      cy.addDeliveryAddress().then((response: any) => {
        expect(response.Address.AddressId).to.greaterThan(0)

        expect(response.Address.AddressId).to.not.be.null

        expect(response.Address.AreaId).to.greaterThan(0)

        expect(response.Address.AreaId).to.not.be.null

        expect(response.Address.SuburbId).to.greaterThan(0)

        expect(response.Address.SuburbId).to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.FLEET_DELIVERY).then((response: any) => {
        expect(response.Id).to.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        expect(response).to.have.property('IsSuccessful', true)
      })

      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)

        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)

        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })

      cy.placeOrderViaApiWithAddedCreditCard(platform, creditCardPayment).then(() => {
      })
    })
  })
})
