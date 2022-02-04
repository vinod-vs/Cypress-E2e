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


TestFilter(['UI', 'B2C', 'PES', 'P1', 'OHNO'], () => {
  describe('[UI] Verify Order Promotion Evaluation', () => {
    
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Verify the Order promotion is applied on the grocery subtotal - $OFF and delivery Fee - $OFF', () => {
      cy.loginViaUi(shoppers.PESAccount1)

      // Search for untraceable item stockcode
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(promotions.OrderPromotions[3].stockcode.toString()).type('{enter}')

      // Capture the item price
      cy.wait(1000)
      onSearchResultsPage.getProductPrice().then(function (amountElement) {
        const amount = amountElement.text()

        cy.log('Item amount: ' + amount)
      })

      // Adding item once
      cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
      cy.wait(1000)

      onHomePage.getViewCartButton().click()
      onSideCartPage.gotoCheckout()
      onCheckoutPage.onCheckoutPaymentPanel.getPaymentDeliveryFeeDiscountAmountElement().should('contain', "$" + promotions.OrderPromotions[1].DeliveryFeeDiscount + ".00")
      
      //clear cart
      onCheckoutPage.getContinueShoppingLink().click()
      onHomePage.getViewCartButton().click()
      onSideCartPage.removeAllItems()

    })

  })
})
