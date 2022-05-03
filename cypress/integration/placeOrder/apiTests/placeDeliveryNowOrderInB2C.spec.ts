/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import addressSearchBody from '../../../fixtures/fulfilmentLocation/deliveryNowWaverton.json'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/login/api/commands/login'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/viewTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/sideCart/api/commands/removeItems'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'

TestFilter(['B2C', 'API', 'P1', 'SPUD', 'Checkout'], () => {
  const platform = Cypress.env('b2cPlatform')

  describe('[API] Place a Delivery Now order in B2C platform', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
    })

    it('Should place a delivery now order with a credit card payment', () => {
      const searchTerm = 'Fruit'

      cy.searchDeliveryAddress(addressSearchBody).then((response: any) => {
        expect(response.Id, 'AddressId').to.not.be.null
      })

      cy.addDeliveryAddress().then((response: any) => {
        expect(response.Address.AddressId).to.greaterThan(0)
      })

      cy.getFulfilmentWindowViaApi(windowType.DELIVERY_NOW).then((response: any) => {
        expect(response.Id, 'Fulfilment Window ID').to.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        expect(response, 'Fulfilment').to.have.property('IsSuccessful', true)  
      })

      cy.addAvailableNonRestrictedItemCountLimitedWowItemsToTrolley(searchTerm, 20)

      // Restricted properties in /products are not reliable for DN. Need to use Trolley to remove confirm only available items remain
      cy.removeRestrictedItemsFromTrolley()
      cy.removeUnavailableItemsFromTrolley()

      cy.viewTrolley().then((response: any) => {
        if (response.AvailableItems.length === 0) {
          throw new Error('No Available Items found for Delivery Now')
        }
      })
      
      cy.placeOrderViaApiWithAddedCreditCard(platform).then((confirmOrderResponse: any) => {
        expect(confirmOrderResponse.Order.OrderId, 'Order ID').to.not.be.null
      })
    })  
  })
})