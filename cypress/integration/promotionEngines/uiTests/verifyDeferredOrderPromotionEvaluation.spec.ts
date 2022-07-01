/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'
import { onSideCartPage } from 'cypress/support/sideCart/ui/pageObjects/SideCartPage'
import { onCheckoutPage } from 'cypress/support/checkout/ui/pageObjects/CheckoutPage'
import '../../../support/login/ui/commands/login'
import '../../../support/utilities/ui/utility'

TestFilter(['UI', 'B2C', 'PES', 'P2', 'OHNO'], () => {
  describe('[UI] Verify Deferred Order Promotion Evaluation', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginViaUi(shoppers.PESAccount2)
    })

    it('Verify the Deferred Order promotion is applied to get fixed points and earn credits', () => {
      // Search for untraceable item stockcode
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(promotions.DeferredOrderPromotions[0].stockcode.toString()).type('{enter}')

      // Capture the item price
      cy.wait(1000)
      onSearchResultsPage.getProductPrice().then(function (amountElement) {
        const amount = amountElement.text()
        cy.log('Item amount: ' + amount)
      })

      // Adding item once
      cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
      cy.wait(1000)

      onHomePage.getViewCart().click()
      onSideCartPage.gotoCheckout()
      onCheckoutPage.onCheckoutPaymentPanel.getPaymentRewardsPointElement().should('contain',  promotions.DeferredOrderPromotions[0].TotalRewardsPointsEarned + ' points')
      onCheckoutPage.onCheckoutPaymentPanel.getPaymentCreditsEarnedElement().should('contain', promotions.DeferredOrderPromotions[0].BeingEarned + ' credits')
    })

    afterEach(() => {
      // clear cart
      onCheckoutPage.getContinueShoppingLink().click()
      cy.wait(1000)
      onHomePage.getViewCart().click()
      onSideCartPage.removeAllItems()
    })
  })
})
