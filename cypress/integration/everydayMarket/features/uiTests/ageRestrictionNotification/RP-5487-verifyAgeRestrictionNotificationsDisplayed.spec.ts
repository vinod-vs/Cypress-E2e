/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from '../../../../../support/TestFilter'
import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import { onHomePage } from '../../../../../support/homePage/ui/pageObjects/HomePage'
import { onSearchResultsPage } from '../../../../../support/search/ui/pageObjects/SearchResultsPage'
import { onSideCartPage } from '../../../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onCheckoutPage } from '../../../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onOrderConfirmationPage } from '../../../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
import '../../../../../support/login/ui/commands/login'
import '../../../../../support/utilities/ui/utility'
import '../../../../../support/sideCart/ui/commands/clearTrolley'
import '../../../../../support/everydayMarket/api/commands/utility'

TestFilter(['FEATURE', 'AGERESTRICTION'], () => {
  describe('[UI] RP-5487 - EM | Make age restriction alert consistent across Checkout and Order Confirmation', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5487 - EM | Make age restriction alert consistent across Checkout and Order Confirmation', () => {
      const searchTerm = 'age restricted'

      // Login as Manic shopper
      cy.loginViaUi(shoppers.emAccount4ForManic)
      cy.clearTrolleyViaUi()

      // Search for age restricted item
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(searchTerm).type('{enter}')

      // Add the item to cart
      onSearchResultsPage.addItemToCart(1).click()

      // Go to checkout
      onSideCartPage.getViewCartButton().click()
      onSideCartPage.getCheckoutButton().click({ multiple: true, force: true })

      // Verify the restricted item notification is displayed on checkout page
      onCheckoutPage.onCheckoutMarketplaceFulfilmentWindowPanel.restrictedNotification().getPrimaryHeaderText().should('contain', 'restricted')
      onCheckoutPage.onCheckoutMarketplaceFulfilmentWindowPanel.selectContinue()

      // Place the order
      cy.getExpectedCCCardDetails()
      cy.get('@creditCardToUse').then((cc) => {
        onCheckoutPage.onCheckoutPaymentPanel.payWithNewCreditCard(cc.aa, cc.dd, cc.ee, cc.bb)
      })

      // Verify the restricted item notification is displayed on order confirmation page
      onOrderConfirmationPage.restrictedNotification().getPrimaryHeaderText().should('contain', 'restricted')
    })
  })
})
