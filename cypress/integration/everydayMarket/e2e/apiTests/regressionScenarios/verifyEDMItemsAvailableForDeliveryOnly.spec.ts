/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../../support/TestFilter'
import searchRequestBody from '../../../../../fixtures/search/productSearch.json'
import addressSearch from '../../../../../fixtures/checkout/addressSearch.json'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../../support/search/api/commands/search'
import '../../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../../support/sideCart/api/commands/viewTrolley'
import { fulfilmentType } from '../../../../../fixtures/checkout/fulfilmentType.js'
import tests from '../../../../../fixtures/everydayMarket/apiTests.json'
import storeSearchBody from '../../../../../fixtures/checkout/storeSearch.json'
import { windowType } from '../../../../../fixtures/checkout/fulfilmentWindowType.js'
import '../../../../../support/address/api/commands/searchSetValidateAddress'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API] RP-5035 - EM | Verify Everyday Market items are available for delivery only', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5035 - EM | Verify Everyday Market items are available for delivery only', () => {
      const testData = tests.GenericEMonlyProductTestData
      const searchTerm = testData.searchTerm
      const quantity = testData.quantity
      const shopper = shoppers.emAccountWithRewards15

      // Login using shopper saved in the fixture
      cy.loginViaApiAndHandle2FA(shopper)

      // Set delivery fulfilment to 407 Elizabeth Street, Surry Hills - Delivery Address
      cy.setFulfilmentLocationWithoutWindow(fulfilmentType.DELIVERY, addressSearch)

      // Clear trolley in case there's any item
      cy.clearTrolley()

      // Add Pet Culture EM items to trolley
      cy.addAvailableEDMItemsToTrolley(searchTerm, quantity)      
      
    // Search and select the PickUp address
    cy.searchPickupDTBStores(fulfilmentType.PICK_UP, storeSearchBody.postCode).then((response: any) => {
      expect(response.AddressId).to.not.be.null
    })
    //Select the Fulfilment Window
    cy.getFulfilmentWindowViaApi(windowType.PICK_UP).then((response: any) => {
      expect(response.Id).to.be.greaterThan(0)
    })

    cy.completeWindowFulfilmentViaApi().then((response: any) => {
      expect(response).to.have.property('IsSuccessful', true)
    })

    // Verify the RestrictedByDeliveryMethodMessage When Fulfilment Type = PickUp
    cy.viewTrolley().as('trolleyResponse')
    cy.get('@trolleyResponse').then((trolleyResponse: any) => {
      cy.log(trolleyResponse.RestrictedByDeliveryMethodMessage)
      expect(trolleyResponse.RestrictedByDeliveryMethodMessage).to.equal('These items are not available for Pick up. Remove them or change to Delivery.')
    })

    })
  })
})
