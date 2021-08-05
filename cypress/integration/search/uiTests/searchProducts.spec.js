/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />
import listTest from '../../../fixtures/lists/listTest'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/b2bShoppingPreferences/ui/commands/fulfillmentMethodSelection'
import '../../../support/search/ui/commands/searchAndAddProductsToList'
import '../../../support/search/ui/commands/deleteList'
const faker = require('faker')
TestFilter(['UI'], () => {
  describe('[UI] Search for a Product in b2b', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    it(' Search for a Product', () => {
      // Login
      cy.loginViaUi(listTest.shopper)

      //Change Trading Account
      cy.changefulfilmentMethod()

      const listName = faker.commerce.productName()

      cy.searchAndAddProductToNewList(listName)
      cy.deleteList(listName)

    })
  })
})
