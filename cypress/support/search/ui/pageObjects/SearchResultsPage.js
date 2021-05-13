class SearchResultsPage {
  getIncreaseQuantityButton () {
    return cy.get('.iconAct-Add_Plus')
  }

  getProductPrice () {
    return cy.get('.price.price--large.ng-star-inserted')
  }
}

export default SearchResultsPage
