/// <reference types="cypress" />

import shopper from '../../../fixtures/login/b2cLogin.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'

TestFilter(['API'], () => {
  describe('[API] Search product', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Search product', () => {
      cy.loginViaApi(shopper)

      searchBody.SearchTerm = 'Milk'

      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)
      })
    })
  })
})
