import digitalPayment from '../../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../../fixtures/orderConfirmation/confirmOrderParameter.json'

Cypress.Commands.add('placeOrderViaApiWithAddedCreditCard', (creditCardDetails) => {
  cy.navigateToCheckout().then((response: any) => {
    cy.log('Balance To Pay is: ' + response.Model.Order.BalanceToPay)
    digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay

    cy.navigatingToCreditCardIframe().then((response: any) => {
      creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
    })
  })

  cy.creditcardPayment(creditCardDetails, creditcardSessionHeader).then((response: any) => {
    digitalPayment.payments[0].paymentInstrumentId = response.itemId
  })

  cy.digitalPay(digitalPayment).then((response: any) => {
    confirmOrderParameter.placedOrderId = response.PlacedOrderId
  })

  cy.confirmOrder(confirmOrderParameter).then((response: any) => {
    cy.log('This is the order id: ' + response.Order.OrderId)

    return cy.wrap(response)
  })
})