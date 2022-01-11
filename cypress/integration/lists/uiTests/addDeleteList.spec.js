/// <reference types="Cypress" />
import shoppers from '../../../fixtures/lists/b2bShoppers.json'
import searchDetails from '../../../fixtures/search/searchTerms.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/fulfilment/ui/commands/deliveryDateAndWindow'
import '../../../support/lists/ui/commands/addDeleteList'
import '../../../support/logout/api/commands/logout'

const faker = require('faker')
TestFilter(['B2B', 'UI', 'P0'], () => {
  describe.skip('[UI] Create a list and delete the list in B2B', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.logOutViaApi()
      Cypress.Cookies.preserveOnce('w-rctx')
    })
    it.skip('Create a list and Delete the list', () => {
      // Login
      cy.loginViaUi(shoppers[0])

      // Select Delivery date Window
      cy.selectDeliveryDateAndWindow()

      const listName = faker.commerce.productName()

      // Search for category and add it to the list
      cy.searchAndAddProductToNewList(listName, searchDetails[0].searchTerm)

      // Verify that the list has been created and it has the product added
      cy.verifyProductInList(listName)

      // Delete the list
      cy.deleteList(listName)
    })
  })
})
