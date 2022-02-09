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

  getHaveYouForgottenContinueToCheckoutButton () {
    return cy.get('wow-have-you-forgotten-container .continue-button')
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

  continueToCheckout() {
    cy.checkIfElementExists('wow-have-you-forgotten-container .continue-button').then(result => {
      if(result){
        this.getHaveYouForgottenContinueToCheckoutButton().click({force: true})
      }
    })
  }

  addAvailableHighestPriceProductToCartFromSearchResultPages(bulkAddingQuantity)
  {
    cy.checkIfElementExists('.no-results-primary-text').then(result => {
      if(result == true){
        throw new Error('Unable to find any result')
      }
    })

    this.getSortByDropdownButton().click({force: true})
    cy.get('.sort-by-dropdown ul').contains('Price High to Low').click()

    let searchResultPageStartIndex = 1
    this.getAllPageNumberElements().last().then(lastPageNumberElement => {
      this.addAvailableProductToCartFromCurrentPage(bulkAddingQuantity, searchResultPageStartIndex, Number(lastPageNumberElement.text()))
    })
  }

  addAvailableProductToCartFromCurrentPage(bulkAddingQuantity, currentPageIndex, lastPageIndex)
  {
    if(currentPageIndex > lastPageIndex)
    {
      throw new Error('All search result products are out of stock or unavailable')
    }

    this.getAllAddToCartButtons().its('length').then(len => {
      if(len > 0){
        this.getAllAddToCartButtons().first().parents('.cartControls').then(cartControls => {
          cy.wrap(cartControls).find('.cartControls-addCart').click({force: true})
          cy.wait(1000)
          cy.checkIfElementExists('shared-coach-mark').then(result => {
            if(result){
              cy.get('shared-coach-mark').contains('Ok, got it').click()
            }
          })
          cy.wrap(cartControls).find('.cartControls-quantityInput').clear().type(bulkAddingQuantity).type('{enter}')
        })

        cy.checkIfElementExists('.shelfProductTile-maxSupplyLimitMessage').then(result => {
          if(result){
            cy.get('.shelfProductTile-maxSupplyLimitMessage div').then(atpMessageElement => {
              let itemsLeftQuantity = atpMessageElement.text().substring(0, atpMessageElement.text().indexOf('item(s) left')).trim()
              cy.wrap(cartControls).find('.cartControls-quantityInput').clear().type(itemsLeftQuantity).type('{enter}')
            })
          }
        })
      }
      else{
        this.getGoNextButton().click()
        this.addAvailableProductToCartFromCurrentPage(bulkAddingQuantity, currentPageIndex + 1, lastPageIndex)
      }
    })
  }
}

export const onSearchResultsPage = new SearchResultsPage()
