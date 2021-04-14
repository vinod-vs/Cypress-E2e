/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />
import 'cypress-iframe'
import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import tests from '../../../fixtures/everydayMarket/addItemsToTrolley.json'
import '../../../support/login/ui/commands/login'
import '../../../support/sideCart/ui/commands/clearTrolley'
import '../../../support/sideCart/ui/commands/cartContents'
import '../../../support/search/ui/commands/searchAndAddProduct'
import '../../../support/checkout/ui/commands/checkout'
import '../../../support/orderConfirmation/ui/commands/orderConfirmation'
import '../../../support/utilities/ui/utility'

describe('Place an test order using paypal', () => {
  // pre-requisite to clear all cookies before login
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })
  it('Place an test order using paypal', () => {
    // Login
    cy.loginViaUi(shoppers[0].emAccount1)

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
    cy.selectAnyDeliveryTimeSlot()

    // Click save details for items
    cy.saveItemsReviewDetails()

    // Click place order
    cy.clickPlaceOrder()

    // Verify order confirmation page
    cy.verifyOrderConfirmation()
  })
})
