/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import { MyOrderPage } from '../../../support/myOrder/ui/pageObjects/MyOrderPage'
import { onOrderDetailsPage } from '../../../support/myOrder/ui/pageObjects/OrderDetailsPage'
import '../../../support/login/api/commands/login'
import '../../../support/delivery/api/commands/options'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/address/api/commands/searchSetValidateAddress'
import '../../../support/login/ui/commands/login'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'P0', 'E2E'], () => {
  const searchTerm = 'Kitchen'
  const trolleyThreshold = 50.0
  const platform = Cypress.env('b2cPlatform')

  describe('[UI] Cancel Order in MyOrders for order placed by B2C customer', () => {
    before('open application', () => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Place an order via api for B2C customer, then cancel the order in MyOrders/order details UI', () => {
      // Login via api using new shopper
      cy.loginWithNewShopperViaApi()

      // Place an order via api
      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody,
        windowType.ALL_AVAILABLE
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        searchTerm,
        trolleyThreshold
      )

      cy.placeOrderViaApiWithAddedCreditCard(platform, creditCardPayment).then(
        (confirmOrderResponse: any) => {
          // Save the Order Id of the order placed
          const orderId = confirmOrderResponse.Order.OrderId

          // Navigate to UI - My order page
          cy.visit('/shop/myaccount/myorders')
          cy.wait(500)

          // Passing the orderId to the Page object constructor
          const onMyOrderPage = new MyOrderPage(orderId)

          // Get to the Order details on My Orders page and cancel the order
          onMyOrderPage.getMyOrderNumber().should('contain', orderId)
          onMyOrderPage.getViewOrderDetailsLink().click()
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
