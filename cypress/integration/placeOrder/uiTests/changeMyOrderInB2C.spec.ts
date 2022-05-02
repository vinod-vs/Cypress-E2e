/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import { MyOrderPage } from '../../../support/myOrder/ui/pageObjects/MyOrderPage'
import { onOrderDetailsPage } from '../../../support/myOrder/ui/pageObjects/OrderDetailsPage'
import {onSideCartPage} from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onHaveYouForgottenPage } from '../../../support/hyf/ui/pageObjects/HaveYouForgottenPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
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
import creditcardPayment from '../../../fixtures/payment/creditcardPayment.json'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'P0', 'E2E'], () => {
    const searchTerm = 'Pet'
    const trolleyThreshold = 50.00
    const platform = Cypress.env('b2cPlatform')
    
  describe('[UI] Change Order in MyOrders for order placed by B2C customer', () => {    
    before('open application', () => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })

    it('Place an order via api for B2C customer, then Change the order in MyOrders/order details UI', () => {
      // Login via api using new shopper
        cy.loginWithNewShopperViaApi()

      // Place an order via api
        cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
        cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

        creditCardPayment.save = true
        cy.placeOrderViaApiWithAddedCreditCard(platform, creditCardPayment).then((confirmOrderResponse: any) => {

      // Save the Order Id of the order placed    
        const orderId = confirmOrderResponse.Order.OrderId

      //Navigate to UI - My order page 
        cy.visit("/shop/myaccount/myorders")
        cy.wait(500)

      //Passing the orderId to the Page object constructor 
        let onMyOrderPage = new MyOrderPage(orderId) 

      //Get to the Order details on My Orders page and Change the order 
        onMyOrderPage.getMyOrderNumber().should('contain', orderId)
        onMyOrderPage.getViewOrderDetailsLink().click()
        onOrderDetailsPage.getChangeOrderButton().click()
        onOrderDetailsPage.getMyOrderModalCheckbox().then(checkbox => {
        cy.wrap(checkbox).should('not.be.visible').check({force:true}).should('be.checked')
        })
        onOrderDetailsPage.getChangeMyOrderModalButton().should('contain', 'Change my order').click({force:true})
        cy.wait(500)
       
        // Increase the Product item Quantity in sidecart
        onSideCartPage.getAvailableProductsInCartPanel().should('be.visible')
        onSideCartPage.getAvailableProductsIncrementButtonList().should('not.be.disabled').click({multiple:true})

        cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

        onSideCartPage.getTotalAmountElement().then(totalAmount => {
          cy.wrap(totalAmount.text()).as('expectedTotalAmount')
        })

        onSideCartPage.gotoCheckout()
  
        cy.wait('@fulfilmentWindow')
  
        onCheckoutPage.onCheckoutPaymentPanel.getPaymentTotalAmountElement().then(totalAmount => {
          cy.wrap(totalAmount.text()).as('expectedTotalAmount')
        })

       onCheckoutPage.onCheckoutPaymentPanel.payWithExistingCreditCard('0321', creditCardPayment.bb)
        cy.wait(500)

      // Verify order confirmation page
        onOrderConfirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received')
        cy.url().should('include', '/confirmation')
  
        cy.get<string>('@expectedTotalAmount').then(expectedTotalAmount => {
          onOrderConfirmationPage.getOrderPaymentSummaryTotalAmountElement().should('contain.text', expectedTotalAmount)
        })
        })
    })
    })
})