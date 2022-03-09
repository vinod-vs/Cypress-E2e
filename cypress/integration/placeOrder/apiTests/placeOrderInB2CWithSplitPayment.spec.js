/// <reference types="cypress" />

import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import giftCard from '../../../fixtures/payment/giftCard.json'
import splitPayment from '../../../fixtures/payment/splitCreditGiftCardPayment.json'
import splitPayPalPayment from '../../../fixtures/payment/splitPayPalGiftCardPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import TestFilter from '../../../support/TestFilter'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import shopper from '../../../fixtures/checkout/payPalShoppers.json'
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
  describe('[API] Place an order on B2C Platform via split payment', () => {
    const searchTerm = 'Fish'
    const trolleyThreshold = 50.0

    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.logOutViaApi()
    })

    it('Should place a split payment order via Credit Card & Gift Card', () => {
      cy.loginWithNewShopperViaApi()

      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.CROWD_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      cy.navigateToCheckout().then((response) => {
        cy.log('Balance To Pay is: ' + response.Model.Order.BalanceToPay)

        splitPayment.payments[0].amount = response.Model.Order.BalanceToPay - 0.01
        splitPayment.payments[1].amount = 0.01
      })

      cy.navigatingToCreditCardIframe().then((response) => {
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })

      cy.creditcardTokenisation(creditCardPayment, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText, 'Credit Card Tokenisation').to.be.eqls('ACCEPTED')

        splitPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
      })

      addGiftCardAndCompleteSplitPaymentOrder(splitPayment)
    })

    it('Should place a split payment order via PayPal & Gift Card', () => {
      cy.loginViaApiAndHandle2FA(shopper.ppAccount1)
      cy.clearTrolley()

      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.CROWD_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)

      cy.navigateToCheckout().then((response) => {
        splitPayPalPayment.payments[0].amount = response.Model.Order.BalanceToPay - 0.01
        splitPayPalPayment.payments[1].amount = 0.01
      })

      cy.getLinkedPayPalAccountInstrumentId().then((instrumentId) => {
        splitPayPalPayment.payments[0].paymentInstrumentId = instrumentId
      })

      addGiftCardAndCompleteSplitPaymentOrder(splitPayPalPayment)
    }) 
  })
})

function addGiftCardAndCompleteSplitPaymentOrder(splitPaymentRequest) {
  // RC 08/02/22: Add existing gift card until Gifting Service authorisation is more stable
  cy.addGiftCardToAccount(giftCard).then((response) => {
    expect(response.status).to.eq(200)
  }).then(() => {
    cy.checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(0.01).then((response) => {
      expect(response, 'DigitalPay Gift Card Payment Instrument ID').to.not.be.null
      splitPaymentRequest.payments[1].paymentInstrumentId = response
    })
    cy.placeOrderViaApiWithPaymentRequest(splitPaymentRequest)
  })   
}
