/// <reference types="cypress" />

import shoppers from '../../fixtures/b2cShoppers.json'
import searchBody from '../../fixtures/productSearch.json'
import '../../support/api/login/login'
import '../../support/api/search/search'

describe('Search product via API', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  it('Search product', () => {
    cy.loginViaApi(shoppers[0])

    searchBody.SearchTerm = 'Milk'

    cy.productSearch(searchBody).then((response) => {
      expect(response.SearchResultsCount).to.be.greaterThan(0)
    })
  })
})
