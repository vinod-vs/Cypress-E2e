import { onHomePage } from "../../../homePage/ui/pageObjects/HomePage"
import { onSideCartPage } from "../../../sideCart/ui/pageObjects/SideCartPage"

export class SearchResultsPage {
  addItemToCart (itemPositionNumber) {
    return cy.get('#search-content .product-grid > div:nth-child(' + itemPositionNumber + ') .cartControls-addCart')
  }

  getIncreaseQuantityButton () {
    return cy.get('.cartControls-incrementButton')
  }

  getProductPrice () {
    return cy.get('.price.price--large.ng-star-inserted')
  }

  getProductPriceByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .price.price--large.ng-star-inserted'
  }

  getIncreaseQuantityButtonByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .cartControls-incrementButton'
  }

  getQuantityInputFieldByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .cartControls-quantityInput'
  }

  getAddToCartByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .cartControls-addCart'
  }

  getAddToCartByItemLocatorString1 () {
    return '#search-content .product-grid > div .cartControls-addCart'
  }

  getAllAddToCartButtons () {
    return cy.get('.cartControls-addButton .cartControls-addCart')
  }

  getMarketProductRoundelLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) img[alt="Everyday Market Product"]'
  }

  getItemTitleLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .shelfProductTile-descriptionLink'
  }

  getSaveToListButton () {
    return cy.get('button.productSaveToList-buttonLink')
  }

  getCreateANewListButton () {
    return cy.get('button.productSaveToList-actionItems-createList')
  }

  getNewListNameTextInput () {
    return cy.get('#productSaveToList-input')
  }

  getCreateNewListActionButton () {
    return cy.get('button.productSaveToList-actionItems-createButton')
  }

  getTheListnameCheckBox (listName) {
    return cy.get("input[name='" + listName + "']")
  }

  getProductSaveToNewListButton () {
    return cy.get('button.productSaveToList-actionItems-saveButton')
  }

  getProductTitle () {
    return cy.get('shared-product-tile')
  }

  getProductSavedNotification () {
    return cy.get('shared-toast')
  }

  getAllPageNumberElements () {
    return cy.get('.paging-pageNumber')
  }

  getGoNextButton () {
    return cy.get('.next-marker')
  }

  getSortByDropdownButton() {
    return cy.get('.sort-by-dropdown button')
  }

  addAvailableProductsToCartFromSearchResult(minSpendThreshold)
  {
    cy.checkIfElementExists('.no-results-primary-text').then(result => {
      if(result == true){
        throw new Error('Unable to find any result')
      }
    })

    this.getSortByDropdownButton().click({force: true})

    cy.intercept({
      method: 'POST',
      url: Cypress.env('productSearchEndpoint'),
    }).as('productSearch')

    cy.get('.sort-by-dropdown ul').contains('Price High to Low').click()
    
    cy.wait('@productSearch')

    let searchResultPageStartIndex = 1
    this.getAllPageNumberElements().last().then(lastPageNumberElement => {
      this.#addAvailableProductsToCartFromCurrentPage(minSpendThreshold, searchResultPageStartIndex, Number(lastPageNumberElement.text()))
    })
  }

  #addAvailableProductsToCartFromCurrentPage(minSpendThreshold, currentPageIndex, lastPageIndex)
  {
    if(currentPageIndex > lastPageIndex)
    {
      throw new Error('All search result products are out of stock or unavailable')
    }

    cy.intercept({
      method: 'POST',
      url: Cypress.env('productSearchEndpoint'),
    }).as('productSearch')

    cy.checkIfElementExists('.cartControls-addButton .cartControls-addCart').then(result => {
      if(result){
        this.#addAvailableProductsUntilReachMinSpendThreshold(minSpendThreshold, 0)
      }
      else{
        this.getGoNextButton().click()
        cy.wait('@productSearch')
        this.#addAvailableProductsToCartFromCurrentPage(minSpendThreshold, currentPageIndex + 1, lastPageIndex)
      }
    })
  }

  #addAvailableProductsUntilReachMinSpendThreshold(minSpendThreshold)
  {
    cy.checkIfElementExists('.cartControls-addButton .cartControls-addCart').then(result => {
      if(!result){
        this.getGoNextButton().click()
      }
      else{
        this.getAllAddToCartButtons().first().parents('shared-cart-buttons').then(sharedCartButton => {
          cy.wrap(sharedCartButton).find('.cartControls-addCart').click({force: true})      
          this.#keepAddingUntilReachMinSpendThreshold(minSpendThreshold, sharedCartButton)
        })
  
        onSideCartPage.getTotalAmountElementOnHeader().then(totalAmountEle => {
          if(Number(totalAmountEle.text().substring(1)) >= Number(minSpendThreshold)) {
            return false
          }
          else{
            this.#addAvailableProductsUntilReachMinSpendThreshold(minSpendThreshold)
          }
        })
      }   
    })
  }

  #keepAddingUntilReachMinSpendThreshold(minSpendThreshold, sharedCartButtonJquery)
  {
    cy.wait(1000)
    onSideCartPage.getTotalAmountElementOnHeader().then(totalAmountEle => {
      if(Number(totalAmountEle.text().substring(1)) >= Number(minSpendThreshold)) {
        return false
      }
      else{
        cy.wrap(sharedCartButtonJquery).find('.cartControls-incrementButton').then(incrementButton => {
          if(!incrementButton.prop('disabled')){
            cy.wrap(incrementButton).click({force : true})
            this.#keepAddingUntilReachMinSpendThreshold(minSpendThreshold, sharedCartButtonJquery)
          }
          else{
            return false
          } 
        })      
      }
    })
  }

  getAddToCartButtonOnProductListPage (){
    return cy.get('.cartControls-addButton').contains('Add to cart')
  }

  getOkButtonInRestrictedItemsPopup() {
    return cy.get('.primary > .ng-star-inserted').contains('Ok, got it')
  }

  addRandomProductsToCartForTotalValue (cartValue) {
    var cartAmountText=""
    var cartAmount=0
    var totalCartValue = parseFloat(cartValue)
    onHomePage.sortProductsBy('Price High to Low')
    //get all main menus to travel thru each main menu > first sub menu to add first available item to cart
    onHomePage.getCategoryMenuItemLinks().not('.categoryHeader-navigationLink.is-special.ng-star-inserted').not('[href="/shop/browse/bakery"]').each(($el, $index, $list) => {
      //get cart total
      onHomePage.getCartAmountInHeader().then(($cartAmtEl) => {
        cartAmountText=$cartAmtEl.text()
        cartAmountText=cartAmountText.substring(1,cartAmountText.length)
        cartAmount = parseFloat(cartAmountText)
        //add Item to cart only if current cart value is less than expected cart value
        if(cartAmount < totalCartValue){
          //navigate to menu and click on first 'Add to cart' button if visible
          cy.wrap($el).click()
          onHomePage.getSubMenuItemLinks().first().click()
          onHomePage.getSubMenuItemLinks().contains('Show All').click()
          cy.wait(Cypress.config('fiveSecondWait'))
          cy.checkIfElementVisible('.cartControls-addButton').then((visibleAddCart) => {
            if(visibleAddCart===true){
              onSearchResultsPage.getAddToCartButtonOnProductListPage().first().should('be.visible').click()
            }
          })
          cy.wait(Cypress.config('halfSecondWait'))
          //click on 'OK got it' button if resticted items popup appears
          cy.checkIfElementVisible('.primary > .ng-star-inserted').then((visiblePopupBtn) => {
            if(visiblePopupBtn===true){
              onSearchResultsPage.getOkButtonInRestrictedItemsPopup().should('be.visible').click()
            }
          })
          //check cart if any items are under any notifications and remove them
          onSideCartPage.removeAllItemsUnderNotificationGroupsFromCart()
        }
      })
    }) 
  }

}

export const onSearchResultsPage = new SearchResultsPage()
