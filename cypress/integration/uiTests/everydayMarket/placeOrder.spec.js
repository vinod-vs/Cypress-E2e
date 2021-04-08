/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />
import 'cypress-iframe'
import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import items from '../../../fixtures/everydayMarket/addItemsToTrolley.json'
import '../../../support/ui/commands/login/login'
import '../../../support/ui/commands/sideCart/clearTrolley'
import '../../../support/ui/commands/search/searchAndAddProduct'
import '../../../support/ui/commands/checkout/checkout'
import '../../../support/ui/commands/confirmation/confirmation'
import '../../../support/ui/utilities/utility'

describe('Place an test order using paypal', () => {

    //pre-requisite to clear all cookies before login
    before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })
    it('Place an test order using paypal', () => {

        //Login 
        cy.loginViaUi(shoppers[0].EM1)

        //Clear cart if required
        cy.clearTrolley()

        //Search and add the products
        cy.searchAndAddProductsToCart(items.Test1)

        //View Cart
        cy.viewCart();

        //Go to checkout page
        cy.clickCheckout();

        //Select third delivery slot
        cy.selectAnyDeliveryTimeSlot()

        //Click save details for items
        cy.saveItemsReviewDetails()

        //Click place order
        cy.clickPlaceOrder()

        //Verify order confirmation page
        cy.verifyOrderConfirmation()

    })
})