/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/search/api/commands/search'
import '../../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../../support/checkout/api/commands/confirmOrder'
import '../../../../../support/payment/api/commands/creditcard'
import '../../../../../support/payment/api/commands/digitalPayment'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/refunds/api/commands/commands'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import TGA from '../../../../../fixtures/everydayMarket/advertWithTGADetails.json'
import searchRequest from '../../../../../fixtures/search/productSearch.json'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API]  RP-5043 | EM | Verify TGA details for a product', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API]  RP-5043 | EM | Verify TGA details for a product', () => {
      cy.log('=====VERIFYING TGA DETAILS FOR PRODUCT:' + TGA.searchTerm + ' ========')
      cy.loginViaApiAndHandle2FA(shoppers.emAccountWithRewards16).then((response) => {
        serachForEDMproductWithTGAAndVerfiy(TGA.searchTerm)
      })
    })
  })
})

function serachForEDMproductWithTGAAndVerfiy (tgaTestdata) {
  searchRequest.SearchTerm = tgaTestdata
  cy.productSearch(searchRequest).then((response) => {
    expect(response.SearchResultsCount).to.be.greaterThan(0)
    cy.searchEMProductAndStashTheResponse(response, TGA, 'TGA').then((response) => {
      expect(TGA.productWarningsAct).to.be.equal(TGA.TGAWarning)
    })
  })
}
