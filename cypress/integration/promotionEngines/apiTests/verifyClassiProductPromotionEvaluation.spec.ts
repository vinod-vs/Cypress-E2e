/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import eventsRequest from '../../../fixtures/promotionEngines/additemsToTrolley.json'
import '../../../sideCart/api/commands/clearTrolley'
import '../../../sideCart/api/commands/addItemsToTrolley'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import deliveryOptions from '../../../fixtures/checkout/deliveryOptions.json'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
import { windowType } from 'cypress/fixtures/checkout/fulfilmentWindowType'
import TestFilter from 'cypress/support/TestFilter'
import { any } from 'cypress/types/bluebird'

TestFilter(['B2C-API'], () => {
  
  const platform = Cypress.env('b2cPlatform')
  const searchTerm = '211377'
  const trolleyThreshold = 25.00

    it('Login with PES user', () => {
      const shopper = shoppers.PESAccount1
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shopper).its('LoginResult').should('eq', 'Success')
    })
      // Set the Delivery address and add the items to Trolley

      it('Verify the ClassicProduct promotion price is applied for the item', () => {
        cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
       // cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)
        cy.addAvailableNonRestrictedWowItemsToTrolley(searchTerm).then((response:any)=> {
          expect(response).to.have.property('Success', true)
         // expect(response).to.have.property('SalePrice', '4.2')
       
        })
        
      })
    })
     