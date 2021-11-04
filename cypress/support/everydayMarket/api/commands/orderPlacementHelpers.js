/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import addressSearch from '../../../../fixtures/checkout/addressSearch.json'
import { fulfilmentType } from '../../../../fixtures/checkout/fulfilmentType.js'
import { windowType } from '../../../../fixtures/checkout/fulfilmentWindowType.js'
import digitalPaymentRequest from '../../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../../fixtures/payment/creditcardSessionHeader.json'
import giftCardRequest from '../../../../fixtures/payment/giftCard.json'
import confirmOrderRequest from '../../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import './utility'
import '../../../search/api/commands/search'
import '../../../checkout/api/commands/navigateToCheckout'
import '../../../checkout/api/commands/redeemRewardsDollars'
import '../../../payment/api/commands/creditcard'
import '../../../payment/api/commands/giftcard'
import '../../../payment/api/commands/paypal'
import '../../../sideCart/api/commands/addItemsToTrolley'
import '../../../sideCart/api/commands/clearTrolley'
import '../../../payment/api/commands/digitalPayment'
import '../../../payment/api/commands/zero'
import '../../../checkout/api/commands/confirmOrder'
import '../../../invoices/api/commands/commands'
import '../../../fulfilment/api/commands/fulfilment'
import '../../../utilities/api/apiUtilities'

let instrumentIdsArr = []

Cypress.Commands.add('prepareAnySingleLineItemEdmOrder', (searchTerm, quantity) => {
  // Set fulfilment using the new /windows endpoint
  cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearch, windowType.FLEET_DELIVERY)

  // Clear trolley in case there's any item
  cy.clearTrolley()

  // Add EDM items to trolley
  cy.addAvailableEDMItemsToTrolley(searchTerm, quantity)
})

Cypress.Commands.add('prepareAnySingleLineItemWowAndEdmOrder', (searchTerm, quantity) => {
  // Set fulfilment using the new /windows endpoint
  cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearch, windowType.FLEET_DELIVERY)

  // Clear trolley in case there's any item
  cy.clearTrolley()

  // Add both WOW and EDM items to trolley
  cy.addAvailableNonRestrictedWowItemsToTrolley(searchTerm)
  cy.addAvailableEDMItemsToTrolley(searchTerm, quantity)
})

Cypress.Commands.add('completeOrderAmendment', (traderOrderId) => {
  // Start amending the WOW portion of the order
  cy.amendOrder(traderOrderId)

  // Set fulfilment using the new /windows endpoint
  cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearch, windowType.FLEET_DELIVERY)

  // TO-DO: To improve in case existing items or fulfilment window is no longer available

  // Place and confirm the order
  placeOrderUsingCreditCard()
  return payOrder()
})

Cypress.Commands.add('placeOrderUsingCreditCard', () => {
  placeOrderUsingCreditCard()
  return payOrder()
})

Cypress.Commands.add('placeOrderUsingCreditCardAndGiftCard', () => {
  placeOrderUsingCreditCard()
  placeOrderUsingGiftCard()
  return payOrder()
})

function placeOrderUsingCreditCard () {
  // Grab new credit card session Id to be passed on to find Digital pay instrument Id
  cy.navigatingToCreditCardIframe().its('IframeUrl').invoke('split', '/').its(5).as('ccSessionId')
  // Get expected CC to use from env
  cy.getExpectedCCCardDetails()
  
  // Grab Digital pay instrument Id for the test credit card set in the fixture
  cy.get('@ccSessionId').then((ccSessionId) => {
    cy.get('@creditCardToUse').then((creditCardToUse) => {
      cy.creditcardPayment(creditCardToUse, { ...creditcardSessionHeader, creditcardSessionId: ccSessionId }).then((response) => {
        cy.getCCPaymentInstrumentId(response).then((id) => {
          instrumentIdsArr.push(id)
        }) 
      })
    })
  })
}

function placeOrderUsingGiftCard () {
  // Override the fixture with our own test gift card details
  const giftCardReq = {
    ...giftCardRequest,
    cardNumber: "6280005550107005580",
    pinCode: "0869",
    save: false
  }

  // Tokenize the new gift card
  cy.addGiftCardToAccount(giftCardReq).then((response) => {
    // Grab Digital pay instrument Id for the test gift card
    cy.getGCPaymentInstrumentId(response).then((id) => {
      instrumentIdsArr.push(id)
    })
  })
}

function payOrder () {
  // Grab balance to pay to be later passed on to /payment
  cy.navigateToCheckout().its('Model.Order.BalanceToPay').as('balanceToPay')
  cy.get('@balanceToPay').then((amount) => {
    if (amount > 0) {
      if (instrumentIdsArr.length == 1) {
        // Pay using 1 main payment instrument only, e.g. credit card or PayPal
        // Call digital pay endpoint to confirm the order
        // Passed the value in the aliases as /payment request body
        cy.digitalPay({
          ...digitalPaymentRequest,
          payments: [{
            ...digitalPaymentRequest.payments[0],
            amount: amount,
            paymentInstrumentId: instrumentIdsArr[0]
          }]
        }).its('PlacedOrderId').as('traderPlacedOrderId')
      } else if (instrumentIdsArr.length > 1) {
        // Pay using mixed payment, e.g. credit card-gift card or PayPal-gift card
        cy.digitalPay({
          ...digitalPaymentRequest,
          payments: [{
            ...digitalPaymentRequest.payments[0],
            amount: amount-0.01,
            paymentInstrumentId: instrumentIdsArr[0]
          },{
            ...digitalPaymentRequest.payments[1],
            amount: 0.01,
            paymentInstrumentId: instrumentIdsArr[1]
          }]
        }).its('PlacedOrderId').as('traderPlacedOrderId')
      } else {
        cy.log('No payment instrument detected')
      }
    } else {
      // Balance to pay is equal or less than 0
      // Call zero endpoint to confirm the order
      cy.zero().its('PlacedOrderId').as('traderPlacedOrderId')
    }
  })

  getTraderPlacedOrderId()
}

function getTraderPlacedOrderId () {
  cy.get('@traderPlacedOrderId').then((traderPlacedOrderId) => {
    return cy.confirmOrder({ ...confirmOrderRequest, placedOrderId: traderPlacedOrderId })
  })
}