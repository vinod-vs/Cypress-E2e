class SearchResultsPage {
  getIncreaseQuantityButton () {
    return cy.get('.iconAct-Add_Plus')
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
}

export default SearchResultsPage
