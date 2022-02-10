import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import TestFilter from '../../../support/TestFilter'
import giftCardPayment from '../../../fixtures/payment/giftCardPayment.json'
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
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place a delivery order with full payment via gift card', () => {
      cy.loginWithNewShopperViaApi()

      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Fish', 50.0)
      cy.navigateToCheckout().then((response: any) => {
        const balToPay: number = response.Model.Order.BalanceToPay

        cy.checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(balToPay).then((response: any) => {
          expect(response, 'Gift Card Payment Instrument ID not returned from DigitalPay').to.not.be.null
          giftCardPayment.payments[0].paymentInstrumentId = response
          giftCardPayment.payments[0].amount = balToPay
        })
        cy.placeOrderViaApiWithPaymentRequest(giftCardPayment)
      })
    })
  })
})