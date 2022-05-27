/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import { MyOrderPage } from '../../../support/myOrder/ui/pageObjects/MyOrderPage'
import { default as dayjs } from 'dayjs'
import '../../../support/login/api/commands/login'
import '../../../support/delivery/api/commands/options'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/address/api/commands/searchSetValidateAddress'
import '../../../support/login/ui/commands/login'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'MyOrder', 'P1'], () => {
  const searchTerm = 'Kitchen'
  const trolleyThreshold = 50.00
  const platform = Cypress.env('b2cPlatform')

  describe('[UI] Verify Order details in MyOrders for order placed for B2C customer', () => {
    before('open application', () => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Place an order via api for B2C customer, then verify the order details in MyOrders UI', () => {
      // Login via api using new shopper
      cy.loginWithNewShopperViaApi()

      // Place an order via api
      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      cy.placeOrderViaApiWithAddedCreditCard(platform, creditCardPayment).then((confirmOrderResponse: any) => {
      // Save the Order details of the order placed
        const orderId = confirmOrderResponse.Order.OrderId
        const orderTotal = confirmOrderResponse.Order.TotalIncludingGst
        const orderCreatedDate = confirmOrderResponse.Order.CreatedDate
        const orderDeliveryDate = confirmOrderResponse.Order.DeliveryDate
        // Convert the dates to the required format for assertion
        const createdDate = dayjs(orderCreatedDate).format('D MMMM')
        const deliverydate = dayjs(orderDeliveryDate).format('D MMMM')

        // Navigate to UI - My order page
        cy.visit('/shop/myaccount/myorders')
        cy.wait(500)
        // Passing the orderId to the Page object constructor
        const onMyOrderPage = new MyOrderPage(orderId)

        // Verify the Order details on My Orders page is same as the saved order details
        onMyOrderPage.getMyOrderNumber().should('contain', orderId)
        onMyOrderPage.getOrderTotal().should('contain.text', orderTotal)
        onMyOrderPage.getOrderDate().should('contain.text', createdDate)
        onMyOrderPage.getDeliveryDate().should('contain.text', deliverydate)
        onMyOrderPage.getTrackMyOrderLink().should('contain.text', ' Track my order ')
        onMyOrderPage.getViewOrderDetailsLink().should('contain.text', 'View order details')
      })
    })
  })
})
