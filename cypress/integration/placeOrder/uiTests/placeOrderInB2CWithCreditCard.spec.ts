/// <reference types="Cypress" />
import '../../../support/login/ui/commands/login'
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector'
import { onFMSRibbon } from '../../../support/fulfilment/ui/pageObjects/FMSRibbon'
import { onFMSWindowSelector } from '../../../support/fulfilment/ui/pageObjects/FMSWindowSelector'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onHaveYouForgottenPage } from '../../../support/hyf/ui/pageObjects/HaveYouForgottenPage'
import b2cShoppers from '../../../fixtures/login/b2cShoppers.json'
import addressTestData from '../../../fixtures/checkout/addressSearch.json'
import storeTestData from '../../../fixtures/checkout/storeSearchBVT.json'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'E2E'], () => {
  describe('[UI] Place orders by using credit card', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      cy.loginViaUi(b2cShoppers.E2ETestAccounts.placeOrderInB2CWithCreditCard)

      onSideCartPage.cleanupTrolley()

      onFMSRibbon.getFMSRibbonAddressLink().click({ waitForAnimations: false })
    })

    it('Place a delivery order with woolworths items', () => {
      onFMSAddressSelector.getDeliveryTab().click()
      onFMSAddressSelector.getAddNewDeliveryAddressButton().click()
      onFMSAddressSelector.searchForNewDeliveryAddress(addressTestData.search)
      onFMSAddressSelector.getSaveAndContinueButton().click()
    })

    it('Place a pickup order with woolworths groceries', () => {
      onFMSAddressSelector.getPickupTab().click()
      onFMSAddressSelector.searchForStoreBySuburbName(storeTestData.suburb)
      onFMSAddressSelector.getSaveAndContinueButton().click()
    })

    it('Place a direct to boot order with woolworths groceries', () => {
      onFMSAddressSelector.getDirectToBootTab().click()
      onFMSAddressSelector.searchForStoreBySuburbName(storeTestData.suburb)
      onFMSAddressSelector.getSaveAndContinueButton().click()
    })

    afterEach(() => {
      onFMSWindowSelector.selectAvailableDayAfterTomorrow();
      onFMSWindowSelector.selectLastTimeslot();
      onFMSWindowSelector.getContinueShoppingButton().click()

      onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold('health & beauty', 30, 'Price High to Low')

      onSideCartPage.getViewCartButton().click()

      cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

      onSideCartPage.gotoCheckout()

      onHaveYouForgottenPage.continueToCheckout()

      cy.wait('@fulfilmentWindow')

      // Wrap order basic info from checkout page and save into alias
      let expectedFulfilmentAddressAlias = 'expectedAddress'
      let expectedFulfilmentDayAlias = 'expectedFulfilmentDay'
      let expectedFulfilmentTimeAlias = 'expectedFulfilmentTime'
      let expectedTotalAmountAlias = 'expectedTotalAmount'

      onCheckoutPage.onCheckoutFulfilmentSelectionPanel.getSummarisedFulfilmentAddressElement().then(address => {
        cy.wrap(address.text()).as(expectedFulfilmentAddressAlias);
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentDay().then(fulfilmentDay => {
        cy.wrap(fulfilmentDay).as(expectedFulfilmentDayAlias);
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentTime().then(fulfilmentTime => {
        cy.wrap(fulfilmentTime).as(expectedFulfilmentTimeAlias);
      })

      onCheckoutPage.onCheckoutPaymentPanel.getPaymentTotalAmountElement().then(totalAmount => {
        cy.wrap(totalAmount.text()).as(expectedTotalAmountAlias);
      })

      // Pay with instrument
      onCheckoutPage.onCheckoutPaymentPanel.payWithNewCreditCard(Cypress.env('cc_number'), '12', '25', Cypress.env('cc_cvv'))

     // Verify order confirmation page
     onOrderConfirmationPage.VerifyOrderConfirmationHeader()
     onOrderConfirmationPage.VerifyFulfilmentAddress(expectedFulfilmentAddressAlias)
     onOrderConfirmationPage.VerifyFulfilmentDay(expectedFulfilmentDayAlias)
     onOrderConfirmationPage.VerifyFulfilmentTime(expectedFulfilmentTimeAlias)
     onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)
    })
  })
})
