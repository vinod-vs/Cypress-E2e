/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />
import 'cypress-iframe'
import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import tests from '../../../fixtures/everydayMarket/addItemsToTrolley.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/sideCart/ui/commands/clearTrolley'
import '../../../support/sideCart/ui/commands/cartContents'
import '../../../support/search/ui/commands/searchAndAddProduct'
import '../../../support/checkout/ui/commands/checkout'
import '../../../support/orderConfirmation/ui/commands/orderConfirmation'
import '../../../support/payment/ui/commands/creditCardPayment'
import '../../../support/payment/ui/commands/payPalPayment'
import '../../../support/utilities/ui/utility'

TestFilter(['UI'], () => {
  describe('[UI] Place an order with WOW and MP items', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    it('Place an order using paypal', () => {
      // Login
      cy.loginViaUi(shoppers.emAccount2)

      // Clear cart if required
      cy.clearTrolley()

      // Search and add the products
      cy.searchAndAddProductsToCart(tests.WowPlusEMOrderTest1)

      // View Cart
      cy.viewCart()

      // Verify cart contents as as expected
      cy.verifyCartContent(tests.WowPlusEMOrderTest1)

      // Go to checkout page
      cy.clickCheckout()

      // Select third delivery slot
      cy.selectAnyAvailableDeliveryTimeSlotAndSave()

      // Click save details for items
      cy.saveItemsReviewDetails()

      // Get shipping fees from UI
      cy.getShippingFeesFromUI(tests.WowPlusEMOrderTest1)

      // Get any order discounts
      cy.getDiscountAmountIfAny(tests.WowPlusEMOrderTest1)

      // Get Resuable bags amount
      cy.getResuableBagsAmount(tests.WowPlusEMOrderTest1)

      // Verify the Item Quantity And the Amounts
      cy.verifyAmounts(tests.WowPlusEMOrderTest1)

      // Select paypal
      cy.selectPayPalPaymentMode()

      // Click place order
      cy.clickPlaceOrder()

      // Verify order confirmation page
      cy.verifyOrderConfirmation()
    })

    it('Place an order using credit card', () => {
      // Login
      cy.loginViaUi(shoppers.emAccount2)

      // Clear cart if required
      cy.clearTrolley()

      // Search and add the products
      cy.searchAndAddProductsToCart(tests.WowPlusEMOrderTest1)

      // View Cart
      cy.viewCart()

      // Verify cart contents as as expected
      cy.verifyCartContent(tests.WowPlusEMOrderTest1)

      // Go to checkout page
      cy.clickCheckout()

      // Select third delivery slot
      cy.selectAnyAvailableDeliveryTimeSlotAndSave()

      // Click save details for items
      cy.saveItemsReviewDetails()

      // Get shipping fees from UI
      cy.getShippingFeesFromUI(tests.WowPlusEMOrderTest1)

      // Get any order discounts
      cy.getDiscountAmountIfAny(tests.WowPlusEMOrderTest1)

      // Get Resuable bags amount
      cy.getResuableBagsAmount(tests.WowPlusEMOrderTest1)

      // Verify the Item Quantity And the Amounts
      cy.verifyAmounts(tests.WowPlusEMOrderTest1)

      // Fill credit card details
      cy.fillCreditCardPaymentDetails(tests.WowPlusEMOrderTest1.payment.creditCard)

      // Click place order
      cy.clickPlaceOrder()

      // Verify order confirmation page
      cy.verifyOrderConfirmation()
    })
  })
})