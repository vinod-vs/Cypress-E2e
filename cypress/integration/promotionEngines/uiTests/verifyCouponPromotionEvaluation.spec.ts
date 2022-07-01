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
  describe('[UI] Verify Coupon Promotion Evaluation', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginViaUi(shoppers.PESAccount2)
    })

    it('Verify the Coupon promotion is applied on the grocery subtotal - %OFF & $OFF and Delivery Fee - % OFF & $OFF', () => {
      // Search for untraceable item stockcode
      let deliveryFee = 0
      var itemCost = 0.00
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(promotions.CouponPromotions[0].stockcode.toString()).type('{enter}')

      // Capture the item price
      cy.wait(1000)
      onSearchResultsPage.getProductPrice().then(function (amountElement) {
        const amount = amountElement.text().substring(1)
        itemCost= parseFloat(parseFloat(amount).toFixed(2))
        cy.log('Item amount: ' + itemCost )
      })

      // Adding item once
      cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
      cy.wait(1000)

      onHomePage.getViewCart().click()
      onSideCartPage.gotoCheckout()

      onCheckoutPage.onCheckoutPaymentPanel.addPromoCode(<string>promotions.CouponPromotions[0].SubtotalCouponCodeDollarOFF)
      onCheckoutPage.onCheckoutPaymentPanel.getPromoCodeDollarsAmount().should('contain', '-$' + 2 + ".00")
      onCheckoutPage.onCheckoutPaymentPanel.getPromoCodeRemoveButton().click()

      onCheckoutPage.onCheckoutPaymentPanel.addPromoCode(<string>promotions.CouponPromotions[0].DeliveryFeeCouponCodeDollarOFF)
      onCheckoutPage.onCheckoutPaymentPanel.getPromoCodeDollarsAmount().should('contain', '-$'  + 2 + ".00")
      onCheckoutPage.onCheckoutPaymentPanel.getPromoCodeRemoveButton().click()

    })

    it('Verify the Coupon promotion is applied on the Market Item shipping Fee - %OFF', () => {
      // Search for untraceable item stockcode
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(promotions.CouponPromotions[1].stockcode.toString()).type('{enter}')

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

      onCheckoutPage.onCheckoutPaymentPanel.addPromoCode(<string>promotions.CouponPromotions[1].MarketShippingFeeCouponCode)
      onCheckoutPage.onCheckoutPaymentPanel.getPromoCodeDollarsAmount().should('contain', '-$1.00')
      onCheckoutPage.onCheckoutPaymentPanel.getPromoCodeRemoveButton().click()
    })

    it('Verify the Coupon promotion is applied in combination with Classic Product Promotion', () => {
      // Search for untraceable item stockcode
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(promotions.CouponPromotions[2].stockcode.toString()).type('{enter}')

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

      onCheckoutPage.onCheckoutPaymentPanel.addPromoCode(<string>promotions.CouponPromotions[2].ClassicProductPromoCouponCode)
      onCheckoutPage.onCheckoutPaymentPanel.getPaymentYouHaveSavedAmountElement().should('contain', '$'+ promotions.CouponPromotions[2].DollarOFF + '.00')
      onCheckoutPage.onCheckoutPaymentPanel.getPromoCodeRemoveButton().click()
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
