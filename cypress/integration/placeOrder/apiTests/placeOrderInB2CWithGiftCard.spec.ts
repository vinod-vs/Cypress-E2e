import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import TestFilter from '../../../support/TestFilter'
import giftCard from '../../../fixtures/payment/giftCard.json'
import giftCardPayment from '../../../fixtures/payment/giftCardPayment.json'
import multipleGiftCardPayment from '../../../fixtures/payment/multipleGiftCardPayment.json'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/giftCard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/checkout/api/commands/checkoutHelper'

TestFilter(['B2C', 'API', 'Checkout', 'P0'], () => {
  // Skip until Gifting Service authorisation is more stable
  describe.skip('[API] Place an order on the B2C site with a gift card payment', () => {
    const instrumentIdAssertionMsg =
      'Gift Card Payment Instrument ID returned from DigitalPay'

    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place a delivery order with full payment via gift card', () => {
      cy.loginWithNewShopperViaApi()

      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody.search,
        windowType.FLEET_DELIVERY
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Fish', 50.0)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Pet', 50.0)
      cy.navigateToCheckout().then((response: any) => {
        const balToPay: number = response.Model.Order.BalanceToPay

        cy.checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(
          balToPay
        ).then((response: any) => {
          expect(response, instrumentIdAssertionMsg).to.exist
          giftCardPayment.payments[0].paymentInstrumentId = response
          giftCardPayment.payments[0].amount = balToPay
        })
        cy.placeOrderViaApiWithPaymentRequest(giftCardPayment)
      })
    })

    it('Should place a delivery order with payment split across 2 gift cards', () => {
      cy.loginWithNewShopperViaApi()

      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody.search,
        windowType.FLEET_DELIVERY
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Frozen', 50.0)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Pet', 50.0)

      cy.navigateToCheckout().then((response: any) => {
        const balToPay: number = response.Model.Order.BalanceToPay
        const card1Payment = 0.01

        expect(balToPay, 'Balance To Pay').to.be.greaterThan(30.0)

        // RC 08/02/22: Add existing gift card until Gifting Service authorisation is more stable
        cy.addGiftCardToAccount(giftCard).then(() => {
          cy.checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(
            card1Payment
          ).then((response: any) => {
            expect(response, instrumentIdAssertionMsg).to.exist
            multipleGiftCardPayment.payments[0].paymentInstrumentId = response
            multipleGiftCardPayment.payments[0].amount = card1Payment
          })
        })

        cy.generateGiftCards(balToPay).then((response: any) => {
          const instrumentId = response[0].InstrumentId
          expect(instrumentId, instrumentIdAssertionMsg).to.exist
          multipleGiftCardPayment.payments[1].paymentInstrumentId = instrumentId
          multipleGiftCardPayment.payments[1].amount = balToPay - card1Payment
        })
        cy.placeOrderViaApiWithPaymentRequest(multipleGiftCardPayment)
      })
    })
  })
})
