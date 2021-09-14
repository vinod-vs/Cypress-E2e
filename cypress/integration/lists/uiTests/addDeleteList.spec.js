/// <reference types="Cypress" />
import shoppers from '../../../fixtures/lists/b2bShoppers.json'
import tradingAccount from '../../../fixtures/fulfilmentMethod/tradeAccountDetails.json'
import searchDetails from '../../../fixtures/search/searchTerms.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/fulfilment/ui/commands/deliveryDateAndWindow'
import '../../../support/lists/ui/commands/addDeleteList'

const faker = require('faker')
TestFilter(['B2B-UI'], () => {
  describe('[UI] Create a list and delete the list in B2B', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearCookie('w-rctx')
      cy.clearLocalStorage({ domain: null })
    })
    it('Create a list and Delete the list', () => {
      // Login
      cy.loginViaUi(shoppers[0])

      // Select Delivery date Window
      cy.selectDeliveryDateAndWindow(tradingAccount[0].trading_acc_address)

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
