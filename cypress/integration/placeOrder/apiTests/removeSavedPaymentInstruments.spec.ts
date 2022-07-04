import TestFilter from '../../../support/TestFilter'
import giftCard from '../../../fixtures/payment/giftCard.json'
import '../../../support/login/api/commands/login'
import '../../../support/payment/api/commands/giftCard'
import '../../../support/checkout/api/commands/checkoutHelper'

TestFilter(['API', 'B2C', 'SPUD', 'Checkout'], () => {
  const creditCard = Cypress.env('creditCard')
  let instrumentId: any

  describe('[API] Remove saved credit and gift cards via API from B2C Customer Account', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
    })

    it('Should remove via API saved credit cards added to a B2C Customer Account', () => {
      creditCard.save = true

      cy.addCreditCardViaApi(creditCard).then((response: any) => {
        instrumentId = response.paymentInstrument.itemId
        cy.getDigitalPaymentInstruments().then((digiPayResponse: any) => {
          const hasInstrumentId = digiPayResponse.CreditCard.Instruments.filter(
            (instrument: { [x: string]: any }) =>
              instrument.PaymentInstrumentId === instrumentId
          )
          expect(hasInstrumentId, 'Credit Card added to account').to.not.be.null
        })
      })
      cy.removeSavedCreditAndGiftCardsViaAPI().then(() => {
        cy.getDigitalPaymentInstruments().then((response: any) => {
          expect(
            response.CreditCard.Instruments.length,
            'Number of Credit Cards in Customer Account'
          ).to.eql(0)
        })
      })
    })

    it('Should remove via API saved gift cards added to a B2C Customer Account', () => {
      cy.addGiftCardToAccount(giftCard).then((response: any) => {
        instrumentId = response.GiftCard.PaymentInstrumentId
        cy.getDigitalPaymentInstruments().then((response: any) => {
          const hasInstrumentId = response.GiftCard.Instruments.filter(
            (instrument: { [x: string]: any }) =>
              instrument.PaymentInstrumentId === instrumentId
          )
          expect(hasInstrumentId, 'Gift Card added to account').to.not.be.null
        })
      })
      cy.removeSavedCreditAndGiftCardsViaAPI().then(() => {
        cy.getDigitalPaymentInstruments().then((response: any) => {
          expect(
            response.CreditCard.Instruments.length,
            'Number of Gift Cards in Customer Account'
          ).to.eql(0)
        })
      })
    })
  })
})
