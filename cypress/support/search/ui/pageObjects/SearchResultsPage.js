import { onSideCartPage } from "cypress/support/sideCart/ui/pageObjects/SideCartPage"

export class SearchResultsPage {
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

    this.getAllAddToCartButtons().its('length').then(len => {
      if(len > 0){
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
    this.getAllAddToCartButtons().its('length').then(len => {
      if(len == 0){
        this.getGoNextButton().click()
      }

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
    })
  }

  #keepAddingUntilReachMinSpendThreshold(minSpendThreshold, sharedCartButtonJquery)
  {
    cy.wait(200)
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
}

export const onSearchResultsPage = new SearchResultsPage()
