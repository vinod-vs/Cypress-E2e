/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'
import { onSideCartPage } from 'cypress/support/sideCart/ui/pageObjects/SideCartPage'
import '../../../support/login/ui/commands/login'
import '../../../support/utilities/ui/utility'


TestFilter(['UI', 'B2C', 'PES', 'P2', 'OHNO'], () => {
  describe('[UI] Verify Product Promotions Evaluation', () => {
    
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginViaUi(shoppers.PESAccount2)
    })

     it('Verify the classic product promotion are applied on the grocery items', () => {

     
         // *********Search and Add item stock code to verify the $OFF promotion applied***********
      // Search for item stockcode
     
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(promotions.ClassicProductPromotions[0].stockcode.toString()).type('{enter}')

      // Capture the item price
      cy.wait(1000)
      onSearchResultsPage.getProductPrice().then(function (amountElement) {
        const amount = amountElement.text()
        cy.log('Item amount: ' + amount)
      })
     
      // Adding item once
      cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
       onHomePage.getViewCart().click()
       onSideCartPage.getAvailableProductsPriceDivList().should('contain', "$" + promotions.ClassicProductPromotions[0].SalePrice + ".00")
       onSideCartPage.closeSideCart()

     
       // *********Search and Add item stock code to verify the %OFF promotion applied***********
         
      onHomePage.getSearchHeader().clear()
      onHomePage.getSearchHeader().type(promotions.ClassicProductPromotions[1].stockcode.toString()).type('{enter}')

      // Capture the item price
      cy.wait(1000)
      onSearchResultsPage.getProductPrice().then(function (amountElement) {
        const amount = amountElement.text()
        cy.log('Item amount: ' + amount)
      })
     
      // Adding item once
      cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
       onHomePage.getViewCart().click()
       onSideCartPage.getAvailableProductsPriceDivList().should('contain', "$" + promotions.ClassicProductPromotions[1].SalePrice + ".00")
       onSideCartPage.closeSideCart()
       
       
       // Search and Add item stock code to verify the FixedAmount promotion applied
          
       onHomePage.getSearchHeader().clear()
       onHomePage.getSearchHeader().type(promotions.ClassicProductPromotions[2].stockcode.toString()).type('{enter}')
 
       // Capture the item price
       cy.wait(1000)
       onSearchResultsPage.getProductPrice().then(function (amountElement) {
       
         const amount = amountElement.text()
         cy.log('Item amount: ' + amount)
       })
       
       // Adding item once
       cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
        onSearchResultsPage.getIncreaseQuantityButton().click()
        onHomePage.getViewCart().click()
        onSideCartPage.getAvailableProductsPriceDivList().should('contain', "$" + promotions.ClassicProductPromotions[2].SalePrice + ".00")
        onSideCartPage.closeSideCart()
       
        // Search and Add item stock code to verify the PackagePrice promotion applied
          
       onHomePage.getSearchHeader().clear()
       onHomePage.getSearchHeader().type(promotions.ClassicProductPromotions[3].stockcode.toString()).type('{enter}')
 
       // Capture the item price
       cy.wait(1000)
       onSearchResultsPage.getProductPrice().then(function (amountElement) {
         const amount = amountElement.text()
         cy.log('Item amount: ' + amount)
       })
       
       // Adding item once
       cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
       onSearchResultsPage.getIncreaseQuantityButton().click()
        onHomePage.getViewCart().click()
        onSideCartPage.getAvailableProductsPriceDivList().should('contain', "$" + promotions.ClassicProductPromotions[3].SalePrice + ".00")
        onSideCartPage.closeSideCart() 

       // Search and Add item stock code to verify the ProductGroup - $OFF promotion applied
          
       onHomePage.getSearchHeader().clear()
       onHomePage.getSearchHeader().type(promotions.ClassicProductPromotions[4].stockcode.toString()).type('{enter}')
 
       // Capture the item price
       cy.wait(1000)
       onSearchResultsPage.getProductPrice().then(function (amountElement) {
         const amount = amountElement.text()
         cy.log('Item amount: ' + amount)
       })
       
       // Adding item once
       cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
       onHomePage.getSearchHeader().clear()
       onHomePage.getSearchHeader().type(promotions.ClassicProductPromotions[5].stockcode.toString()).type('{enter}')
 
       // Capture the item price
       cy.wait(1000)
       onSearchResultsPage.getProductPrice().then(function (amountElement) {
         const amount = amountElement.text()
         cy.log('Item amount: ' + amount)
       })
       
       // Adding item once
       cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click() 
       onHomePage.getViewCart().click()
       onSideCartPage.getAvailableProductsPriceDivList().should('contain', "$" + promotions.ClassicProductPromotions[5].SalePrice$)
       onSideCartPage.getAvailableProductsPriceDivList().should('contain', "$" + promotions.ClassicProductPromotions[5].SalePriceC)
     
      })

      it('Verify the Product promotions are applied on the grocery items', () => {

        // Verify the Product promotion price is applied for the item - Credit Discount %OFF
         
         // Search for item stockcode
       
        onHomePage.getSearchHeader().click()
        onHomePage.getSearchHeader().type(promotions.ProductPromotions[2].stockcode.toString()).type('{enter}')
  
        // Capture the item price
        cy.wait(1000)
        onSearchResultsPage.getProductPrice().then(function (amountElement) {
          const amount = amountElement.text()
          cy.log('Item amount: ' + amount)
        })
       
        // Adding item once
        cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
         onHomePage.getViewCart().click()
         cy.wait(1000)
         onSideCartPage.getAvailableCreditItemsProductPriceDivList().should('contain', "$" + promotions.ProductPromotions[2].SalePrice2 + ".00")
         onSideCartPage.getRewardcreditscheckElement()
         onSideCartPage.getAvailableCreditItemsProductPriceDivList().should('contain', "$" + promotions.ProductPromotions[2].SalePrice1 + ".00")
         onSideCartPage.getRewardcreditscheckElement()
         cy.wait(500)
         onSideCartPage.getAvailableCreditItemsProductPriceDivList().should('contain', "$" + promotions.ProductPromotions[2].SalePrice2 + ".00")
         onSideCartPage.closeSideCart()

        // *********Search and Add item stock code to verify the $OFF promotion applied***********

        // Search for item stockcode
       
       
        onHomePage.getSearchHeader().clear()
        onHomePage.getSearchHeader().type(promotions.ProductPromotions[0].stockcode.toString()).type('{enter}')
  
        // Capture the item price
        cy.wait(1000)
        onSearchResultsPage.getProductPrice().then(function (amountElement) {
          const amount = amountElement.text()
          cy.log('Item amount: ' + amount)
        })
       
        // Adding item once
        cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
         onHomePage.getViewCart().click()
         onSideCartPage.getAvailableProductsPriceDivList().should('contain', "$" + promotions.ProductPromotions[0].SalePrice + ".00")
         onSideCartPage.closeSideCart()
  
       
         // *********Search and Add item stock code to verify the %OFF promotion applied***********
           
        onHomePage.getSearchHeader().clear()
        onHomePage.getSearchHeader().type(promotions.ProductPromotions[1].stockcode.toString()).type('{enter}')
  
        // Capture the item price
        cy.wait(1000)
        onSearchResultsPage.getProductPrice().then(function (amountElement) {
          const amount = amountElement.text()
          cy.log('Item amount: ' + amount)
        })
       
        // Adding item once
        cy.get(onSearchResultsPage.getAddToCartByItemLocatorString1()).click()
        onSearchResultsPage.getIncreaseQuantityButton().click()
         onHomePage.getViewCart().click()
         onSideCartPage.getAvailableProductsPriceDivList().should('contain', promotions.ProductPromotions[1].SalePrice$)
         onSideCartPage.getAvailableProductsPriceDivList().should('contain', promotions.ProductPromotions[1].SalePriceC)
         
         })
     
    afterEach(() => {
      //clear cart
     onSideCartPage.removeAllItems()
    })

  })
})
