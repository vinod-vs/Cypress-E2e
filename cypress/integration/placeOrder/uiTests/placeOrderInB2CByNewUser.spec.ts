/// <reference types="Cypress" />
import '../../../support/login/ui/commands/login'
import '../../../support/login/api/commands/login'
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector'
import { onFMSRibbon } from '../../../support/fulfilment/ui/pageObjects/FMSRibbon'
import { onFMSWindowSelector } from '../../../support/fulfilment/ui/pageObjects/FMSWindowSelector'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage'
import { onHaveYouForgottenPage } from '../../../support/hyf/ui/pageObjects/HaveYouForgottenPage'
import addressTestData from '../../../fixtures/checkout/addressSearch.json'
import storeTestData from '../../../fixtures/checkout/storeSearchBVT.json'
import creditcardPayment from '../../../fixtures/payment/creditcardPayment.json'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'P1', 'E2E', 'NewUser'], () => {
  describe('[UI] Place orders by new user', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      cy.loginWithNewShopperViaApi()

      onHomePage.loadHomePage()

      onFMSRibbon.getFMSRibbonAddressLink().click({ waitForAnimations: false })
    })

    it('Place a delivery order with woolworths items', () => {
      onFMSAddressSelector.chooseFulfilmentOptionForFirstTimeCustomer('Delivery')
      onFMSAddressSelector.getDeliveryTab().click()
      onFMSAddressSelector.searchForNewDeliveryAddress(addressTestData.search)
      onFMSAddressSelector.getSaveAndContinueButton().click()

      onFMSWindowSelector.selectAvailableDayAfterTomorrow()
      onFMSWindowSelector.selectLastTimeslot()
      onFMSWindowSelector.getContinueShoppingButton().click()

      onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold('health', 30)

      onSideCartPage.getViewCartButton().click()

      cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

      onSideCartPage.gotoCheckout()

      onHaveYouForgottenPage.continueToCheckout()

      cy.wait('@fulfilmentWindow')
    })

    it('Place a pickup order with woolworths groceries', () => {
      onFMSAddressSelector.chooseFulfilmentOptionForFirstTimeCustomer('Pickup')
      onFMSAddressSelector.getPickupTab().click()
      onFMSAddressSelector.searchForStoreBySuburbName(storeTestData.suburb)
      onFMSAddressSelector.getSaveAndContinueButton().click()

      onFMSWindowSelector.selectAvailableDayAfterTomorrow()
      onFMSWindowSelector.selectLastTimeslot();
      onFMSWindowSelector.getContinueShoppingButton().click()

      onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold('health', 30)

      onSideCartPage.getViewCartButton().click()

      cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

      onSideCartPage.gotoCheckout()

      onHaveYouForgottenPage.continueToCheckout()

      cy.wait('@fulfilmentWindow')

      onCheckoutPage.onCheckoutPaymentPanel.searchForNewBillingAddress(storeTestData.billingAddress)
    })

    it('Place a direct to boot order with woolworths groceries', () => {
      onFMSAddressSelector.chooseFulfilmentOptionForFirstTimeCustomer('DTB')
      onFMSAddressSelector.getDirectToBootTab().click()
      onFMSAddressSelector.searchForStoreBySuburbName(storeTestData.suburb)
      onFMSAddressSelector.getSaveAndContinueButton().click()

      onFMSWindowSelector.selectAvailableDayAfterTomorrow()
      onFMSWindowSelector.selectLastTimeslot()
      onFMSWindowSelector.getContinueShoppingButton().click()

      onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold('health', 30)

      onSideCartPage.getViewCartButton().click()

      cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

      onSideCartPage.gotoCheckout()

      onHaveYouForgottenPage.continueToCheckout()

      cy.wait('@fulfilmentWindow')

      onCheckoutPage.onCheckoutPaymentPanel.searchForNewBillingAddress(storeTestData.billingAddress)
    })

    afterEach(() => {
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
      onCheckoutPage.onCheckoutPaymentPanel.payWithNewCreditCard(creditcardPayment.aa, creditcardPayment.dd, creditcardPayment.ee, creditcardPayment.bb)

     // Verify order confirmation page
     onOrderConfirmationPage.VerifyOrderConfirmationHeader()
     onOrderConfirmationPage.VerifyFulfilmentAddress(expectedFulfilmentAddressAlias)
     onOrderConfirmationPage.VerifyFulfilmentDay(expectedFulfilmentDayAlias)
     onOrderConfirmationPage.VerifyFulfilmentTime(expectedFulfilmentTimeAlias)
     onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)
    })
  })
})
