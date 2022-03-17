/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from '../../../support/TestFilter'
import searchRequestBody from '../../../fixtures/search/productSearch.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType.js'
import addressSearch from '../../../fixtures/checkout/addressSearch.json'
import '../../../support/login/api/commands/login'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/search/api/commands/search'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/sideCart/api/commands/viewTrolley'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API] RP-5036 - EM | Verify Everyday Market items not available for restricted postcodes', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5036 - EM | Verify Everyday Market items not available for restricted postcodes', () => {
      const searchTerm = '1073744438' // Vetalogica Automation (do Not Touch) Vetalogica Hemp Clinicals Skin And Coat Dog Treats - 225g 225g
      const quantity = 2
      const nonServicedAddress = '49-51 Murray Street, HOBART TAS 7000'

      // Sign up for a new shopper
      cy.loginWithNewShopperViaApi()

      // Set delivery fulfilment to 407 Elizabeth Street, Surry Hills (serviced address)
      cy.setFulfilmentLocationWithoutWindow(fulfilmentType.DELIVERY, addressSearch)

      // Clear trolley in case there's any item
      cy.clearTrolley()

      // Add Pet Culture items to trolley
      cy.addAvailableEDMItemsToTrolley(searchTerm, quantity)
      
      // Set delivery fulfilment to 49-51 Murray Street, Hobart (Pet Culture non serviced postcode 7000)
      cy.setFulfilmentLocationWithoutWindow(fulfilmentType.DELIVERY, { ...addressSearch, search: nonServicedAddress})
      
      cy.viewTrolley().as('trolleyResponse')

      // The Pet Culture item should become unavailable after setting fulfilment to a non serviced postcode
      cy.get('@trolleyResponse').then((trolleyResponse: any) => {
        expect(trolleyResponse.UnavailableItems[0].IsAvailable).to.be.false

        // Search for Pet Culture items again and verify they are unavailable
        cy.productSearch({ ...searchRequestBody, SearchTerm: searchTerm }).then((searchResponse: any) => {
          expect(searchResponse.Products[0].Products[0].IsAvailable).to.be.false
        })
      })
    })
  })
})
