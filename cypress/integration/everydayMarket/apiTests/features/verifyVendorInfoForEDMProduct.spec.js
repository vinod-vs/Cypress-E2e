/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */
import shoppers from '../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/search/api/commands/search'
import '../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../support/invoices/api/commands/commands'
import '../../../../support/refunds/api/commands/commands'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../support/checkout/api/commands/confirmOrder'
import '../../../../support/everydayMarket/api/commands/utility'
import tests from '../../../../fixtures/everydayMarket/apiTests.json'
import { fulfilmentType } from '../../../../fixtures/checkout/fulfilmentType.js'
import addressSearch from '../../../../fixtures/checkout/addressSearch.json'
import * as lib from '../../../../support/everydayMarket/api/commands/commonHelpers'
import searchRequestBody from '../../../../fixtures/search/productSearch.json'
import '../../../../support/sideCart/api/commands/viewTrolley'
import '../../../../support/pdp/pdp.ts'

TestFilter(['EDM', 'API', 'feature'], () => {
  describe('[API]  RP-5483 | EM | Seller name be returned from backend endpoint in search result page, PDP, view cart items and checkout page', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5483 | EM | Seller name be returned from backend endpoint in search result page, PDP, view cart items and checkout page', () => {
      const testData = tests.GenericStockCodeSearch
      const searchTerm = testData.searchTerm
      const quantity = testData.quantity
      const vendorNameExpected = testData.VendorName
      const shopper = shoppers.emAccountWithRewards3

      // Login using shopper saved in the fixture
      cy.loginViaApiAndHandle2FA(shopper)

      // Set delivery fulfilment to 407 Elizabeth Street, Surry Hills - Delivery Address
      cy.setFulfilmentLocationWithoutWindow(fulfilmentType.DELIVERY, addressSearch)

      // Verify Seller name be returned from backend endpoint in search result page
      cy.productSearch({ ...searchRequestBody, SearchTerm: searchTerm }).then((searchResponse) => {
        expect(searchResponse.Products[0].Products[0].IsAvailable).to.be.true
        expect(searchResponse.Products[0].Products[0].ThirdPartyProductInfo.VendorName).to.not.be.null
        expect(searchResponse.Products[0].Products[0].ThirdPartyProductInfo.VendorName).to.be.eqls(vendorNameExpected)
        expect(searchResponse.Products[0].Products[0].ThirdPartyProductInfo.ThirdPartyVendorDeliveryInfo.VendorName).to.be.eqls(vendorNameExpected)
      })

      // Verify Seller name be returned from backend endpoint in PDP
      cy.fetchProductDataOnPDP(searchTerm).then((productDetailsResponse) => {
        expect(productDetailsResponse.Product.ThirdPartyProductInfo.VendorName).to.not.be.null
        expect(productDetailsResponse.Product.ThirdPartyProductInfo.VendorName).to.be.eqls(vendorNameExpected)
      })
      // Clear trolley in case there's any item
      cy.clearTrolley()

      cy.addAvailableEDMItemsToTrolley(searchTerm, quantity)

      // Verify Seller name be returned from backend endpoint in Trolley/side cart
      cy.addItemsToTrolley(searchTerm).then((actualTrolleyResponse) => {
        expect(actualTrolleyResponse.MarketDeliveryDetails.ThirdPartyVendorDeliveryInfoList[0].VendorName).to.not.be.null
        expect(actualTrolleyResponse.MarketDeliveryDetails.ThirdPartyVendorDeliveryInfoList[0].VendorName).to.be.eqls(vendorNameExpected)
      })

      // Verify Seller name be returned from backend endpoint on checkout page
      cy.navigateToCheckout().then((checkoutResponse) => {
        expect(checkoutResponse.Model.Order.MarketDeliveryDetails.ThirdPartyVendorDeliveryInfoList[0].VendorName).to.be.eqls(vendorNameExpected)
      })
    })
  })
})
