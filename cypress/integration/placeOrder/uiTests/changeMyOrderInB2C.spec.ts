/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import { MyOrderPage } from '../../../support/myOrder/ui/pageObjects/MyOrderPage'
import { onOrderDetailsPage } from '../../../support/myOrder/ui/pageObjects/OrderDetailsPage'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'
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

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'E2E'], () => {
  const deliveryAddress = '1 Chatswood Ave, CHATSWOOD NSW 2067'
  const searchTerm = 'pet'
  const trolleyThreshold = 30.0
  const platform = Cypress.env('b2cPlatform')

  describe('[UI] Change Order in MyOrders for order placed by B2C customer', () => {
    before('open application', () => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Place an order via api for B2C customer, then Change the order in MyOrders/order details UI', () => {
      // Login via api using new shopper
      cy.loginWithNewShopperViaApi()

      // Place an order via api
      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        deliveryAddress,
        windowType.ALL_AVAILABLE
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        searchTerm,
        trolleyThreshold
      )

      creditCardPayment.save = true
      cy.placeOrderViaApiWithAddedCreditCard(platform, creditCardPayment).then(
        (confirmOrderResponse: any) => {
          // Save the Order Id of the order placed
          const orderId = confirmOrderResponse.Order.OrderId

          // Navigate to UI - My order page
          cy.visit('/shop/myaccount/myorders')
          cy.wait(500)

          // Passing the orderId to the Page object constructor
          const onMyOrderPage = new MyOrderPage(orderId)

          // Get to the Order details on My Orders page and Change the order
          onMyOrderPage.getMyOrderNumber().should('contain', orderId)
          onMyOrderPage.getViewOrderDetailsLink().click()
          onOrderDetailsPage.getChangeOrderButton().click()
          onOrderDetailsPage.getMyOrderModalCheckbox().then((checkbox) => {
            cy.wrap(checkbox)
              .should('not.be.visible')
              .check({ force: true })
              .should('be.checked')
          })
          onOrderDetailsPage
            .getChangeMyOrderModalButton()
            .should('contain', 'Change my order')
            .click({ force: true })
          cy.wait(500)

          onSideCartPage.getAvailableProductsInCartPanel().should('be.visible')

          // check cart if any items are under any notifications and remove them
          onSideCartPage
            .getCloseSideCartButton()
            .click({ force: true, multiple: true })
          onSideCartPage.removeAllItemsUnderNotificationGroupsFromCart()

          // Increase the Order total by adding more products to cart
          onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold(
            'household',
            50,
            'Price High to Low'
          )

          onSideCartPage.getViewCartButton().click()

          cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

          onSideCartPage.getTotalAmountElement().then((totalAmount) => {
            cy.wrap(totalAmount.text()).as('expectedTotalAmount')
          })

          onSideCartPage.gotoCheckout()

          cy.wait('@fulfilmentWindow')

          const expectedTotalAmountAlias = 'expectedTotalAmount'

          onCheckoutPage.onCheckoutFulfilmentWindowPanel.selectEdit()
          onCheckoutPage.onCheckoutFulfilmentWindowPanel.enterDeliveryNotes(
            'Ring the bell'
          )
          onCheckoutPage.onCheckoutFulfilmentWindowPanel.toggleLeaveUnattended(
            true
          )
          onCheckoutPage.onCheckoutFulfilmentWindowPanel.toggleSelfIsolation(
            true
          )
          onCheckoutPage.onCheckoutFulfilmentWindowPanel.selectContinue()

          onCheckoutPage.onCheckoutPaymentPanel
            .getPaymentTotalAmountElement()
            .then((totalAmount) => {
              cy.wrap(totalAmount.text()).as(expectedTotalAmountAlias)
            })

          onCheckoutPage.onCheckoutPaymentPanel.payWithExistingCreditCard(
            '0321',
            creditCardPayment.bb
          )
          cy.wait(500)

          // Verify order confirmation page

          onOrderConfirmationPage.VerifyOrderConfirmationHeader()
          onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)
        }
      )
    })
  })
})
