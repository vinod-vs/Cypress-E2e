// import {loginViaUI} from '../../../support/login/ui/commands/login.js'
// import { should } from 'chai'
import TestFilter from '../../../support/TestFilter.js'
import '../../../support/login/ui/commands/login.js'
import '../../../support/sideCart/ui/commands/clearTrolley.js'
import '../../../support/fulfilment/ui/commands/deliveryDateAndWindow.js'
import '../../../support/search/ui/commands/searchAndAddProduct.js'
import shoppers from '../../../fixtures/login/b2cShoppers.json'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage.js'
import { onDeliveryDateAndWindowPage } from '../../../support/fulfilment/ui/pageObjects/DeliveryDateAndWindowPage.ts'
import refundsTestData from '../../../fixtures/refunds/refundsTestData.json'

TestFilter(['B2C', 'UI', 'Refunds', 'OPS'], () => {
describe('[UI] Place an order by using credit card', () => {
before(() => {
          cy.clearCookies({ domain: null })
          cy.clearLocalStorage({ domain: null })
        })
it('Place order', () => {
    cy.loginViaUi(shoppers[3])
    cy.clearTrolley()
    onDeliveryDateAndWindowPage.selectDeliveyAddressAndRandomWindow(refundsTestData.refundsOnCC.deliveryAddress)
    onSearchResultsPage.addRandomProductsToCartForTotalValue(refundsTestData.refundsOnCC.orderMinAmount)
})
})
})

