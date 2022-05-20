/// <reference types="cypress" />

import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import giftCard from '../../../fixtures/payment/giftCard.json'
import splitPayment from '../../../fixtures/payment/splitCreditGiftCardPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import TestFilter from '../../../support/TestFilter'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
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

TestFilter(['B2C', 'API', 'P0'], () => {
  describe('[API] Place an order on B2C Platform via split card payment', () => {
    const creditCard = Cypress.env('creditCard')
    const searchTerm = 'Fish'
    const trolleyThreshold = 50.0

    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place a split payment order via Credit Card & Gift Card', () => {
      const giftCardPaymentAmount = 0.01

      cy.loginWithNewShopperViaApi()

      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody.search, windowType.CROWD_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      cy.navigateToCheckout().then((response) => {
        cy.log('Balance To Pay is: ' + response.Model.Order.BalanceToPay)

        splitPayment.payments[0].amount = (response.Model.Order.BalanceToPay * 100 - giftCardPaymentAmount * 100) / 100
        splitPayment.payments[1].amount = giftCardPaymentAmount
      })

      cy.navigatingToCreditCardIframe().then((response) => {
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })

      cy.creditcardTokenisation(creditCard, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText, 'Credit Card Tokenisation').to.be.eqls('ACCEPTED')

        splitPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
      })

      cy.addGiftCardAndCompleteSplitPaymentOrderViaAPI(giftCard, giftCardPaymentAmount, splitPayment)
    })
  })
})
