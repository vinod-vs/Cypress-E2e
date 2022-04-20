/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import removeItemsRequestBody from '../../../fixtures/sideCart/removeItems.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/orders/api/commands/cancelOrder'
import '../../../support/login/api/commands/login'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/orders/api/commands/amendOrder'
import '../../../support/shared/api/commands/bootstrap'
import '../../../support/payment/api/commands/zero'

TestFilter(['B2C', 'API', 'P0'], () => {
  const searchTerm = 'Freezer'
  const trolleyThreshold = 60.00
  const platform = Cypress.env('b2cPlatform')

  // Skip test until issue with Fulfilment window being lost on amendment is resolved
  describe.skip('[API] Amend placed order for B2C customer', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)
      
      cy.placeOrderViaApiWithAddedCreditCard(platform).then((confirmOrderResponse: any) => {
        cy.wrap(confirmOrderResponse.Order.OrderId).as('initialOrderId')
        cy.wrap(confirmOrderResponse.Order.TotalIncludingGst).as('initialOrderTotal')
      })
    })

    it('Place an order for B2C customer, then amend the order and place amended order with additional items', () => {
      cy.get('@initialOrderId').then(($orderId: any) => {
        cy.amendOrder($orderId).then((response: any) => {
          expect(response.status, 'Amend status').to.eq(200)
        })
      })

      // Below is a workaround for issue on UAT whereby products from initial order become unavailable on starting an amendment
      cy.getUnavailableStockCodes().then((stockCodes: any) => {
        if (stockCodes.length > 0) {
          cy.removeItems({ ...removeItemsRequestBody, StockCodes: stockCodes})
        }
      })
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Pet', 30.00)

      cy.getBootstrapResponse().then(($response: any) => {
        cy.get('@initialOrderTotal').then((initialTotal: any) => {
          if ($response.TrolleyRequest.Totals.Total > initialTotal) {
            cy.log('Amended Total > Initial Order Total')
            cy.placeOrderViaApiWithAddedCreditCard(platform)
          }
          else {
            cy.log('Amended Total <= Initial Order Total')
            cy.zero() 
          }
        }) 
      }) 
    })
  })
})
