/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shopper from '../../../fixtures/login/b2cLogin.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
import fulfilmentType from '../../../fixtures/checkout/fulfilmentType.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/deliveryDateAndWindow/api/commands/deliveryDateAndWindow'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'

TestFilter(['B2C-API'], () => {
  describe('[API] Place a Direct to boot order in B2C platform using Credit Card', () => {
    before(() => {
      cy.clearCookies( { domain: null })
      cy.clearLocalStorage( {domain: null })
    })

    it('Should place a Direct to boot order using credit card', () => {
      cy.loginViaApi(shopper)

      cy.searchPickupDTBStores(storeSearchBody.postCode, fulfilmentType.directToBoot).then((response) => {
          expect(response[0].AddressId).to.not.be.null
      })

      cy.directToBootTimeSlot().then((response) => {
        expect(response).to.have.length.greaterThan(0);
      })

      cy.directToBootFulfilment().then((response) => {
        expect(response).to.have.property('IsSuccessful', true)
      })

      cy.clearTrolley()

      searchBody.searchTerm = 'Water'

      // TODO: RC 17/08/21: Consider moving this into 1 command, e.g. 'addAvailableNonRestrictedWowItemsToTrolley'
      cy.productSearch(searchBody).then((searchResponse) => {
        expect(searchResponse.SearchResultsCount).to.be.greaterThan(0)
        cy.findAvailableNonRestrictedWowItems(searchResponse).then((itemResponse) => {
          cy.curateProductsForTrolley(itemResponse).then((curatedItemList) => {
            curatedItemList.forEach((curatedItem) => {
              cy.addItemsToTrolley(curatedItem).then((response) => {
                expect(response.Totals.WoolworthsSubTotal).to.be.greaterThan(0)
              })   
            })
          })   
        })
      })

      cy.navigateToCheckout().then((response) => {
        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay

        cy.navigatingToCreditCardIframe().then((response) => {
          expect(response).to.have.property('Success', true)
    
          creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
        })
      })

      cy.creditcardPayment(creditCardPayment, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText).to.be.eqls('ACCEPTED')
    
        digitalPayment.payments[0].paymentInstrumentId = response.itemId
      })
    
      cy.digitalPay(digitalPayment).then((response) => {
        expect(response.TransactionReceipt).to.not.be.null
    
        expect(response.PlacedOrderId).to.not.be.null

        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })
    
      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)
    
        cy.log('This is the order id: ' + response.Order.OrderId)
      })
    })
  })   
})  