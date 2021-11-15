/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import TestFilter from '../../../support/TestFilter'

const searchTerm = '211377'
const platform = Cypress.env('b2cPlatform')

TestFilter(['B2C-API'], () => {
  describe('[API] Verify Classic Product Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })


    it('Verify the ClassicProduct promotion price is applied for the item', () => {
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })
  
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableNonRestrictedWowItemsToTrolley(searchTerm).then((response:any)=> {
          expect(response).to.have.property('Success', true)
        })
        
      })
    })
  
})
     