/// <reference types="Cypress" />

import listInput from '../../../fixtures/lists/listUITest'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/deliveryDateAndWindow/ui/commands/deliveryDateAndWindow'
import '../../../support/lists/ui/commands/addDeleteList'

const faker = require('faker')
TestFilter(['UI'], () => {
  describe('[UI] Create a list and delete a list in B2B', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    it(' Create list and Delete list', () => {
      // Login
      cy.loginViaUi(listInput.shopper)

      //Select Delivery date Window
      cy.selectDeliveryDateAndWindow()

      const listName = faker.commerce.productName()

      // Search for category and add it to the list
      cy.searchAndAddProductToNewList(listName)

      // Verify that the list has been created and it has the product added
      cy.VerifyProductInList(listName)
      
      // Delete the list
      cy.deleteList(listName)
    })
  })
})