import digitalPayment from '../../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import './navigateToCheckout'
import '../../../payment/api/commands/creditcard'
import '../../../payment/api/commands/digitalPayment'
import './confirmOrder'

Cypress.Commands.add(
  'placeOrderViaApiWithAddedCreditCard',
  (platform: string, creditCardDetails?: any) => {
    cy.navigateToCheckout().then((response: any) => {
      const balanceToPay = response.Model.Order.BalanceToPay
      expect(balanceToPay, 'Balance To Pay').to.be.greaterThan(0)

      digitalPayment.payments[0].amount = balanceToPay

      cy.navigatingToCreditCardIframe().then((response: any) => {
        expect(
          response.Success,
          'Credit card iframe endpoint connection success status?'
        ).to.be.true
        creditcardSessionHeader.creditcardSessionId =
          response.IframeUrl.toString().split('/')[5]
      })
    })

    let creditCardRequest

    if (typeof creditCardDetails !== 'undefined') {
      creditCardRequest = creditCardDetails
    } else {
      creditCardRequest = Cypress.env('creditCard')
    }

    cy.creditcardTokenisation(creditCardRequest, creditcardSessionHeader).then(
      (response: any) => {
        if (platform.toUpperCase() === 'B2C') {
          digitalPayment.payments[0].paymentInstrumentId =
            response.paymentInstrument.itemId
        } else if (platform.toUpperCase() === 'B2B') {
          digitalPayment.payments[0].paymentInstrumentId = response.itemId
        }
      }
    )

    cy.digitalPay(digitalPayment).then((response: any) => {
      if (
        response.TransactionReceipt === null ||
        response.PlacedOrderId === null
      ) {
        cy.checkForOrderPlacementErrorsAndThrow(response)
      } else {
        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      }
    })

    cy.confirmOrder(confirmOrderParameter).then((response: any) => {
      cy.log('This is the order id: ' + response.Order.OrderId)

      return cy.wrap(response)
    })
  }
)

Cypress.Commands.add(
  'checkForOrderPlacementErrorsAndThrow',
  (paymentResponse) => {
    const orderPlacementErrors = paymentResponse.OrderPlacementErrors

    if (orderPlacementErrors !== null) {
      const type = orderPlacementErrors[0].Type
      const message = orderPlacementErrors[0].Message
      throw new Error(
        'Error on Payment.' +
          '\n' +
          'Type is: ' +
          type +
          '.' +
          '\n' +
          'Message is: ' +
          message
      )
    }
  }
)

Cypress.Commands.add('placeOrderViaApiWithPaymentRequest', (paymentRequest) => {
  cy.digitalPay(paymentRequest).then((response: any) => {
    if (response.PaymentResponses !== null) {
      cy.log('Payment Responses exist: ' + response.PaymentResponses.length)
      cy.get(response.PaymentResponses)
        .each((instrument: any) => {
          cy.log(
            'External Service Message for instrument ' +
              instrument.PaymentInstrumentType +
              ' is: ' +
              instrument.ExternalServiceMessage
          )
          expect(
            instrument.ErrorCode,
            'Error Code on Payment Instrument Type of ' +
              instrument.PaymentInstrumentType
          ).to.be.null
          expect(
            instrument.ErrorMessage,
            'Error Message on Payment Instrument Type of ' +
              instrument.PaymentInstrumentType
          ).to.be.null
        })
        .then(() => {
          cy.checkForOrderPlacementErrorsAndThrow(response).then(() => {
            cy.log('Order Placement response is: ' + JSON.stringify(response))
            expect(response.TransactionReceipt, 'Payment Transaction Receipt')
              .to.not.be.null
            expect(response.PlacedOrderId, 'Order Placement Id').to.not.be.null

            confirmOrderParameter.placedOrderId = response.PlacedOrderId
          })
        })
    } else {
      cy.checkForOrderPlacementErrorsAndThrow(response)
    }
  })

  cy.confirmOrder(confirmOrderParameter).then((response: any) => {
    const orderId = response.Order.OrderId
    expect(orderId, 'Order Placement Id').to.eqls(
      confirmOrderParameter.placedOrderId
    )

    cy.log('This is the order id: ' + response.Order.OrderId)

    return cy.wrap(orderId)
  })
})

Cypress.Commands.add('removeSavedCreditAndGiftCardsViaAPI', () => {
  const digitalPaymentInstruments: any = []

  cy.getDigitalPaymentInstruments().then((response: any) => {
    const creditCards = response.CreditCard.Instruments
    cy.log('Number of Credit Cards to be removed is: ' + creditCards.length)

    const giftCards = response.GiftCard.Instruments
    cy.log('Number of Gift Cards to be removed is: ' + giftCards.length)

    const cards = creditCards.concat(giftCards)
    for (const card of cards) {
      digitalPaymentInstruments.push(card.PaymentInstrumentId)
    }

    for (const instrument of digitalPaymentInstruments) {
      cy.removePaymentInstrument(instrument).then((response: any) => {
        expect(response.Success, 'Removing Card Instrument').to.be.true
      })
    }
  })
})

Cypress.Commands.add(
  'addGiftCardAndCompleteSplitPaymentOrderViaAPI',
  (giftCard, giftCardPaymentAmount, splitPaymentRequest) => {
    // RC 08/02/22: Add existing gift card until Gifting Service authorisation is more stable
    cy.addGiftCardToAccount(giftCard).then(() => {
      cy.checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(
        giftCardPaymentAmount
      ).then((response: any) => {
        expect(response, 'DigitalPay Gift Card Payment Instrument ID').to.exist
        splitPaymentRequest.payments[1].paymentInstrumentId = response
      })
      cy.placeOrderViaApiWithPaymentRequest(splitPaymentRequest)
    })
  }
)
