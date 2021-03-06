/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from '../../../support/TestFilter'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import '../../../support/orders/api/commands/cancelOrder'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/login/api/commands/login'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/checkout/api/commands/checkoutHelper'

TestFilter(['B2C', 'API', 'SPUD', 'E2E'], () => {
  const searchTerm = 'Freezer'
  const additionalSearchTerm = 'Fish'
  const trolleyThreshold = 50.0
  const platform = Cypress.env('b2cPlatform')

  describe('[API] Cancel placed order for B2C customer', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })

      cy.loginWithNewShopperViaApi()
      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody.search,
        windowType.FLEET_DELIVERY
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        searchTerm,
        trolleyThreshold
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        additionalSearchTerm,
        trolleyThreshold
      )
      cy.placeOrderViaApiWithAddedCreditCard(platform).then(
        (confirmOrderResponse: any) => {
          cy.wrap(confirmOrderResponse.Order.OrderId).as('orderId')
        }
      )
    })

    it('Place an order for B2C customer, then cancel the order', () => {
      cy.get('@orderId').then(($orderId: any) => {
        cy.cancelOrder($orderId).then((response: any) => {
          expect(response.body.ErrorCode, 'Cancel Order Error Code').to.be.null
        })
      })
    })
  })
})
