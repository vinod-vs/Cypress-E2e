/// <reference types="Cypress" />
import '../../../support/login/ui/commands/login'
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector'
import { onFMSRibbon } from '../../../support/fulfilment/ui/pageObjects/FMSRibbon'
import { onFMSWindowSelector } from '../../../support/fulfilment/ui/pageObjects/FMSWindowSelector'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage'
import { onHaveYouForgottenPage } from '../../../support/hyf/ui/pageObjects/HaveYouForgottenPage'
import b2cShoppers from '../../../fixtures/login/b2cShoppers.json'
import addressTestData from '../../../fixtures/checkout/addressSearch.json'
import storeTestData from '../../../fixtures/checkout/storeSearch.json'
import creditcardPayment from '../../../fixtures/payment/creditcardPayment.json'
import TestFilter from '../../../support/TestFilter'


TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'P0'], () => {
  describe('[UI] Place an order by using credit card', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {  
      cy.loginViaUi(b2cShoppers[3])
      
      onSideCartPage.cleanupTrolley()

      onFMSRibbon.getFMSRibbonAddressLink().click({waitForAnimations: false});
    })

    it('Place a delivery order with woolworths items', () => {
      onFMSAddressSelector.getDeliveryTab().click();
      onFMSAddressSelector.getAddNewDeliveryAddressButton().click();
      onFMSAddressSelector.searchForNewDeliveryAddress(addressTestData.search);
      onFMSAddressSelector.getSaveAndContinueButton().click();
    })

    it('Place a pickup order with woolworths groceries', () => {
      onFMSAddressSelector.getPickupTab().click();
      onFMSAddressSelector.searchForStoreBySuburbName(storeTestData.suburb);
      onFMSAddressSelector.getSaveAndContinueButton().click();
    })

    it('Place a direct to boot order with woolworths groceries', () => {
      onFMSAddressSelector.getDirectToBootTab().click();
      onFMSAddressSelector.searchForStoreBySuburbName(storeTestData.suburb);
      onFMSAddressSelector.getSaveAndContinueButton().click();
    })

    afterEach(()=>{
      onFMSWindowSelector.selectNextAvailableDay();
      onFMSWindowSelector.selectLastTimeslot();
      onFMSWindowSelector.getContinueShoppingButton().click()

      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type('health').type('{enter}')

      onSearchResultsPage.addAvailableProductsFromSearchResultToCartUntilReachMinSpendThreshold(30)

      onSideCartPage.getViewCartButton().click()

      cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

      onSideCartPage.gotoCheckout()

      onHaveYouForgottenPage.continueToCheckout()

      cy.wait('@fulfilmentWindow')

      onCheckoutPage.onCheckoutFulfilmentSelectionPanel.getSummarisedFulfilmentAddressElement().then(address => {
        cy.wrap(address.text()).as('expectedAddress')
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentDay().then(fulfilmentDay => {
        cy.wrap(fulfilmentDay).as('expectedFulfilmentDay')
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentTime().then(fulfilmentTime => {
        cy.wrap(fulfilmentTime).as('expectedFulfilmentTime')
      })

      onCheckoutPage.onCheckoutPaymentPanel.getPaymentTotalAmountElement().then(totalAmount => {
        cy.wrap(totalAmount.text()).as('expectedTotalAmount')
      })

      onCheckoutPage.onCheckoutPaymentPanel.PayWithNewCreditCard(creditcardPayment.aa, creditcardPayment.dd, creditcardPayment.ee, creditcardPayment.bb)

      // Verify order confirmation page
      onOrderConfirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received')
      cy.url().should('include', '/confirmation')

      cy.get<string>('@expectedAddress').then(expectedAddress => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedAddress)
      })

      cy.get<string>('@expectedFulfilmentDay').then(expectedFulfilmentDay => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentDay)
      })

      cy.get<string>('@expectedFulfilmentTime').then(expectedFulfilmentTime => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentTime)
      })

      cy.get<string>('@expectedTotalAmount').then(expectedTotalAmount => {
        onOrderConfirmationPage.getOrderPaymentSummaryTotalAmountElement().should('contain.text', expectedTotalAmount)
      })
    })
  })
})
