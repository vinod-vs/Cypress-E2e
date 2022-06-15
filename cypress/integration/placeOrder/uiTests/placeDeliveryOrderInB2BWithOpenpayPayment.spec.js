/// <reference types="Cypress" />
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import shoppers from '../../../fixtures/login/b2bShoppers.json'
import tradingAccount from '../../../fixtures/fulfilmentMethod/tradeAccountDetails.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/fulfilment/ui/commands/deliveryDateAndWindow'

TestFilter(['B2B', 'UI'], () => {
  describe('[UI] Place an order in B2B with OpenPay Payment', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    it('Place an order in B2B with OpenPay Payment', () => {
      // Login
      cy.loginViaUi(shoppers[3])

      // Select Delivery date Window
      cy.selectDeliveryDateAndWindow(tradingAccount[0].trading_acc_address)

      onSideCartPage.cleanupTrolley()

      onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold('health', 30, 'Aisle')

      onSideCartPage.getViewCartButton().click()

      onSideCartPage.gotoCheckout()

      onCheckoutPage.onCheckoutPaymentPanel.payWithOpenPayForB2BOrders()
    })
  })
})
