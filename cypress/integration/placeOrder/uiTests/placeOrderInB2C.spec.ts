/// <reference types="Cypress" />
import '../../../support/login/ui/commands/login'
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector'
import { onFMSRibbon } from '../../../support/fulfilment/ui/pageObjects/FMSRibbon'
import { onFMSWindowSelector } from '../../../support/fulfilment/ui/pageObjects/FMSWindowSelector'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import {onSearchResultsPage} from '../../../support/search/ui/pageObjects/SearchResultsPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage'
import b2cShoppers from '../../../fixtures/login/b2cShoppers.json'
import TestFilter from '../../../support/TestFilter'


TestFilter(['B2C', 'UI', 'Checkout', 'P0'], () => {
  describe('[UI] Place an order by using credit card', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      cy.visit('shop/securelogin')
      cy.url().should('include', '/securelogin')
  
      cy.loginViaUi(b2cShoppers[3])
      
      onSideCartPage.openSideCart()
      onSideCartPage.removeAllItems()
      onSideCartPage.closeSideCart()

      onFMSRibbon.getFMSRibbonAddressLink().click({waitForAnimations: false});
    })

    it('Place a delivery order with woolworths groceries', () => {
      onFMSAddressSelector.getDeliveryTab().click();
      onFMSAddressSelector.getAddNewDeliveryAddressButton().click();
      onFMSAddressSelector.searchForNewAddress("407-419 Elizabeth Street, SURRY HILLS  NSW");
      onFMSAddressSelector.getSaveAndContinueButton().click();
    })

    it('Place a pickup order with woolworths groceries', () => {
      onFMSAddressSelector.getPickupTab().click();
      onFMSAddressSelector.searchForStoreBySuburbName("cherrybrook");
      onFMSAddressSelector.getSaveAndContinueButton().click();
    })

    it('Place a direct to boot order with woolworths groceries', () => {
      onFMSAddressSelector.getDirectToBootTab().click();
      onFMSAddressSelector.searchForStoreBySuburbName("hornsby");
      onFMSAddressSelector.getSaveAndContinueButton().click();
    })

    afterEach(()=>{
      onFMSWindowSelector.selectNextAvailableDay();
      onFMSWindowSelector.selectLastTimeslot();
      onFMSWindowSelector.getContinueShoppingButton().click()

      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type('bottle').type('{enter}')

      onSearchResultsPage.addAvailableHighestPriceProductToCartFromSearchResultPages(3)

      onSideCartPage.getViewCartButton().click()
      onSideCartPage.gotoCheckout()

      onSearchResultsPage.continueToCheckout()

      onCheckoutPage.onCheckoutPaymentPanel.PayWithNewCreditCard('4265581110647303', 8, 22, 143)

      // Verify order confirmation page
      onOrderConfirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received')
      cy.url().should('include', '/confirmation')
    })
  })
})
