/// <reference types="Cypress" />
import shopper from '../../../fixtures/login/b2bLogin.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import TestFilter from '../../../support/TestFilter'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
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
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType.js'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import { MyOrderPageB2B } from '../../../support/myOrder/ui/pageObjects/MyOrderPageB2B'
import { onOrderDetailsPage } from '../../../support/myOrder/ui/pageObjects/OrderDetailsPage'

const searchTerm = 'baby'
const trolleyThreshold = 50.0
const platform = Cypress.env('b2bPlatform')

TestFilter(['B2B', 'UI'], () => {
  describe('Place a pickup order in B2B with credit card payment and cancel the order', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    it('Should place a pickup order on Woolworths at Work website using Credit Card as payment option', () => {
      cy.loginViaApi(shopper).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.searchDeliveryAddress(addressSearchBody).then((response: any) => {
        expect(response.Id).to.not.be.empty

        expect(response.Id).to.not.be.null
      })

      cy.searchPickupDTBStores(
        fulfilmentType.PICK_UP,
        storeSearchBody.postCode
      ).then((response: any) => {
        expect(response.AddressId).to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.PICK_UP).then((response: any) => {
        expect(response.Id).to.be.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        if (!response.IsSuccessful) {
          cy.completeWindowFulfilmentViaApi().then((newResponse: any) => {
            expect(newResponse).to.have.property('IsSuccessful', true)
          })
        }
      })

      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)

        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        searchTerm,
        trolleyThreshold
      )

      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)

        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })

      cy.placeOrderViaApiWithAddedCreditCard(platform, creditCardPayment).then(
        (confirmOrderResponse: any) => {
          // Save the Order Id of the order placed
          const orderId = confirmOrderResponse.Order.OrderId
          cy.wait(500)

          // Navigate to UI - My order page
          cy.visit('/shop/myaccount/myorders')
          cy.wait(5000)

          // Passing the orderId to the Page object constructor
          const onMyOrderPageB2B = new MyOrderPageB2B(orderId)

          // Get to the Order details on My Orders page and cancel the order
          onMyOrderPageB2B.getMyOrderNumber().should('contain', orderId)
          onMyOrderPageB2B.getViewOrderDetailsLink().click()
          onOrderDetailsPage.getCancelMyOrderButton().click()
          onOrderDetailsPage.getMyOrderModalCheckbox().then((chekbox) => {
            cy.wrap(chekbox)
              .should('not.be.visible')
              .check({ force: true })
              .should('be.checked')
          })
          onOrderDetailsPage.getCancelMyOrderModalButton().click()
          cy.wait(500)
          onOrderDetailsPage.getCancelledStatus().should('contain', 'Cancelled')
        }
      )
    })
  })
})
