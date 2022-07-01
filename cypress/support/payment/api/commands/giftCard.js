/* eslint-disable no-unused-expressions */

import giftCardDetails from '../../../../fixtures/payment/giftCard.json'
import '../../../giftCardService/api/commands/giftCardService'

Cypress.Commands.add('addGiftCardToAccount', (cardRequest) => {
  cy.request({
    method: 'POST',
    url: Cypress.env('addGiftCardEndpoint'),
    body: cardRequest
  }).then((response) => {
    expect(response.status, 'Gift Card Addition status').to.eq(200)
    expect(response.body, 'Gift Card Addition response body').to.not.be.undefined

    return response.body
  })
})

Cypress.Commands.add('getGCPaymentInstrumentId', (giftCardPaymentResponse) => {
  let paymentInstrumentId = 0
  paymentInstrumentId = giftCardPaymentResponse.GiftCard.PaymentInstrumentId
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
  // Adding a 2 second wait coz sometimes an empty payment instruments is returned even if the test account has registered payment instruments especially the gift cards
  cy.wait(Cypress.config('twoSecondWait'))
  cy.getDigitalPaymentInstruments().as('paymentInstrumentsResponse')
  cy.wait(Cypress.config('twoSecondWait'))

  // Find out the linked gift cards PaymentInstrumentId
  cy.get('@paymentInstrumentsResponse').then((paymentInstruments) => {
    expect(paymentInstruments.GiftCard).to.not.be.null
    expect(paymentInstruments.GiftCard).to.not.be.empty
    expect(paymentInstruments.GiftCard.Enabled).to.be.equal(true)

    const giftcardPaymentInstruments = paymentInstruments.GiftCard.Instruments.filter(instrument => instrument.Allowed && !instrument.Expired && instrument.Balance >= expectedGiftCardBalance)
    cy.log('Already available giftcardPaymentInstruments: ' + JSON.stringify(giftcardPaymentInstruments))

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

// This command is to generate gift cards(s) for payment
Cypress.Commands.add('generateGiftCards', (expectedGiftCardBalance) => {
  const maxAmount = 1000
  let cardsRequired
  let lastCardValue

  // Calculate num of cards and amount in last card
  if (expectedGiftCardBalance >= maxAmount) {
    const remainder = expectedGiftCardBalance % maxAmount
    if (remainder === 0) {
      cardsRequired = expectedGiftCardBalance / maxAmount
      lastCardValue = maxAmount
    } else {
      cardsRequired = (Math.floor(expectedGiftCardBalance / maxAmount)) + 1
      lastCardValue = Math.round(remainder * 100) / 100
    }
  } else {
    cardsRequired = 1
    lastCardValue = expectedGiftCardBalance
  }
  cy.log('Number of cards required is ' + cardsRequired)
  const giftcardPaymentInstrumentIds = []

  // Generate New Cards of required count with maxAmount value
  cy.generateANewGiftCard(maxAmount, cardsRequired).as('newGiftCards')

  // Get Giftcard details and Add to account
  cy.get('@newGiftCards').then((newGiftCards) => {
    newGiftCards.Cards.forEach(function (item, i) {
      giftCardDetails.cardNumber = newGiftCards.Cards[i].CardNumber
      giftCardDetails.pinCode = newGiftCards.Cards[i].CardPin

      // Add the new gift card to account
      cy.addGiftCardToAccount(giftCardDetails).then((response) => {
        cy.log('Added newly created gift card to account: ' + JSON.stringify(giftCardDetails))
        cy.log('Payment instrument id of the newly added giftcard is ' + response.body.GiftCard.PaymentInstrumentId)
        // If last card, set the lastCardValue as amount. Else set the maxAmount
        if (i === (newGiftCards.Cards.length - 1)) {
 giftcardPaymentInstrumentIds.push({ InstrumentId: response.body.GiftCard.PaymentInstrumentId, amount: lastCardValue })
} else {
 giftcardPaymentInstrumentIds.push({ InstrumentId: response.body.GiftCard.PaymentInstrumentId, amount: maxAmount })
}
      })
    })
  })

  // Verify the new gift cards are added
  cy.getDigitalPaymentInstruments().as('paymentInstrumentsResponse')
  cy.get('@paymentInstrumentsResponse').then((paymentInstruments) => {
    expect(paymentInstruments.GiftCard).to.not.be.null
    expect(paymentInstruments.GiftCard).to.not.be.empty
    expect(paymentInstruments.GiftCard.Enabled).to.be.equal(true)
    expect(paymentInstruments.GiftCard.Instruments.length).to.be.gte(cardsRequired)
  })

  cy.log('giftcardPaymentInstrumentIds after adding new gift cards ' + giftcardPaymentInstrumentIds)
  return cy.wrap(giftcardPaymentInstrumentIds).as('giftcardPaymentInstrumentIds')
})

// This command is to make payment using giftcards only
Cypress.Commands.add('payWithGiftCard', (digitalPaymentRequest) => {
  // Get all payment instruments for the logged in user
  cy.getDigitalPaymentInstruments().as('paymentInstrumentsResponse')

  // Verify that there are the linked Gift cards
  cy.get('@paymentInstrumentsResponse').then((paymentInstruments) => {
    expect(paymentInstruments.GiftCard).to.not.be.null
    expect(paymentInstruments.GiftCard).to.not.be.empty
    expect(paymentInstruments.GiftCard.Enabled).to.be.equal(true)
    expect(paymentInstruments.GiftCard.Instruments.length).to.be.greaterThan(0)

    // Pay using Gift cards
    cy.api({
      method: 'POST',
      url: Cypress.env('digitalPaymentEndpoint'),
      body: digitalPaymentRequest
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
  })
})
