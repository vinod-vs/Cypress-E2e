import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import shopper from '../../../fixtures/checkout/paypalShoppers.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/payment/api/commands/paypal'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/checkoutHelper'

TestFilter(['B2C', 'API', 'Checkout', 'SPUD', 'E2E'], () => {
  const searchTerm = 'Kitchen'
  const additionalSearchTerm = 'Fish'
  const trolleyThreshold = 50.0

  describe('[API] Place an order on B2C platform via PayPal with a previously linked account', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginViaApiAndHandle2FA(shopper.ppAccount1)
      cy.removeSavedCreditAndGiftCardsViaAPI()
      cy.clearTrolley()
    })

    it('Should place an order with full payment via a previously linked PayPal account', () => {
      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody.search,
        windowType.FLEET_DELIVERY
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
        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })

      cy.getLinkedPayPalAccountInstrumentId().then((instrumentId: any) => {
        expect(instrumentId, 'PayPal Instrument Id').to.exist
        digitalPayment.payments[0].paymentInstrumentId = instrumentId
        cy.placeOrderViaApiWithPaymentRequest(digitalPayment)
      })
    })
  })
})
