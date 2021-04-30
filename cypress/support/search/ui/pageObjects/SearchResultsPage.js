class SearchResultsPage {
  getIncreaseQuantityButton () {
    return cy.get('.iconAct-Add_Plus')
  }

  getProductPrice () {
    return cy.get('.price')
  }
}

export default SearchResultsPage
