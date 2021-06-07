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
}

export default SearchResultsPage
