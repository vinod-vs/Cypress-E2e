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
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'E2E', 'SplitPayment'], () => {
  describe('[UI] Place orders with split payment', () => {

    const expectedFulfilmentAddressAlias = 'expectedAddress'
    const expectedFulfilmentDayAlias = 'expectedFulfilmentDay'
    const expectedFulfilmentTimeAlias = 'expectedFulfilmentTime'
    const expectedTotalAmountAlias = 'expectedTotalAmount'

    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      cy.loginViaUi(b2cShoppers.E2ETestAccounts.placeOrderInB2CWithSplitPayment)
      onSideCartPage.cleanupTrolley()

      onFMSRibbon.getFMSRibbonAddressLink().click({ waitForAnimations: false })

      onFMSAddressSelector.getDeliveryTab().click()
      onFMSAddressSelector.getAddNewDeliveryAddressButton().click()
      onFMSAddressSelector.searchForNewDeliveryAddress(addressTestData.search)
      onFMSAddressSelector.getSaveAndContinueButton().click()

      onFMSWindowSelector.selectAvailableDayAfterTomorrow()
      onFMSWindowSelector.selectLastTimeslot()
      onFMSWindowSelector.getContinueShoppingButton().click()

      onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold('health & beauty', 30, 'Price High to Low')

      onSideCartPage.getViewCartButton().click()

      cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

      onSideCartPage.gotoCheckout()

      onHaveYouForgottenPage.continueToCheckout()

      cy.wait('@fulfilmentWindow')

      // Wrap order basic info from checkout page and save into alias
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
    })

    it('Place a delivery order by spliting payment with gift card and new credit card', () => {
      const giftCardToBePaidAmount = 0.01
      onCheckoutPage.onCheckoutPaymentPanel.splitPayWithNewCreditCardAndNewGiftCard(Cypress.env('cc_number'), '12', '25', Cypress.env('cc_cvv'), Cypress.env('gc_number'), Cypress.env('gc_pin'), giftCardToBePaidAmount)

      // Verify order confirmation page
      onOrderConfirmationPage.VerifyOrderConfirmationHeader()
      onOrderConfirmationPage.VerifyFulfilmentAddress(expectedFulfilmentAddressAlias)
      onOrderConfirmationPage.VerifyFulfilmentDay(expectedFulfilmentDayAlias)
      onOrderConfirmationPage.VerifyFulfilmentTime(expectedFulfilmentTimeAlias)
      onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)

      onOrderConfirmationPage.VerifySplitPaymentGiftCardAmount(giftCardToBePaidAmount)
      onOrderConfirmationPage.VerifySplitPaymentCreditCardAmount(giftCardToBePaidAmount, expectedTotalAmountAlias)
    })

    it('Place a delivery order by spliting payment with gift card and existing paypal', () => {
      const giftCardToBePaidAmount = 0.01
      onCheckoutPage.onCheckoutPaymentPanel.splitPayWithExistingPaypalAndNewGiftCard(Cypress.env('gc_number'), Cypress.env('gc_pin'), giftCardToBePaidAmount)

      // Verify order confirmation page
      onOrderConfirmationPage.VerifyOrderConfirmationHeader()
      onOrderConfirmationPage.VerifyFulfilmentAddress(expectedFulfilmentAddressAlias)
      onOrderConfirmationPage.VerifyFulfilmentDay(expectedFulfilmentDayAlias)
      onOrderConfirmationPage.VerifyFulfilmentTime(expectedFulfilmentTimeAlias)
      onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)

      onOrderConfirmationPage.VerifySplitPaymentGiftCardAmount(giftCardToBePaidAmount)
      onOrderConfirmationPage.VerifySplitPaymentPayPalAmount(giftCardToBePaidAmount, expectedTotalAmountAlias)
    })
  })
})
