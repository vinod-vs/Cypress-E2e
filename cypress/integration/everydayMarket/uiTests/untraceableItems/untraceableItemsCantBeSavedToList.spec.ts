/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from '../../../../support/TestFilter'
import shoppers from '../../../../fixtures/everydayMarket/shoppers.json'
import untraceableItem from '../../../../fixtures/everydayMarket/untraceableItemStockcodes.json'
import { onHomePage } from '../../../../support/homePage/ui/pageObjects/HomePage'
import { onSearchResultsPage } from '../../../../support/search/ui/pageObjects/SearchResultsPage'
import '../../../../support/login/ui/commands/login'
import '../../../../support/utilities/ui/utility'


TestFilter(['EDM', 'UI', 'MANIC'], () => {
  describe('[UI] RP-5466 - EM | Untraceable items should not be able to be saved to list', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5466 - UI | EM | Untraceable items should not be able to be saved to list', () => {
      // Login as Manic shopper
      cy.loginViaUi(shoppers.emAccount4ForManic)

      // Search for untraceable item stockcode
      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type(untraceableItem.stockcode).type('{enter}')
      
      onSearchResultsPage.getProductTitle().then(() => {
          // Verify the 'Save to List' button does not exist
          onSearchResultsPage.getSaveToListButton().should('not.exist');
      })
    })
  })
})
