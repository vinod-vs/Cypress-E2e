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
import creditcardPayment from '../../../fixtures/payment/creditcardPayment.json'
import giftCardList from '../../../fixtures/payment/giftCard_UIE2E.json'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C', 'UI', 'Checkout', 'SPUD', 'P0', 'E2E', 'SplitPayment'], () => {
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
      cy.loginViaUi(b2cShoppers[3])
      onSideCartPage.cleanupTrolley()

      onFMSRibbon.getFMSRibbonAddressLink().click({ waitForAnimations: false })

      onFMSAddressSelector.getDeliveryTab().click()
      onFMSAddressSelector.getAddNewDeliveryAddressButton().click()
      onFMSAddressSelector.searchForNewDeliveryAddress(addressTestData.search)
      onFMSAddressSelector.getSaveAndContinueButton().click()

      onFMSWindowSelector.selectAvailableDayAfterTomorrow()
      onFMSWindowSelector.selectLastTimeslot()
      onFMSWindowSelector.getContinueShoppingButton().click()

      onHomePage.getSearchHeader().click()
      onHomePage.getSearchHeader().type('health').type('{enter}')

      onSearchResultsPage.addAvailableProductsFromSearchResultToCartUntilReachMinSpendThreshold(30)

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
      onCheckoutPage.onCheckoutPaymentPanel.splitPayWithNewCreditCardAndNewGiftCard(creditcardPayment.aa, creditcardPayment.dd, creditcardPayment.ee, creditcardPayment.bb, giftCardList[0].cardNumber, giftCardList[0].pin, giftCardToBePaidAmount)

      // Verify order confirmation page
      onOrderConfirmationPage.VerifyOrderConfirmationHeader()
      onOrderConfirmationPage.VerifyFulfilmentAddress(expectedFulfilmentAddressAlias)
      onOrderConfirmationPage.VerifyFulfilmentDay(expectedFulfilmentDayAlias)
      onOrderConfirmationPage.VerifyFulfilmentTime(expectedFulfilmentTimeAlias)
      onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)

      onOrderConfirmationPage.VerifySplitPaymentGiftCardAmount(giftCardToBePaidAmount)
      onOrderConfirmationPage.VerifySplitPaymentCreditCardAmount(giftCardToBePaidAmount)
    })

    it('Place a delivery order by spliting payment with gift card and existing paypal', () => {
      const giftCardToBePaidAmount = 0.01
      onCheckoutPage.onCheckoutPaymentPanel.splitPayWithExistingPaypalAndNewGiftCard(giftCardList[0].cardNumber, giftCardList[0].pin, giftCardToBePaidAmount)

      // Verify order confirmation page
      onOrderConfirmationPage.VerifyOrderConfirmationHeader()
      onOrderConfirmationPage.VerifyFulfilmentAddress(expectedFulfilmentAddressAlias)
      onOrderConfirmationPage.VerifyFulfilmentDay(expectedFulfilmentDayAlias)
      onOrderConfirmationPage.VerifyFulfilmentTime(expectedFulfilmentTimeAlias)
      onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)

      onOrderConfirmationPage.VerifySplitPaymentGiftCardAmount(giftCardToBePaidAmount)
      onOrderConfirmationPage.VerifySplitPaymentPayPalAmount(giftCardToBePaidAmount)
    })
  })
})
