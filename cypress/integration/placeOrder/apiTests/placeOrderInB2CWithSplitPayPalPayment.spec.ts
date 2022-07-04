/// <reference types="cypress" />

import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import giftCard from '../../../fixtures/payment/giftCard.json'
import splitPayPalPayment from '../../../fixtures/payment/splitPayPalGiftCardPayment.json'
import TestFilter from '../../../support/TestFilter'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import shopper from '../../../fixtures/checkout/paypalShoppers.json'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/payment/api/commands/giftCard'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/logout/api/commands/logout'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/payment/api/commands/paypal'

TestFilter(['B2C', 'API', 'SPUD', 'E2E'], () => {
  describe('[API] Place an order on B2C Platform via split PayPal payment', () => {
    const searchTerm = 'Fish'
    const additionalSearchTerm = 'Kitchen'
    const trolleyThreshold = 50.0

    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.logOutViaApi()
      cy.loginViaApiAndHandle2FA(shopper.ppAccount2)
      cy.removeSavedCreditAndGiftCardsViaAPI()
      cy.clearTrolley()
    })

    it('Should place a split payment order via PayPal & Gift Card', () => {
      const giftCardPaymentAmount = 0.01

      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody.search,
        windowType.CROWD_DELIVERY
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        searchTerm,
        trolleyThreshold
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        additionalSearchTerm,
        trolleyThreshold
      )

      cy.navigateToCheckout().then((response: any) => {
        expect(
          response.Model.Order.BalanceToPay,
          'Balance To Pay'
        ).to.be.greaterThan(30.0)
        splitPayPalPayment.payments[0].amount =
          Math.round(
            response.Model.Order.BalanceToPay * 100 -
              giftCardPaymentAmount * 100
          ) / 100

        splitPayPalPayment.payments[1].amount = giftCardPaymentAmount
      })

      cy.getLinkedPayPalAccountInstrumentId().then((instrumentId: any) => {
        expect(instrumentId, 'PayPal Instrument Id').to.exist
        splitPayPalPayment.payments[0].paymentInstrumentId = instrumentId
      })

      cy.addGiftCardAndCompleteSplitPaymentOrderViaAPI(
        giftCard,
        giftCardPaymentAmount,
        splitPayPalPayment
      )
    })
  })
})
