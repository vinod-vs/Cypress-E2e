/// <reference types="cypress" />


import TestFilter from '../../../support/TestFilter'
import shopper from '../../../fixtures/login/b2cLogin.json'
import b2cRewardsShopper from '../../../fixtures/rewards/b2cRewardsshopper.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import deliveryOptions from '../../../fixtures/checkout/deliveryOptions.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import { onMyOrderPage } from '../../../support/myOrder/ui/pageObjects/MyOrderPage'
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

TestFilter(['B2C', 'UI', 'MyOrder', 'P1'], () => {
    const searchTerm = 'Kitchen'
    const trolleyThreshold = 50.00
    const platform = Cypress.env('b2cPlatform')

  describe('[UI] Verify Order details in MyOrders for order placed for B2C customer', () => {    
    before('open application', () => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })

    it('Place an order via api for B2C customer, then verify the order details in MyOrders UI', () => {
        // Login via api using shopper saved in the fixture, Validate 2FA and verify it's successful
        cy.loginViaApi(b2cRewardsShopper.REAccount1).then((response: any) => {
        cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
        })

      // Place an order via api
        cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
        cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)
        deliveryOptions.CanLeaveUnattended = true
        cy.setDeliveryOptionsViaApi(deliveryOptions)
        
        cy.placeOrderViaApiWithAddedCreditCard(creditCardPayment, platform).then((confirmOrderResponse: any) => {
      // Save the Order details of the order placed    
        const orderId = confirmOrderResponse.Order.OrderId
        const orderTotal = confirmOrderResponse.Order.TotalIncludingGst
        const orderCreatedDate = confirmOrderResponse.Order.CreatedDate
        const orderDeliveryDate = confirmOrderResponse.Order.DeliveryDate
      //Convert the dates to the required format for assertion    
        const createdDate = dayjs(orderCreatedDate).format('D MMMM')
        const deliverydate = dayjs(orderDeliveryDate).format('D MMMM')

      // login via UI into same account
        cy.loginViaUi(shopper[1])
        cy.wait(15000)
      //Navigate to My order page through My account  
        onMyOrderPage.myAccountActions()  
      //Verify the Order details on My Orders page is same as the saved order details 
        onMyOrderPage.getMyOrderNumber(orderId)
        onMyOrderPage.getOrderTotalString(orderId, orderTotal) 
        onMyOrderPage.getOrderDateString(orderId, createdDate)
        onMyOrderPage.getDeliveryDateString(orderId, deliverydate)
        onMyOrderPage.getTrackMyOrderLink(orderId)
        onMyOrderPage.getViewOrderDetailsLink(orderId)

        })

    })

  })
})
