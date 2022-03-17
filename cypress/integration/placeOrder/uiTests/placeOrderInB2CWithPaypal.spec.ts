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
import TestFilter from '../../../support/TestFilter'


TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'P0', 'E2E'], () => {
  describe('[UI] Place a delivery order by using Paypal', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    })

    beforeEach(() => {  
      cy.loginViaUi(b2cShoppers[3]);
      onSideCartPage.cleanupTrolley();
    })

    it('Place a delivery order with woolworths items', () => {
      onFMSRibbon.getFMSRibbonAddressLink().click({waitForAnimations: false});

      onFMSAddressSelector.getDeliveryTab().click();
      onFMSAddressSelector.getAddNewDeliveryAddressButton().click();
      onFMSAddressSelector.searchForNewDeliveryAddress(addressTestData.search);
      onFMSAddressSelector.getSaveAndContinueButton().click();

      onFMSWindowSelector.selectNextAvailableDay();
      onFMSWindowSelector.selectLastTimeslot();
      onFMSWindowSelector.getContinueShoppingButton().click();

      onHomePage.getSearchHeader().click();
      onHomePage.getSearchHeader().type('health').type('{enter}');

      onSearchResultsPage.addAvailableProductsFromSearchResultToCartUntilReachMinSpendThreshold(30);

      onSideCartPage.getViewCartButton().click();

      cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow');

      onSideCartPage.gotoCheckout();

      onHaveYouForgottenPage.continueToCheckout();

      cy.wait('@fulfilmentWindow');

      onCheckoutPage.onCheckoutFulfilmentSelectionPanel.getSummarisedFulfilmentAddressElement().then(address => {
        cy.wrap(address.text()).as('expectedAddress');
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentDay().then(fulfilmentDay => {
        cy.wrap(fulfilmentDay).as('expectedFulfilmentDay');
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentTime().then(fulfilmentTime => {
        cy.wrap(fulfilmentTime).as('expectedFulfilmentTime');
      })

      onCheckoutPage.onCheckoutPaymentPanel.getPaymentTotalAmountElement().then(totalAmount => {
        cy.wrap(totalAmount.text()).as('expectedTotalAmount');
      })

      onCheckoutPage.onCheckoutPaymentPanel.PayWithExistingPayPal();

      // Verify order confirmation page
      onOrderConfirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received');
      cy.url().should('include', '/confirmation');

      cy.get<string>('@expectedAddress').then(expectedAddress => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedAddress);
      })

      cy.get<string>('@expectedFulfilmentDay').then(expectedFulfilmentDay => {

        // This is for handling the case when tests running on VM, the machine local time is one day back of woolworths app server time, 
        // if script selects same day window, the checkout page will show day of week of tomorrow but order confirmaiton page shows 'Tomorrow'
        const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        cy.getDayOfWeek(tomorrow).then((tomorrowDayOfWeek : string) => {
          if(expectedFulfilmentDay.includes(tomorrowDayOfWeek)){
            onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', 'Tomorrow');
          }
          else{
            onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentDay);
          }
        })
      })

      cy.get<string>('@expectedFulfilmentTime').then(expectedFulfilmentTime => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentTime);
      })

      cy.get<string>('@expectedTotalAmount').then(expectedTotalAmount => {
        onOrderConfirmationPage.getOrderPaymentSummaryTotalAmountElement().should('contain.text', expectedTotalAmount);
      })
    })
  })
})