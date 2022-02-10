import giftCardDetails from '../../../../fixtures/payment/giftCard.json'
import '../../../giftCardService/api/commands/giftCardService'

Cypress.Commands.add('addGiftCardToAccount', (cardRequest) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('addGiftCardEndpoint'),
    body: cardRequest
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getGCPaymentInstrumentId', (giftCardPaymentResponse) => {
  let paymentInstrumentId = 0
  paymentInstrumentId = giftCardPaymentResponse.body.GiftCard.PaymentInstrumentId
  cy.log('Gift card payment instrument ID ' + paymentInstrumentId)

  return cy.wrap(paymentInstrumentId)
})

/**
 * This command first checks if there is already a gift card linked to the test account having the expectedGiftCardBalance.
 * If present, it's paymentInstrumentID returned.
 * If not present, a new gift card of $500 (value of GIFT_CARD_VALUE) is generated and added to the test account. The paymentInstrumentID of this newly added gift card is then returned.
 */
Cypress.Commands.add('checkAndGetGiftCardPaymentInstrumentWithExpectedBalance', (expectedGiftCardBalance) => {
  let giftcardPaymentInstrumentId

  // Get all payment instruments for the logged in user
  cy.getDigitalPaymentInstruments().as('paymentInstrumentsResponse')

  // Find out the linked gift cards PaymentInstrumentId
  cy.get('@paymentInstrumentsResponse').then((paymentInstruments) => {
    expect(paymentInstruments.GiftCard).to.not.be.null
    expect(paymentInstruments.GiftCard).to.not.be.empty
    expect(paymentInstruments.GiftCard.Enabled).to.be.equal(true)

    const giftcardPaymentInstruments = paymentInstruments.GiftCard.Instruments.filter(instrument => instrument.Allowed && !instrument.Expired && instrument.Balance >= expectedGiftCardBalance)
    cy.log('giftcardPaymentInstruments: ' + JSON.stringify(giftcardPaymentInstruments))

    // If there no gift card with the required balance, create a new gift card, add to account and get the paymentInstrumentId of it
    if (giftcardPaymentInstruments.length === 0) {
      // Generate new gift card of $500
      cy.log('There are no gift cards with the expected balance of ' + expectedGiftCardBalance + ' . So, creating a new gift card and adding it to the account.')
      cy.generateANewGiftCard(500).as('newGiftCard')
      cy.log('Generating a new gift card of value: ' + 500)
      cy.get('@newGiftCard').then((newGiftCard) => {
        giftCardDetails.cardNumber = newGiftCard.Cards[0].CardNumber
        giftCardDetails.pinCode = newGiftCard.Cards[0].CardPin
        cy.log('New GC Number is: ' + giftCardDetails.cardNumber)
        cy.log('New GC PIN is: ' + giftCardDetails.pinCode)
        // Add the new gift card to account
        cy.addGiftCardToAccount(giftCardDetails)
        cy.log('Added newly created gift card to account: ' + JSON.stringify(giftCardDetails))
        // Get its paymentInstrumentId
        cy.getDigitalPaymentInstruments().as('paymentInstrumentsResponse')
        cy.get('@paymentInstrumentsResponse').then((paymentInstruments) => {
          expect(paymentInstruments.GiftCard).to.not.be.null
          expect(paymentInstruments.GiftCard).to.not.be.empty
          expect(paymentInstruments.GiftCard.Enabled).to.be.equal(true)
          expect(paymentInstruments.GiftCard.Instruments.length).to.be.greaterThan(0)

          const giftcardPaymentInstruments = paymentInstruments.GiftCard.Instruments.filter(instrument => instrument.Allowed && !instrument.Expired && instrument.Balance >= expectedGiftCardBalance)
          giftcardPaymentInstrumentId = giftcardPaymentInstruments[0].PaymentInstrumentId  
        })
      })
    } else {
      // If there is a gift card with required balance, return the paymentInstrumentId of it
      cy.log('There are ' + giftcardPaymentInstruments.length + ' gift cards with the expected balance of ' + expectedGiftCardBalance + ' . So, returning/using the first.')
      giftcardPaymentInstrumentId = giftcardPaymentInstruments[0].PaymentInstrumentId
    }
    cy.log('Gift Card PaymentInstrumentId is: ' + giftcardPaymentInstrumentId)
    cy.wrap(giftcardPaymentInstrumentId).as('giftcardPaymentInstrumentId')  
  })
})
