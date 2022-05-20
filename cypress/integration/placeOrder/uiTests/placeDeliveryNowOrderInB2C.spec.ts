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
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'P0', 'E2E', 'DN'], () => {
  describe('[UI] Place delivery now order by using Paypal', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      cy.loginViaUi(b2cShoppers[3])
      onSideCartPage.cleanupTrolley()
    })

    it('Place a delivery now order with woolworths items', () => {
      onFMSRibbon.getFMSRibbonAddressLink().click({ waitForAnimations: false })

      onFMSAddressSelector.getDeliveryTab().click()
      onFMSAddressSelector.getAddNewDeliveryAddressButton().click()
      onFMSAddressSelector.searchForNewDeliveryAddress(addressSearchBody.searchDN)
      onFMSAddressSelector.getSaveAndContinueButton().click()

      onFMSWindowSelector.selectSameDay()
      onFMSWindowSelector.selectDeliveryNowTimeslot()
      onFMSWindowSelector.getContinueShoppingButton().click()

      onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold('health', 30)

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
        cy.wrap(address.text()).as(expectedFulfilmentAddressAlias)
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentDay().then(fulfilmentDay => {
        cy.wrap(fulfilmentDay).as(expectedFulfilmentDayAlias)
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentTime().then(fulfilmentTime => {
        cy.wrap(fulfilmentTime).as(expectedFulfilmentTimeAlias)
      })

      onCheckoutPage.onCheckoutPaymentPanel.getPaymentTotalAmountElement().then(totalAmount => {
        cy.wrap(totalAmount.text()).as(expectedTotalAmountAlias)
      })

      // Pay with instrument
      onCheckoutPage.onCheckoutPaymentPanel.payWithExistingPayPal()

      // Verify order confirmation page
      onOrderConfirmationPage.VerifyOrderConfirmationHeader()
      onOrderConfirmationPage.VerifyFulfilmentAddress(expectedFulfilmentAddressAlias)
      onOrderConfirmationPage.VerifyFulfilmentDay(expectedFulfilmentDayAlias)
      onOrderConfirmationPage.VerifyDeliveryNowFulfilmentTime(expectedFulfilmentTimeAlias)
      onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)
    })
  })
})
