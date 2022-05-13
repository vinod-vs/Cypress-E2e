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
  describe('[UI] Verify Deferred product Promotions Evaluation', () => {
    
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginViaUi(shoppers.PESAccount2)
    })

    it('Verify the Deferred product promotion is applied on the grocery item', () => {

      // Search for untraceable item stockcode
     
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(promotions.DeferredProductPromotions[0].stockcode.toString()).type('{enter}')

      // Adding item once
      cy.checkIfElementExists('.no-results-primary-text').then((isFound: any) => {
        if(!isFound) {
        throw new Error('Product does not exist')
        }
        }) 
       cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
       cy.wait(1000)
       onHomePage.getViewCart().click()
       onSideCartPage.getTotalRewardsPointsElement().should('contain', promotions.DeferredProductPromotions[0].TotalRewardsPointsEarned + " pts")
       onSideCartPage.gotoCheckout()
       onCheckoutPage.onCheckoutPaymentPanel.getPaymentRewardsPointElement().should('contain', promotions.DeferredProductPromotions[0].TotalRewardsPointsEarned + " points")
       })
      
      it('Verify the Deferred SpendStretch promotion is applied on the grocery items', () => {

        // Search for untraceable item stockcode
       
        onHomePage.getSearchHeader().click()
        onHomePage.getSearchHeader().type(promotions.DeferredSpendStretchPromotions[0].stockcode.toString()).type('{enter}')
        // Adding item once
        cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
        cy.wait(1000)
        onHomePage.getViewCart().click()
        onSideCartPage.getTotalRewardsPointsElement().should('contain', promotions.DeferredSpendStretchPromotions[0].TotalRewardsPointsEarned + " pts")
        onSideCartPage.gotoCheckout()
        onCheckoutPage.onCheckoutPaymentPanel.getPaymentRewardsPointElement().should('contain', promotions.DeferredSpendStretchPromotions[0].TotalRewardsPointsEarned + " points")
        })

        it('Verify the Deferred product promotion is applied on the Market place item', () => {

          // Search for untraceable item stockcode
         
          onHomePage.getSearchHeader().click()
          onHomePage.getSearchHeader().type(promotions.DeferredProductPromotions[2].stockcode.toString()).type('{enter}')
    
          // Adding item once
          cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
          cy.wait(1000)
          onHomePage.getViewCart().click()
          onSideCartPage.getTotalRewardsPointsElement().should('contain', promotions.DeferredProductPromotions[2].TotalRewardsPointsEarned + " pts")
         }) 
  
      afterEach(() => {
      //clear cart
      onCheckoutPage.getContinueShoppingLink().click()
      cy.wait(1000)
      onHomePage.getViewCart().click()
      onSideCartPage.removeAllItems()
    })

  })
})
