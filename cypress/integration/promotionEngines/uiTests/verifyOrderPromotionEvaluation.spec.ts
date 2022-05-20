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
  describe('[UI] Verify Order Promotion Evaluation', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginViaUi(shoppers.PESAccount2)
    })

    it('Verify the Order promotion is applied on the grocery subtotal - $OFF and delivery Fee - $OFF', () => {
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

      onHomePage.getViewCart().click()
      onSideCartPage.gotoCheckout()
      onCheckoutPage.onCheckoutPaymentPanel.getOrderDiscountAmountElement().should('contain', '$' + promotions.OrderPromotions[3].OrderDiscountWithoutTeamDiscount + '.00')
      onCheckoutPage.onCheckoutPaymentPanel.getPaymentDeliveryFeeDiscountAmountElement().should('contain', '$' + promotions.OrderPromotions[3].DeliveryFeeDiscount + '.00')
    })

    it('Verify the Order promotion is applied on the grocery subtotal - %OFF and delivery Fee - %OFF', () => {
      const promotionQualifyAmount = 100
      const itemCost = promotions.OrderPromotions[3].Subtotal
      let totalCost = 0

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
      totalCost = itemCost

      // add more items
      while (totalCost < promotionQualifyAmount) {
        onSearchResultsPage.getIncreaseQuantityButton().click()
        totalCost = totalCost + itemCost
      }

      onHomePage.getViewCart().click()
      onSideCartPage.gotoCheckout()
      onCheckoutPage.onCheckoutPaymentPanel.getOrderDiscountAmountElement().should('contain', '$' + totalCost + '.00')
      onCheckoutPage.onCheckoutPaymentPanel.getPaymentDeliveryFeeAmountElement().then(function (deliveryFeeElement) {
      onCheckoutPage.onCheckoutPaymentPanel.getPaymentDeliveryFeeDiscountAmountElement().should('contain', '$' + promotions.OrderPromotions[3].DeliveryFeeDiscount + '.00')
      })
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
