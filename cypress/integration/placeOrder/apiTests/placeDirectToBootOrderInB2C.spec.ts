/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
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
import '../../../support/address/api/commands/searchSetValidateAddress'
import '../../../support/checkout/api/commands/checkoutHelper'

TestFilter(['B2C', 'API', 'P0'], () => {
  describe('[API] Place a Direct to boot order in B2C platform using Credit Card', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place a Direct to boot order using credit card', () => {
      cy.loginWithNewShopperViaApi()

      cy.searchBillingAddressViaApi(addressSearchBody.search).then((response: any) => {
        cy.setBillingAddressViaApi(response.body.Response[0].Id)  
      })

      cy.searchPickupDTBStores(fulfilmentType.DIRECT_TO_BOOT, storeSearchBody.postCode).then((response: any) => {
        expect(response.AddressId, 'Pick up store Address Id').to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.DIRECT_TO_BOOT).then((response: any) => {
        expect(response.Id, 'Fulfilment Window Id').to.be.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        expect(response, 'Fulfilment').to.have.property('IsSuccessful', true)
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Water', 60.0)

      cy.navigateToCheckout().then((response: any) => {
        const balanceToPay = response.Model.Order.BalanceToPay
        expect(balanceToPay, 'Balance To Pay').to.be.greaterThan(0)

        digitalPayment.payments[0].amount = balanceToPay

        cy.navigatingToCreditCardIframe().then((response: any) => {
          expect(response, 'Credit Card Iframe loading').to.have.property('Success', true)

          creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
        })
      })

      cy.creditcardTokenisation(creditCardPayment, creditcardSessionHeader).then((response: any) => {
        expect(response.status.responseText, 'Credit Card Tokenisation').to.be.eqls('ACCEPTED')

        digitalPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
      })

      cy.digitalPay(digitalPayment).then((response: any) => {
        
        cy.checkForOrderPlacementErrorsAndThrow(response).then(() => {
          expect(response.TransactionReceipt, 'Transaction Receipt').to.not.be.null
          expect(response.PlacedOrderId, 'Placed Order Id').to.not.be.null
  
          confirmOrderParameter.placedOrderId = response.PlacedOrderId
        })
      })

      cy.confirmOrder(confirmOrderParameter).then((response: any) => {
        expect(response.Order.OrderId, 'Order Id').to.eqls(confirmOrderParameter.placedOrderId)

        cy.log('This is the order id: ' + response.Order.OrderId)
      })
    })
  })
})
