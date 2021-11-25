import digitalPayment from '../../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import '../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../support/payment/api/commands/creditcard'
import '../../../../support/payment/api/commands/digitalPayment'
import '../../../../support/checkout/api/commands/confirmOrder'

Cypress.Commands.add('placeOrderViaApiWithAddedCreditCard', (creditCardDetails: any, platform: string) => {
  cy.navigateToCheckout().then((response: any) => {
    cy.log('Balance To Pay is: ' + response.Model.Order.BalanceToPay)
    digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay

    cy.navigatingToCreditCardIframe().then((response: any) => {
      creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
    })
  })

  cy.creditcardPayment(creditCardDetails, creditcardSessionHeader).then((response: any) => {
    if (platform.toUpperCase() === 'B2C') {
      digitalPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
    } else if (platform.toUpperCase() === 'B2B') {
      digitalPayment.payments[0].paymentInstrumentId = response.itemId
    }
  })

  cy.digitalPay(digitalPayment).then((response: any) => {
    if (response.PlacedOrderId === null) {
      const errors = response.OrderPlacementErrors
      const type = errors[0].Type
      const message = errors[0].Message
      throw new Error ('Error on Payment: ' + 'Type is: ' + type + '. Message is: ' + message)
    } else {
      confirmOrderParameter.placedOrderId = response.PlacedOrderId
    }
  })

  cy.confirmOrder(confirmOrderParameter).then((response: any) => {
    cy.log('This is the order id: ' + response.Order.OrderId)

    return cy.wrap(response)
  })
})