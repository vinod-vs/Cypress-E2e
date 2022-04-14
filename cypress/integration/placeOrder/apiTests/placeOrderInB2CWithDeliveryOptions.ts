/// <reference types="cypress" />

import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import deliveryOptions from '../../../fixtures/checkout/deliveryOptions.json'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
import TestFilter from '../../../support/TestFilter'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/delivery/api/commands/options'
import '../../../support/logout/api/commands/logout'
import '../../../support/login/api/commands/login'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/address/api/commands/searchSetValidateAddress'

TestFilter(['B2C', 'API', 'Checkout', 'P1'], () => {
  const searchTerm = 'Kitchen'
  const trolleyThreshold = 50.00
  const platform = Cypress.env('b2cPlatform')

  describe('[API] Place a delivery order on B2C Platform with delivery options selected', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
    })

    it('Should place an order with leave unattended selected', () => {
      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      deliveryOptions.CanLeaveUnattended = true
      cy.setDeliveryOptionsViaApi(deliveryOptions)

      cy.placeOrderViaApiWithAddedCreditCard(platform).then((confirmOrderResponse: any) => {
        expect(confirmOrderResponse.Order.CanLeaveOrderUnattended, 'Order Confirmation can Leave Order Unattended').to.eql(true)
      })
    })

    it('Should place an order with delivery driver notes', () => {
      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      deliveryOptions.DeliveryInstructions = 'Delivery Instructions added by API'
      cy.setDeliveryOptionsViaApi(deliveryOptions)

      cy.placeOrderViaApiWithAddedCreditCard(platform).then((confirmOrderResponse: any) => {
        expect(confirmOrderResponse.Order.DeliveryInstructions, 'Order Confirmation Delivery Instructions').to.eql(deliveryOptions.DeliveryInstructions)
      })
    })

    it('Should place an order with store pick up notes', () => {
      cy.searchBillingAddressViaApi(addressSearchBody.search).then((response: any) => {
        cy.setBillingAddressViaApi(response.body.Response[0].Id)  
      })
      cy.setFulfilmentLocationWithWindow(fulfilmentType.PICK_UP, storeSearchBody.postCode, windowType.PICK_UP)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      deliveryOptions.PickupInstructions = 'Store Pick up Instructions added by API'
      cy.setDeliveryOptionsViaApi(deliveryOptions)

      cy.placeOrderViaApiWithAddedCreditCard(platform).then((confirmOrderResponse: any) => {
        expect(confirmOrderResponse.Order.DeliveryInstructions, 'Order Confirmation Pick up Instructions').to.eql(deliveryOptions.PickupInstructions)
      })
    })
  })
})